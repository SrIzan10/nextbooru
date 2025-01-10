'use server';

import zodVerify from '../zodVerify';
import { commentSchema, uploadSchema } from './zod';
import prisma from '../db';
import { validateRequest } from '../auth';
import hashImage from '../hashImage';
import minio from '../services/minio';
import { revalidatePath } from 'next/cache';

export async function create(prev: any, formData: FormData) {
  const { user } = await validateRequest();
  if (!user) {
    return { success: false, message: 'not logged in' };
  }
  const zod = await zodVerify(uploadSchema, formData);
  if (!zod.success) {
    return zod;
  }

  const file = zod.data.file as File;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = `${Date.now()}-${file.name.replaceAll(' ', '_')}`;
  await minio.putObject(process.env.MINIO_BUCKET!, filename, buffer);
  const minioIsSSL = process.env.MINIO_USE_SSL === 'true';
  const savedUrl = `http${minioIsSSL ? 's' : ''}://${process.env.MINIO_ENDPOINT}/${
    process.env.MINIO_BUCKET
  }/${filename}`;

  const imagePreviewHash = await hashImage(buffer);

  const dbCreate = await prisma.post.create({
    data: {
      caption: zod.data.caption,
      tags: zod.data.tags.split(',').map((tag: string) => tag.trim()),
      imageUrl: savedUrl,
      previewHash: imagePreviewHash,
      author: {
        connect: {
          id: user.id,
        },
      },
    },
  });
  return { success: true, id: dbCreate.id };
}

export async function createComment(prev: any, formData: FormData) {
  const { user } = await validateRequest();
  if (!user) {
    return { success: false, message: 'not logged in' };
  }
  const zod = await zodVerify(commentSchema, formData);
  if (!zod.success) {
    return zod;
  }

  await prisma.comment.create({
    data: {
      content: zod.data.content,
      author: {
        connect: {
          id: user.id,
        },
      },
      post: {
        connect: {
          id: zod.data.postId,
        },
      },
      upvotes: 0,
    },
  });
  revalidatePath(`/post/${zod.data.postId}`);
  return { success: true };
}

export async function upvoteComment(commentId: string) {
  const { user } = await validateRequest();
  if (!user) {
    return { success: false, message: 'not logged in' };
  }

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    return { success: false, message: 'comment not found' };
  }

  if (comment.votedBy.includes(user.id)) {
    await prisma.comment.update({
      where: { id: commentId },
      data: {
        upvotes: comment.upvotes - 1,
        votedBy: { set: comment.votedBy.filter((id) => id !== user.id) },
      },
    });
    revalidatePath(`/post/${comment.postId}`);
    return { success: true, action: 'down' };
  } else {
    await prisma.comment.update({
      where: { id: commentId },
      data: { upvotes: comment.upvotes + 1, votedBy: { push: user.id } },
    });
    revalidatePath(`/post/${comment.postId}`);
    return { success: true, action: 'up' };
  }
}
