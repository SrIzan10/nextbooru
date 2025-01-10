import prisma from '@/lib/db';
import { UniversalForm } from '../UniversalForm/UniversalForm';
import { createComment, upvoteComment } from '@/lib/form/actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import UpvoteComment from '../UpvoteComment/UpvoteComment';
import { validateRequest } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';

export default async function Comments(props: Props) {
  const { user } = await validateRequest();
  const comments = await prisma.comment.findMany({
    where: { postId: props.id },
    orderBy: { createdAt: 'asc' },
    include: { author: true },
  });

  return (
    <div id="comments">
      <div className="space-y-4 mb-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-4">
            <Avatar>
              <AvatarFallback>{comment.author.username[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{comment.author.username}</p>
              <p>{comment.content}</p>
            </div>
            <div className="flex-grow"></div>
            <div className="flex space-x-4">
              <p>{comment.upvotes}</p>
              <UpvoteComment {...comment} userVoted={comment.votedBy.includes(user?.id!)} />
            </div>
          </div>
        ))}
      </div>
      <UniversalForm
        schemaName="comment"
        fields={[
          { name: 'postId', type: 'hidden', value: props.id, label: 'Post ID' },
          { name: 'content', label: 'Comment', textArea: true, textAreaRows: 3, required: true },
        ]}
        action={createComment}
        submitText="Post comment"
        resetFormOnSubmit
      />
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="flex space-x-4">
      <Skeleton className="h-10 w-10 rounded-full" /> {/* Avatar skeleton */}
      <div className="space-y-2 flex-grow">
        <Skeleton className="h-4 w-24" /> {/* Username skeleton */}
        <Skeleton className="h-4 w-full" /> {/* Content skeleton */}
      </div>
      <div className="flex space-x-4 items-center">
        <Skeleton className="h-4 w-8" /> {/* Upvotes count skeleton */}
        <Skeleton className="h-6 w-6" /> {/* Upvote button skeleton */}
      </div>
    </div>
  );
}

interface Props {
  id: string;
}
