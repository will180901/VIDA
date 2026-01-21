import { Skeleton } from '@/components/ui/Skeleton';
import DatePickerSkeleton from '@/components/ui/skeletons/DatePickerSkeleton';
import TimePickerSkeleton from '@/components/ui/skeletons/TimePickerSkeleton';
import DropdownSkeleton from '@/components/ui/skeletons/DropdownSkeleton';

/**
 * Skeleton pour le modal de réponse à un RDV
 * 
 * Architecture identique à RespondModal :
 * - Header
 * - Résumé du RDV (encadré jaune)
 * - 3 boutons d'action
 * - Formulaire selon l'action
 * 
 * Animation : Shimmer + Pulse
 */
export default function RespondModalSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full border border-gray-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="space-y-1">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Résumé RDV */}
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <Skeleton className="h-4 w-40 mb-3" />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="col-span-2 space-y-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-40 mb-3" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
