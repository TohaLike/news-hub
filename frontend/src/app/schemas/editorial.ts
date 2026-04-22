import { z } from 'zod';

export const createEditorialGroupSchema = z.object({
  name: z.string().trim().min(2, 'Название — минимум 2 символа').max(80, 'Слишком длинное название'),
  publisherId: z.coerce.number().int().positive('Выберите издательство'),
});

export type CreateEditorialGroupValues = z.infer<typeof createEditorialGroupSchema>;

export const createGroupPublicationSchema = z.object({
  title: z.string().trim().min(3, 'Заголовок — минимум 3 символа').max(200),
  excerpt: z.string().trim().min(20, 'Лид — минимум 20 символов').max(500),
  content: z.string().trim().min(40, 'Текст — минимум 40 символов').max(20000),
  category: z.string().trim().min(2, 'Укажите рубрику').max(60),
  image: z
    .string()
    .trim()
    .optional()
    .transform((s) => s ?? '')
    .refine((s) => s === '' || /^https?:\/\/.+/i.test(s), {
      message: 'Введите корректный URL изображения или оставьте поле пустым',
    }),
});

export type CreateGroupPublicationValues = z.infer<typeof createGroupPublicationSchema>;
