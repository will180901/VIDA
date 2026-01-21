'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthInputWithValidationProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  isValid?: boolean;
  showValidation?: boolean;
}

const AuthInputWithValidation = forwardRef<HTMLInputElement, AuthInputWithValidationProps>(
  ({ label, error, required, type, isValid, showValidation = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const hasValue = props.value && String(props.value).length > 0;
    const showCheckmark = showValidation && hasValue && isValid && !error;
    const showError = showValidation && hasValue && (error || isValid === false);

    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label} {required && <span className="text-error">*</span>}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={`w-full px-4 py-3 text-sm bg-white border-2 rounded-lg outline-none transition-all duration-200 ${
              error || showError
                ? 'border-error focus:border-error focus:ring-4 focus:ring-error/10'
                : showCheckmark
                ? 'border-success focus:border-success focus:ring-4 focus:ring-success/10'
                : isFocused
                ? 'border-vida-teal focus:ring-4 focus:ring-vida-teal/10'
                : 'border-gray-200 hover:border-gray-300'
            } ${isPassword || showValidation ? 'pr-12' : 'pr-4'}`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-label={label}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />
          
          {/* Password Toggle or Validation Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Validation Icons */}
            {showValidation && hasValue && (
              <AnimatePresence mode="wait">
                {showCheckmark && (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.3, type: 'spring' }}
                  >
                    <CheckCircle className="h-5 w-5 text-success" />
                  </motion.div>
                )}
                {showError && (
                  <motion.div
                    key="error"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.3, type: 'spring' }}
                  >
                    <XCircle className="h-5 w-5 text-error" />
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Password Toggle */}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:text-vida-teal"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              id={`${props.id}-error`}
              className="mt-1.5 text-xs text-error flex items-center gap-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              role="alert"
            >
              <XCircle className="h-3 w-3" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

AuthInputWithValidation.displayName = 'AuthInputWithValidation';

export default AuthInputWithValidation;
