'use server';

import { writeFile } from 'fs/promises';
import zodVerify from '../zodVerify';
import { uploadSchema } from './zod';
import prisma from '../db';
import { validateRequest } from '../auth';

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

  const buffer = new Uint8Array(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name.replaceAll(' ', '_')}`;
  await writeFile(`./public/uploads/${filename}`, buffer).catch((e) => {
    console.log(e);
    return { success: false, message: 'writing file' };
  });

  const dbCreate = await prisma.post.create({
    data: {
      caption: zod.data.caption,
      tags: zod.data.tags.split(',').map((tag: string) => tag.trim()),
      imageUrl: `/uploads/${filename}`,
      author: {
        connect: {
          id: user.id
        }
      }
    },
  });
  return {  success: true, id: dbCreate.id };
}
