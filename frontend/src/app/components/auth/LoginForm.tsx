import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { login, me } from '@/api';
import { loginSchema, type LoginFormValues } from '../../schemas/auth';
import type { User } from '../../types';
import { AuthPasswordField } from './AuthPasswordField';
import { AuthTextField } from './AuthTextField';
import { DEFAULT_AVATAR } from './constants';
import { getApiErrorMessage } from './getApiErrorMessage';

export interface LoginFormProps {
  onAuthenticated: (user: User) => void;
}

export function LoginForm({ onAuthenticated }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const { register, handleSubmit, formState } = form;

  const onSubmit = handleSubmit(async (values) => {
    setRootError(null);
    try {
      await login(values.email, values.password);
      const profile = await me();
      onAuthenticated({
        name: profile.email.split('@')[0] ?? profile.email,
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
        autoComplete="current-password"
        placeholder="Пароль"
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
        {formState.isSubmitting ? 'Вход…' : 'Войти'}
      </button>
    </form>
  );
}
