'use server';

import zodVerify from '../zodVerify';
import { uploadSchema } from './zod';
import prisma from '../db';
import { validateRequest } from '../auth';
import hashImage from '../hashImage';
import minio from '../services/minio';

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
