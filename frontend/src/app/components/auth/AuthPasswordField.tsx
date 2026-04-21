import type { ComponentPropsWithoutRef } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import type { FieldError } from 'react-hook-form';

type AuthPasswordFieldProps = {
  label: string;
  error?: FieldError;
  showPassword: boolean;
  onToggleShow: () => void;
} & ComponentPropsWithoutRef<'input'>;

export function AuthPasswordField({
  label,
  error,
  showPassword,
  onToggleShow,
  className,
  ...inputProps
}: AuthPasswordFieldProps) {
  return (
    <div>
      <label className="block text-sm mb-2 text-gray-700">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type={showPassword ? 'text' : 'password'}
          className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : ''
          } ${className ?? ''}`}
          {...inputProps}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {error?.message && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
}
