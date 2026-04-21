import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { FieldError } from 'react-hook-form';

const inputClass = (invalid: boolean) =>
  `w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${invalid ? 'border-red-500' : ''
  }`;

type AuthTextFieldProps = {
  label: string;
  icon: ReactNode;
  error?: FieldError;
} & ComponentPropsWithoutRef<'input'>;

export function AuthTextField({ label, icon, error, className, ...inputProps }: AuthTextFieldProps) {
  return (
    <div>
      <label className="block text-sm mb-2 text-gray-700">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 [&>svg]:block">
          {icon}
        </span>
        <input className={`${inputClass(Boolean(error))} ${className ?? ''}`} {...inputProps} />
      </div>
      {error?.message && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
}
