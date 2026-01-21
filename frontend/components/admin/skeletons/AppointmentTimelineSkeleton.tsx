import { Skeleton, SkeletonCircle } from '@/components/ui/Skeleton';

/**
 * Skeleton pour un item de timeline d'historique
 * 
 * Architecture identique à l'item de timeline :
 * - Cercle (icône) avec ligne verticale
 * - Titre de l'action
 * - Détails (changements)
 * - Timestamp
 * 
 * Animation : Shimmer + Pulse
 */
export default function AppointmentTimelineItemSkeleton() {
  return (
    <div className="relative flex gap-4 pb-6">
      {/* Ligne verticale */}
      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />

      {/* Icône */}
      <SkeletonCircle size="md" />

      {/* Contenu */}
      <div className="flex-1 space-y-2">
        {/* Titre */}
        <Skeleton className="h-4 w-48" />
        
        {/* Détails */}
        <div className="space-y-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        
        {/* Timestamp */}
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

/**
 * Skeleton pour la timeline complète
 */
interface AppointmentTimelineSkeletonProps {
  items?: number;
}

export function AppointmentTimelineSkeleton({ items = 5 }: AppointmentTimelineSkeletonProps) {
  return (
    <div className="space-y-0">
      {Array.from({ length: items }).map((_, i) => (
        <AppointmentTimelineItemSkeleton key={i} />
      ))}
    </div>
  );
}
