import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Skeleton pour une carte de statistique (StatCard)
 * 
 * Architecture identique à StatCard :
 * - Icône (cercle 40x40px)
 * - Label + Valeur
 * - Trend (flèche + pourcentage)
 * 
 * Animation : Shimmer + Pulse
 */
export default function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        {/* Contenu gauche */}
        <div className="flex-1 space-y-3">
          {/* Label */}
          <Skeleton className="h-3 w-32" />
          
          {/* Valeur */}
          <Skeleton className="h-8 w-20" />
          
          {/* Trend */}
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* Icône */}
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  );
}
