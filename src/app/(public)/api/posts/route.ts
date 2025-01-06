import prisma from '@/lib/db';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page')!);
  if (page && isNaN(page)) {
    return new Response('Invalid page number', { status: 400 });
  }

  const queryPosts = await prisma.post.findMany({
    take: 30,
    skip: page * 30,
    orderBy: { createdAt: 'desc' },
  });

  return new Response(JSON.stringify(queryPosts), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
