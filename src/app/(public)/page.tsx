import prisma from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
  const posts = await prisma.post.findMany({ take: 30 });
  return (
    <div className='text-center pt-2'>
      <h1>This is nextbooru</h1>
      <p>The simplest and most modern booru software.</p>
      <p className='text-sm text-muted-foreground italic'>(very unstable and not feature complete!)</p>
      <div className="flex gap-4 p-4">
        {posts.map((post) => (
          <div key={post.id}>
            <Link href={`/post/${post.id}`}>
              <Image width={176} height={176} src={post.imageUrl} alt={''} className="aspect-square object-contain border-2 rounded-md border-dashed" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
