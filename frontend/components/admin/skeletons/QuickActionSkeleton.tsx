import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Skeleton pour un bouton d'action rapide
 * 
 * Architecture identique au bouton :
 * - Icône (cercle 32x32px)
 * - Label
 * 
 * Animation : Shimmer + Pulse
 */
export default function QuickActionSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 bg-white">
      {/* Icône */}
      <Skeleton className="h-8 w-8 rounded-full" />
      
      {/* Label */}
      <Skeleton className="h-3 w-24" />
    </div>
  );
}
