import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Skeleton pour un Dropdown
 * 
 * Architecture identique au Dropdown :
 * - Label
 * - Select avec icône flèche
 * 
 * Animation : Shimmer + Pulse
 */
export default function DropdownSkeleton() {
  return (
    <div className="space-y-1">
      {/* Label */}
      <Skeleton className="h-3 w-32" />
      
      {/* Select avec icône */}
      <div className="relative">
        <Skeleton className="h-10 w-full rounded-md" />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Skeleton className="h-3 w-3 rounded" />
        </div>
      </div>
    </div>
  );
}
