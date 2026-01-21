'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, required, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={`w-full px-4 py-2.5 text-sm bg-white/50 border ${
              error ? 'border-red-500' : 'border-gray-200/50'
            } rounded-md outline-none focus:ring-2 focus:ring-vida-teal/20 focus:border-vida-teal transition-all`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-500 italic">{error}</p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';

export default AuthInput;
