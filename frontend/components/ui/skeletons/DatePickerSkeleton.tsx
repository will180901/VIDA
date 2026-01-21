import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Skeleton pour le DatePicker
 * 
 * Architecture identique au DatePicker :
 * - Label
 * - Input avec icône calendrier
 * 
 * Animation : Shimmer + Pulse
 */
export default function DatePickerSkeleton() {
  return (
    <div className="space-y-1">
      {/* Label */}
      <Skeleton className="h-3 w-16" />
      
      {/* Input avec icône */}
      <div className="relative">
        <Skeleton className="h-10 w-full rounded-md" />
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </div>
    </div>
  );
}
