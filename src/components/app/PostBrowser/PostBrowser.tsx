'use client';

import React from 'react';
import InfiniteScroll from '@/components/ui/infinite-scroll';
import { Skeleton } from '@/components/ui/skeleton';
import { Post } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';

export default function PostBrowser() {
  const [page, setPage] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [posts, setPosts] = React.useState<Post[]>([]);

  const next = async () => {
    setLoading(true);
    const res = await fetch(`/api/posts?page=${page}`);
    const newImages = await res.json();
    if (!newImages.length) {
      setHasMore(false);
      setLoading(false);
      return;
    }
    setPosts((prev) => [...prev, ...newImages]);
    setPage((prev) => prev + 1);
    setLoading(false);
  };

  return (
    <InfiniteScroll isLoading={loading} hasMore={hasMore} next={next} threshold={0}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
        {posts.map((post) => (
          <div key={post.id} className="relative aspect-square">
            <Image
              width={176}
              height={176}
              src={post.imageUrl}
              alt=""
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
        {loading &&
          Array.from({ length: page === 0 ? 12 : 2 }).map((_, i) => (
            <div key={i} className="relative aspect-square">
              <Skeleton className="w-full h-full rounded-md border-2 border-dashed" />
            </div>
          ))}
      </div>

      {/* interactionobserver sentinel */}
      <div style={{ height: 1 }} />
    </InfiniteScroll>
  );
}

