'use server'

import { validateRequest } from "../auth"
import prisma from "../db";

export async function likePost(id: string) {
  const { user } = await validateRequest();
  if (!user) {
    return {
      success: false,
      error: 'logIn',
    }
  }

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    return {
      success: false,
      error: 'notFound',
    }
  }
  const userDb = await prisma.user.findUnique({ where: { id: user.id } });
  if (userDb?.likedPosts.includes(id)) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        likedPosts: {
          set: userDb.likedPosts.filter((postId) => postId !== id),
        },
      },
    });
    return {
      success: true,
      liked: false,
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      likedPosts: {
        push: id,
      },
    },
  });
  return {
    success: true,
    liked: true,
  }
}