import { cn } from '@/lib/utils';

/**
 * Composant de base Skeleton avec Shimmer + Pulse
 * 
 * Utilisé dans tout le projet pour les états de chargement
 * 
 * Fonctionnalités :
 * - Animation Shimmer (vague de lumière)
 * - Animation Pulse (variation d'opacité)
 * - Variantes : default, circle, text
 * - Personnalisable via className
 * 
 * @example
 * <Skeleton className="h-10 w-full" />
 * <Skeleton variant="circle" className="h-12 w-12" />
 * <SkeletonText lines={3} />
 */

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'circle' | 'text';
}

export function Skeleton({ className, variant = 'default' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-200',
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
        'before:animate-shimmer',
        'animate-pulse',
        variant === 'circle' && 'rounded-full',
        variant === 'text' && 'h-4 rounded',
        variant === 'default' && 'rounded-md',
        className
      )}
      style={{
        backgroundSize: '200% 100%',
      }}
    />
  );
}

/**
 * Skeleton pour un cercle (avatar, icône)
 */
interface SkeletonCircleProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function SkeletonCircle({ size = 'md', className }: SkeletonCircleProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return <Skeleton variant="circle" className={cn(sizeClasses[size], className)} />;
}

/**
 * Skeleton pour du texte (lignes multiples)
 */
interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lastLineWidth?: 'full' | '3/4' | '1/2' | '1/3';
}

export function SkeletonText({ lines = 1, className, lastLineWidth = '3/4' }: SkeletonTextProps) {
  const widthClasses = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn(
            i === lines - 1 && lines > 1 ? widthClasses[lastLineWidth] : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton pour un bouton
 */
interface SkeletonButtonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SkeletonButton({ size = 'md', className }: SkeletonButtonProps) {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32',
  };

  return <Skeleton className={cn(sizeClasses[size], 'rounded-md', className)} />;
}

/**
 * Skeleton pour un badge
 */
interface SkeletonBadgeProps {
  className?: string;
}

export function SkeletonBadge({ className }: SkeletonBadgeProps) {
  return <Skeleton className={cn('h-5 w-16 rounded-full', className)} />;
}

/**
 * Skeleton pour une carte
 */
interface SkeletonCardProps {
  className?: string;
  children?: React.ReactNode;
}

export function SkeletonCard({ className, children }: SkeletonCardProps) {
  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-4', className)}>
      {children}
    </div>
  );
}
