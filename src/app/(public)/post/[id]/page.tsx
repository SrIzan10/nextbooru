import LikePost from '@/components/app/LikePost/LikePost';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { validateRequest } from '@/lib/auth';
import prisma from '@/lib/db';
import { Download, Flag, MessageSquare, User, Calendar } from 'lucide-react';
import Image from 'next/image';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await validateRequest();
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id }, include: { author: true } });
  if (!post) {
    return <h1>Post not found</h1>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardContent className="p-0">
              <div className="relative aspect-square w-full">
                <Image
                  src={post.imageUrl}
                  alt="Post image"
                  fill
                  className="rounded-t-lg object-contain"
                  blurDataURL={`data:image/jpeg;base64,${post.previewHash}`}
                  placeholder="blur"
                />
              </div>
              <div className="p-4 flex justify-between items-center">
                <div className="flex space-x-2">
                  <LikePost id={id} liked={user?.likedPosts!.includes(id)!} />
                  <a href={post.imageUrl} download>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </a>
                  <Button variant="outline" size="icon">
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comments
                </Button>
              </div>
            </CardContent>
          </Card>
          <p>comments here</p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold">Image information</h3>
          <div className="flex gap-4">
            <User className="h-6 w-6" />
            <span>Uploaded by {post.author.username}</span>
          </div>
          <div className="flex gap-4">
            <Calendar className="h-6 w-6" />
            <span>Uploaded on: {post.createdAt.toLocaleString()}</span>
          </div>
          <Separator className="my-6" />
          <div className="grid gap-4">
            <h3 className="text-xl font-bold">Description</h3>
            <p>{post.caption}</p>
          </div>
          <Separator className="my-6" />
          <div className="grid gap-4">
            <h3 className="text-xl font-bold">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant={'secondary'} 
                  className="select-none cursor-pointer"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          {/* related images missing */}
        </div>
      </div>
    </div>
  );
}
