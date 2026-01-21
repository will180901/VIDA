import { Skeleton } from '@/components/ui/Skeleton';
import DatePickerSkeleton from '@/components/ui/skeletons/DatePickerSkeleton';
import TimePickerSkeleton from '@/components/ui/skeletons/TimePickerSkeleton';
import DropdownSkeleton from '@/components/ui/skeletons/DropdownSkeleton';
import FormFieldSkeleton from '@/components/ui/skeletons/FormFieldSkeleton';

/**
 * Skeleton pour le modal d'édition de RDV
 * 
 * Architecture identique à EditAppointmentModal :
 * - Header
 * - Formulaire complet (date, heure, type, motif)
 * - Footer avec boutons
 * 
 * Animation : Shimmer + Pulse
 */
export default function EditModalSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full border border-gray-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Date */}
          <DatePickerSkeleton />
          
          {/* Heure */}
          <TimePickerSkeleton />
          
          {/* Type */}
          <DropdownSkeleton />
          
          {/* Motif */}
          <FormFieldSkeleton type="textarea" />
          
          {/* Notes internes */}
          <FormFieldSkeleton type="textarea" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}
