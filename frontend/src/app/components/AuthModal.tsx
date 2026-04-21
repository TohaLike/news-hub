import { X } from 'lucide-react';
import { useState } from 'react';
import { LoginForm } from './auth/LoginForm';
import { RegisterForm } from './auth/RegisterForm';
import type { User } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onAuthenticated: (user: User) => void;
}

export function AuthModal({ onClose, onAuthenticated }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl">{isLogin ? 'Вход' : 'Регистрация'}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>

        {isLogin ? (
          <LoginForm onAuthenticated={onAuthenticated} />
        ) : (
          <RegisterForm onAuthenticated={onAuthenticated} />
        )}

        <div className="px-6 pb-6">
          <div className="text-center text-sm text-gray-600">
            {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-blue-600 hover:text-blue-700 hover:underline"
            >
              {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
