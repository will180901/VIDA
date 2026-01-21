import { Skeleton } from '@/components/ui/Skeleton';
import FormFieldSkeleton from './FormFieldSkeleton';

/**
 * Skeleton pour un modal générique
 * 
 * Architecture identique à un modal :
 * - Header (titre + bouton fermer)
 * - Content (formulaire)
 * - Footer (boutons actions)
 * 
 * Animation : Shimmer + Pulse
 */
interface ModalSkeletonProps {
  fields?: number;
  hasFooter?: boolean;
}

export default function ModalSkeleton({ 
  fields = 3, 
  hasFooter = true 
}: ModalSkeletonProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {Array.from({ length: fields }).map((_, i) => (
            <FormFieldSkeleton key={i} />
          ))}
        </div>

        {/* Footer */}
        {hasFooter && (
          <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        )}
      </div>
    </div>
  );
}
