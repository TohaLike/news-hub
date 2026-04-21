import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email().trim().min(1, 'Введите email').max(255, 'Слишком длинный email'),
  password: z.string().min(1, 'Введите пароль'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Введите имя').max(80, 'Слишком длинное имя'),
  email: z.email().trim().min(1, 'Введите email').max(255, 'Слишком длинный email'),
  password: z.string().min(8, 'Пароль — минимум 8 символов').max(128, 'Слишком длинный пароль'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
