'use client';

import { Button } from '@/components/ui/button';
import { upvoteComment } from '@/lib/form/actions';
import { cn } from '@/lib/utils';
import type { Comment } from '@prisma/client';
import { ArrowUp } from 'lucide-react';
import { useState } from 'react';

export default function UpvoteComment(comment: Comment & { userVoted: boolean }) {
  const [loading, setLoading] = useState(false); 
  const [voted, setVoted] = useState(comment.userVoted);
  return (
    <Button
      variant="outline"
      size="smicon"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        upvoteComment(comment.id).then((res) => {
          if (res.success) {
            setVoted(res.action === 'up' ? true : false);
          }
          setLoading(false);
        });
      }}
    >
      <ArrowUp className={cn(voted ? 'text-primary' : '', "h-4 w-4")}  />
    </Button>
  );
}
