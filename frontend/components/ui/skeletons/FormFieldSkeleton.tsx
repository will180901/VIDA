import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Skeleton pour un champ de formulaire
 * 
 * Architecture identique à un champ réel :
 * - Label
 * - Input/Textarea
 * 
 * Animation : Shimmer + Pulse
 */
interface FormFieldSkeletonProps {
  type?: 'input' | 'textarea' | 'select';
  hasLabel?: boolean;
}

export default function FormFieldSkeleton({ 
  type = 'input', 
  hasLabel = true 
}: FormFieldSkeletonProps) {
  return (
    <div className="space-y-1">
      {/* Label */}
      {hasLabel && <Skeleton className="h-3 w-24" />}
      
      {/* Input */}
      {type === 'input' && <Skeleton className="h-10 w-full rounded-md" />}
      
      {/* Textarea */}
      {type === 'textarea' && <Skeleton className="h-24 w-full rounded-md" />}
      
      {/* Select */}
      {type === 'select' && <Skeleton className="h-10 w-full rounded-md" />}
    </div>
  );
}
