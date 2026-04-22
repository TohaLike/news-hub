import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { login, me } from '@/api';
import { loginSchema, type LoginFormValues } from '../../schemas/auth';
import type { User } from '../../types';
import { userFromMe } from '../../lib/sessionUser';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { getApiErrorMessage } from './getApiErrorMessage';

export type { LoginFormValues } from '../../schemas/auth';

export interface LoginFormProps {
  onAuthenticated: (user: User) => void;
}

export function LoginForm({ onAuthenticated }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onSubmit',
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setRootError(null);
    try {
      await login(values.email, values.password);
      const profile = await me();
      onAuthenticated(userFromMe(profile));
    } catch (e) {
      setRootError(getApiErrorMessage(e));
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="p-6 space-y-4" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="example@mail.com"
                    className="pl-9"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пароль</FormLabel>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <FormControl>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Пароль"
                    className="pl-9 pr-10"
                    {...field}
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {rootError ? <p className="text-destructive text-sm">{rootError}</p> : null}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Вход…' : 'Войти'}
        </Button>
      </form>
    </Form>
  );
}
