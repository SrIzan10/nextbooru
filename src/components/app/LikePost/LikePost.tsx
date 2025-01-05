'use client';

import { Button } from '@/components/ui/button';
import { likePost } from '@/lib/other/actions';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function LikePost(props: Props) {
  const [loading, setLoading] = useState(false); 
  const [liked, setLiked] = useState(props.liked);
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => {
        setLoading(true);
        likePost(props.id).then((res) => {
          setLoading(false);
          if (res.success) {
            setLiked(res.liked!);
          } else {
            switch (res.error) {
              case 'logIn':
                // TODO: redirect to login page
                toast.error('You need to be logged in to like posts');
                break;
              case 'notFound':
                toast.error('Post not found');
                break;
              default:
                toast.error('An error occurred');
                break;
            }
          }
        });
      }}
      disabled={loading}
    >
      <Heart className={cn("h-4 w-4", liked ? 'text-red-500' : '')} />
    </Button>
  );
}

interface Props {
  id: string;
  liked: boolean;
}
