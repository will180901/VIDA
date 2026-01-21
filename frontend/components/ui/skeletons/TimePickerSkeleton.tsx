import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Skeleton pour le TimePicker
 * 
 * Architecture identique au TimePicker :
 * - Label
 * - Grille de créneaux (matin + après-midi)
 * 
 * Animation : Shimmer + Pulse
 */
export default function TimePickerSkeleton() {
  return (
    <div className="space-y-3">
      {/* Label */}
      <Skeleton className="h-3 w-16" />
      
      {/* Matin */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-12" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-md" />
          ))}
        </div>
      </div>
      
      {/* Après-midi */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
