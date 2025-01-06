import prisma from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
  const posts = await prisma.post.findMany({ take: 30, orderBy: { createdAt: 'desc' } });
  return (
    <div className="text-center pt-2">
      <h1>This is nextbooru</h1>
      <p>The simplest and most modern booru software.</p>
      <p className="text-sm text-muted-foreground italic">
        (very unstable and not feature complete!)
      </p>
      {Boolean(process.env.SAFEBOORU_PULL) && (
        <p className="text-red-300">
          Development instance is pulling the first 30 safebooru images it finds for demonstration
          purposes.
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
        {posts.map((post) => (
          <div key={post.id} className="relative aspect-square">
            <Image
              width={176}
              height={176}
              src={post.imageUrl}
              alt={''}
              className="w-full h-full object-contain border-2 rounded-md border-dashed pointer-events-none"
              blurDataURL={`data:image/jpeg;base64,${post.previewHash}`}
              placeholder="blur"
            />
            <Link
              href={`/post/${post.id}`}
              className="absolute inset-0 z-10 hover:bg-muted-foreground/5"
              aria-label="View post details"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
