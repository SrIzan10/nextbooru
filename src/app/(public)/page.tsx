import PostBrowser from '@/components/app/PostBrowser/PostBrowser';
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
          This development instance pulls some safebooru images for testing.
        </p>
      )}
      <PostBrowser />
    </div>
  );
}
