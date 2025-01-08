import PostBrowser from '@/components/app/PostBrowser/PostBrowser';

export default async function Home() {
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
