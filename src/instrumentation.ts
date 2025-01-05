import prisma from './lib/db';

export async function register() {
  if (process.env.SAFEBOORU_PULL !== 'true') return;
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { CronJob } = await import('cron');
    const crypto = await import('crypto');
    const { generateId } = await import('lucia');
    const fs = await import('fs/promises');
    const { default: hashImage } = await import('@/lib/hashImage');
    const { glob } = await import('glob');

    const job = async () => {
      console.log('Deleting prior safebooru posts and accounts...');
      await prisma.post.deleteMany({
        where: { author: { username: { startsWith: 'safebooru-' } } },
      });
      await prisma.user.deleteMany({ where: { username: { startsWith: 'safebooru-' } } });
      const files = await glob('public/uploads/safebooru-*.jpg');
      await Promise.all(files.map((file) => fs.rm(file, { force: true })));

      console.log('Pulling safebooru images...');
      console.log('Fetching...');
      const res = await fetch(
        'https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=30',
        { headers: { 'User-Agent': 'nextbooru' } }
      );
      const posts = await res.json();

      const genId = generateId(6);

      console.log('Creating account...');
      const account = await prisma.user.create({
        data: {
          username: `safebooru-${genId}`,
          hashed_password: crypto.randomUUID(),
        },
      });

      console.log('Downloading all images...');
      for (const post of posts) {
        const imageUrl = await fetch(post.file_url).then((res) => res.arrayBuffer());
        const savedFilename = `public/uploads/safebooru-${genId}-${post.id}.jpg`;
        await fs.writeFile(savedFilename, new Uint8Array(imageUrl));
        const previewHash = await hashImage(Buffer.from(imageUrl));
        await prisma.post.create({
          data: {
            imageUrl: savedFilename.replace('public', ''),
            previewHash,
            authorId: account.id,
            tags: post.tags.split(' '),
            caption: post.source,
          },
        });
        console.log(`Downloaded id ${post.id}`);
      }
    };

    await job();

    new CronJob('0 */2 * * *', async () => await job(), null, true);
  }
}
