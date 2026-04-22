import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, Eye, EyeOff, Lock, Mail, Newspaper, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { me, register as registerAccount } from '@/api';
import { registerSchema, type RegisterFormValues } from '../../schemas/auth';
import type { User } from '../../types';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '../ui/utils';
import { userFromMe } from '../../lib/sessionUser';
import { getApiErrorMessage } from './getApiErrorMessage';

export type { RegisterFormValues } from '../../schemas/auth';

export interface RegisterFormProps {
  onAuthenticated: (user: User) => void;
}

export function RegisterForm({ onAuthenticated }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      accountType: 'reader',
      email: '',
      password: '',
    },
    mode: 'onSubmit',
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setRootError(null);
    try {
      await registerAccount(values.email, values.password);
      const profile = await me();
      onAuthenticated(
        userFromMe(profile, values.name.trim(), values.accountType),
      );
    } catch (e) {
      setRootError(getApiErrorMessage(e));
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="p-6 space-y-4" noValidate>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имя</FormLabel>
              <div className="relative">
                <UserIcon
                  className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <FormControl>
                  <Input
                    type="text"
                    autoComplete="name"
                    placeholder="Как к вам обращаться"
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
          name="accountType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base">Тип аккаунта</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                >
                  <Label
                    htmlFor="acct-reader"
                    className={cn(
                      'relative block cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200',
                      'hover:-translate-y-0.5 hover:shadow-md',
                      field.value === 'reader'
                        ? 'border-blue-600 bg-gradient-to-br from-blue-50 via-white to-blue-50/80 shadow-md ring-2 ring-blue-600/20'
                        : 'border-muted bg-card hover:border-blue-200/80 hover:bg-muted/30',
                    )}
                  >
                    <RadioGroupItem
                      value="reader"
                      id="acct-reader"
                      className="absolute right-3 top-3 size-4 border-blue-600 text-blue-600"
                    />
                    <div className="flex flex-col gap-3 pr-7">
                      <span
                        className={cn(
                          'flex size-11 items-center justify-center rounded-xl',
                          field.value === 'reader'
                            ? 'bg-blue-600 text-white shadow-inner'
                            : 'bg-blue-100/80 text-blue-700',
                        )}
                      >
                        <BookOpen className="size-5" strokeWidth={2} />
                      </span>
                      <div className="space-y-1">
                        <span className="block font-semibold text-foreground">Читатель</span>
                        <span className="block text-muted-foreground text-sm leading-relaxed">
                          Читайте ленту, оставляйте комментарии и ведите профиль
                        </span>
                      </div>
                    </div>
                  </Label>

                  <Label
                    htmlFor="acct-publisher"
                    className={cn(
                      'relative block cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200',
                      'hover:-translate-y-0.5 hover:shadow-md',
                      field.value === 'publisher'
                        ? 'border-violet-600 bg-gradient-to-br from-violet-50 via-white to-violet-50/80 shadow-md ring-2 ring-violet-600/20'
                        : 'border-muted bg-card hover:border-violet-200/80 hover:bg-muted/30',
                    )}
                  >
                    <RadioGroupItem
                      value="publisher"
                      id="acct-publisher"
                      className="absolute right-3 top-3 size-4 border-violet-600 text-violet-600"
                    />
                    <div className="flex flex-col gap-3 pr-7">
                      <span
                        className={cn(
                          'flex size-11 items-center justify-center rounded-xl',
                          field.value === 'publisher'
                            ? 'bg-violet-600 text-white shadow-inner'
                            : 'bg-violet-100/80 text-violet-700',
                        )}
                      >
                        <Newspaper className="size-5" strokeWidth={2} />
                      </span>
                      <div className="space-y-1">
                        <span className="block font-semibold text-foreground">Издатель</span>
                        <span className="block text-muted-foreground text-sm leading-relaxed">
                          Публикуйте новости и управляйте своим каналом
                        </span>
                      </div>
                    </div>
                  </Label>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                    autoComplete="new-password"
                    placeholder="Минимум 8 символов"
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
          {form.formState.isSubmitting ? 'Регистрация…' : 'Зарегистрироваться'}
        </Button>
      </form>
    </Form>
  );
}
