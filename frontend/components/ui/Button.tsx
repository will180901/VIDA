import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded font-semibold transition-all duration-100 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vida-teal focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-vida-teal text-white hover:bg-vida-teal-dark shadow-vida-1 hover:shadow-vida-3 active:shadow-vida-1',
      secondary: 'bg-white text-vida-teal border-2 border-vida-teal hover:bg-vida-teal hover:text-white shadow-vida-1 hover:shadow-vida-3',
      outline: 'border-2 border-vida-teal text-vida-teal bg-transparent hover:bg-vida-teal hover:text-white hover:shadow-vida-2',
      ghost: 'border border-white/40 text-white bg-transparent hover:bg-white/10 hover:border-white hover:text-white hover:shadow-vida-1',
      destructive: 'bg-vida-red text-white hover:bg-red-700 shadow-vida-1 hover:shadow-vida-3 active:shadow-vida-1',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };
    
    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
