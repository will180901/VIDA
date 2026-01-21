'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle } from 'lucide-react';

interface LegalCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  linkText: string;
  linkHref: string;
  error?: string;
}

const LegalCheckbox = forwardRef<HTMLInputElement, LegalCheckboxProps>(
  ({ label, linkText, linkHref, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              className={`w-5 h-5 text-vida-teal border-2 rounded cursor-pointer transition-all duration-200 focus:ring-4 focus:ring-vida-teal/20 ${
                error
                  ? 'border-error focus:ring-error/20'
                  : 'border-gray-300 hover:border-vida-teal'
              }`}
              aria-invalid={!!error}
              aria-describedby={error ? `${props.id}-error` : undefined}
              {...props}
            />
          </div>
          <span className="text-sm text-gray-600 leading-relaxed flex-1">
            {label}{' '}
            <Link
              href={linkHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-vida-teal font-medium hover:text-vida-teal-dark underline transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {linkText}
            </Link>
          </span>
        </label>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              id={`${props.id}-error`}
              className="mt-1.5 ml-8 text-xs text-error flex items-center gap-1"
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

LegalCheckbox.displayName = 'LegalCheckbox';

export default LegalCheckbox;
