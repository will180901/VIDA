import { Skeleton, SkeletonCircle, SkeletonText, SkeletonBadge } from '@/components/ui/Skeleton';

/**
 * Skeleton pour un item de notification
 * 
 * Architecture identique à NotificationItem :
 * - Cercle (icône) 32x32px
 * - Titre + Badge "Nouveau"
 * - Message (2 lignes)
 * - Infos patient (optionnel)
 * - Timestamp
 * 
 * Animation : Shimmer + Pulse
 */
export default function NotificationItemSkeleton() {
  return (
    <div className="relative p-3 rounded-lg border border-gray-200 bg-white">
      <div className="flex gap-3">
        {/* Icône */}
        <SkeletonCircle size="md" />

        {/* Contenu */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Titre + Badge */}
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-4 w-3/4" />
            <SkeletonBadge />
          </div>

          {/* Message (2 lignes) */}
          <div className="space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>

          {/* Infos patient */}
          <Skeleton className="h-3 w-1/2" />

          {/* Timestamp */}
          <Skeleton className="h-2 w-24" />
        </div>
      </div>
    </div>
  );
}
