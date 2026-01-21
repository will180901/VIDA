import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'teal' | 'orange' | 'gray';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'teal', children, ...props }, ref) => {
    const variants = {
      teal: 'bg-vida-teal/10 text-vida-teal',
      orange: 'bg-vida-orange/10 text-vida-orange',
      gray: 'bg-gray-100 text-gray-700',
    };
    
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded px-2.5 py-0.5 text-xs font-semibold',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
