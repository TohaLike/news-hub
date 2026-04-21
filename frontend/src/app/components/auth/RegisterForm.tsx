import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { me, register as registerAccount } from '@/api';
import { registerSchema, type RegisterFormValues } from '../../schemas/auth';
import type { User } from '../../types';
import { AuthPasswordField } from './AuthPasswordField';
import { AuthTextField } from './AuthTextField';
import { DEFAULT_AVATAR } from './constants';
import { getApiErrorMessage } from './getApiErrorMessage';

export interface RegisterFormProps {
  onAuthenticated: (user: User) => void;
}

export function RegisterForm({ onAuthenticated }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const { register, handleSubmit, formState } = form;

  const onSubmit = handleSubmit(async (values) => {
    setRootError(null);
    try {
      await registerAccount(values.email, values.password);
      const profile = await me();
      onAuthenticated({
        name: values.name,
        email: profile.email,
        avatar: DEFAULT_AVATAR,
      });
    } catch (e) {
      setRootError(getApiErrorMessage(e));
    }
  });

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-4">
      <AuthTextField
        label="Имя"
        icon={<UserIcon size={20} />}
        type="text"
        autoComplete="name"
        placeholder="Введите ваше имя"
        error={formState.errors.name}
        {...register('name')}
      />
      <AuthTextField
        label="Email"
        icon={<Mail size={20} />}
        type="email"
        autoComplete="email"
        placeholder="example@mail.com"
        error={formState.errors.email}
        {...register('email')}
      />
      <AuthPasswordField
        label="Пароль"
        autoComplete="new-password"
        placeholder="Минимум 8 символов"
        error={formState.errors.password}
        showPassword={showPassword}
        onToggleShow={() => setShowPassword((v) => !v)}
        {...register('password')}
      />
      {rootError && <p className="text-red-500 text-sm">{rootError}</p>}
      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        {formState.isSubmitting ? 'Регистрация…' : 'Зарегистрироваться'}
      </button>
    </form>
  );
}
