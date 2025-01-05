import { z } from 'zod';

export const accountSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Mininum 3 characters' })
    .max(31, { message: 'Maximum 31 characters' })
    .regex(/^[a-z0-9_-]+$/, { message: 'Only characters from a-z, 0-9, underscores and dashes' }),
  password: z
    .string()
    .min(6, { message: 'Minimum 6 characters' })
    .max(255, { message: 'Maximum 255 characters' }),
});

export const uploadSchema = z.object({
  file: z
    .any()
    .refine((file: File) => file?.name !== '', 'No file name found.')
    .refine((file) => file.size < 5000000, 'Max size is 5MB.'),
  caption: z.string().min(1),
  tags: z.string().min(1),
});
