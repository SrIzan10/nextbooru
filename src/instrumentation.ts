import prisma from './lib/db';
import ephemeralStorage from './lib/services/ephemeralStorage';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const crypto = await import('crypto');
    const { generateId } = await import('lucia');
    const { default: hashImage } = await import('@/lib/hashImage');
    const minio = (await import('@/lib/services/minio')).default;
    const { performance } = await import('perf_hooks');
    
    const safebooruJob = async () => {
      if (process.env.SAFEBOORU_PULL !== 'true') return;
      console.log('Deleting prior safebooru posts and accounts...');
      await prisma.post.deleteMany({
        where: { author: { username: { startsWith: 'safebooru-' } } },
      });
      await prisma.user.deleteMany({ where: { username: { startsWith: 'safebooru-' } } });

      const minioIsSSL = process.env.MINIO_USE_SSL === 'true';
      const objectStream = minio.listObjects(process.env.MINIO_BUCKET!, 'safebooru-');
      const objectList = [];
      for await (const obj of objectStream) {
        objectList.push(obj.name);
      }
      await minio.removeObjects(process.env.MINIO_BUCKET!, objectList);

      console.log('Pulling safebooru images...');
      console.log('Fetching...');
      const res = await fetch(
        'https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=300',
        { headers: { 'User-Agent': 'nextbooru' } }
      );
      const posts = await res.json();
      
      console.log('Creating account...');
      const genId = generateId(6);
      const account = await prisma.user.create({
        data: {
          username: `safebooru-${genId}`,
          hashed_password: crypto.randomUUID(),
        },
      });

      console.log('Downloading all images...');
      for (const post of posts) {
        const imageUrl = await fetch(post.file_url).then((res) => res.arrayBuffer());
        const savedFilename = `http${minioIsSSL ? 's' : ''}://${process.env.MINIO_ENDPOINT}/${
          process.env.MINIO_BUCKET
        }/safebooru-${genId}-${post.id}.jpg`;
        await minio.putObject(
          process.env.MINIO_BUCKET!,
          `safebooru-${genId}-${post.id}.jpg`,
          Buffer.from(imageUrl)
        );
        const previewHash = await hashImage(Buffer.from(imageUrl));
        await prisma.post.create({
          data: {
            imageUrl: savedFilename.replace('public', ''),
            previewHash,
            authorId: account.id,
            tags: post.tags.split(' '),
            caption: post.source || '',
          },
        });
        console.log(`Downloaded id ${post.id}`);
      }
    };
    // await safebooruJob();

    const writeTagsToEphemeral = async () => {
      // TODO: move tags to another table. this is a temporary and inefficient solution.
      const perfStart = performance.now();
      const posts = await prisma.post.findMany({ select: { tags: true } });
      const tags = posts.flatMap((post) => post.tags);

      const occurrences: Record<string, number> = {};
      for (const tag of tags) {
        if (occurrences[tag]) {
          occurrences[tag]++;
        } else {
          occurrences[tag] = 1;
        }
      }

      await ephemeralStorage.clear('tag')
      for (const [tag, count] of Object.entries(occurrences)) {
        await ephemeralStorage.set(`tag:${tag}`, count);
      }
      const perfEnd = performance.now();

      console.log(`Writing tags to ephemeral took ${Math.round(perfEnd - perfStart)}ms`);
    }
    await writeTagsToEphemeral();
  }
}
