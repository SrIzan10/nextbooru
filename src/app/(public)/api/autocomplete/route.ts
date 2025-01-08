import ephemeralStorage from '@/lib/services/ephemeralStorage';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')!.toLowerCase().split(' ').at(-1);
  if (query !== '' && !query) {
    return new Response('Invalid query', { status: 400 });
  }

  const tags = await ephemeralStorage.keys('tag');
  const filteredTags = tags.filter((tag) => tag.replace('tag:', '').includes(query));

  const mappedTags = await Promise.all(
    filteredTags.map(async (t) => {
      const getTag = parseInt((await ephemeralStorage.get(t)) as string);
      return { tag: t.replace('tag:', ''), count: getTag };
    })
  );
  mappedTags.sort((a, b) => {
    return b.count - a.count;
  });

  return new Response(JSON.stringify(mappedTags), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
