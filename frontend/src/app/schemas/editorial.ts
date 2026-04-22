import { z } from 'zod';
import { NEWS_RUBRICS } from '../constants/rubrics';

export const createEditorialGroupSchema = z.object({
  name: z.string().trim().min(2, 'Название — минимум 2 символа').max(80, 'Слишком длинное название'),
});

export type CreateEditorialGroupValues = z.infer<typeof createEditorialGroupSchema>;

const rubricEnum = z.enum(NEWS_RUBRICS as unknown as [string, ...string[]], {
  message: 'Выберите рубрику из списка',
});

export const createGroupPublicationSchema = z.object({
  title: z.string().trim().min(3, 'Заголовок — минимум 3 символа').max(200),
  excerpt: z.string().trim().min(20, 'Лид — минимум 20 символов').max(500),
  content: z.string().trim().min(40, 'Текст — минимум 40 символов').max(20000),
  category: rubricEnum,
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
