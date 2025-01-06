import { Skeleton } from '@/components/ui/skeleton';
import prisma from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';

export default async function RelatedImages(props: Props) {
  const calculatePosts = await weightedPosts(props.id);
  return (
    <>
      <h3 className="text-xl font-bold">Related images</h3>
      <div className="grid grid-cols-2 gap-2">
        {calculatePosts.map((post) => (
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
    </>
  );
}

export function RelatedImagesSkeleton() {
  return (
    <>
      <h3 className="text-xl font-bold">Related images</h3>
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="relative aspect-square">
            <Skeleton className="w-full h-full rounded-md" />
          </div>
        ))}
      </div>
    </>
  );
}

async function weightedPosts(postId: string, limit = 4) {
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { tags: true } });
  if (!post) return [];

  const candidates = await prisma.post.findMany({
    where: {
      id: { not: postId },
      tags: {
        hasSome: post.tags,
      },
    },
    take: limit,
  });

  // chatgpt coming in clutch for MATHS :cold_face:
  const scored = candidates.map((candidate) => {
    const matchings = candidate.tags.filter((tag) => post.tags.includes(tag));
    const score = matchings.length / Math.sqrt(candidate.tags.length * post.tags.length);
    return { ...candidate, score };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

interface Props {
  id: string;
}
