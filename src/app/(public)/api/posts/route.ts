import prisma from '@/lib/db';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page')!);
  const query = searchParams.get('q')?.trim().split(' ')!;
  if (page && isNaN(page)) {
    return new Response('Invalid page number', { status: 400 });
  }
  if (!query.length) {
    return new Response('Invalid query', { status: 400 });
  }

  // TODO: negative tags
  const queryPosts = await prisma.post.findMany({
    take: 30,
    skip: page * 30,
    orderBy: { createdAt: 'desc' },
    where: {
      tags: {
        hasEvery: query[0] !== '' ? query : [],
      },
    },
  });

  return new Response(JSON.stringify(queryPosts), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
