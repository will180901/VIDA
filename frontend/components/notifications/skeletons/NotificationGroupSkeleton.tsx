import { Skeleton } from '@/components/ui/Skeleton';
import NotificationItemSkeleton from './NotificationItemSkeleton';

/**
 * Skeleton pour un groupe de notifications
 * 
 * Architecture identique au groupement réel :
 * - Header de groupe (ex: "Aujourd'hui")
 * - N items skeleton
 * 
 * @param count - Nombre d'items à afficher (défaut: 3)
 */
interface NotificationGroupSkeletonProps {
  count?: number;
}

export default function NotificationGroupSkeleton({ count = 3 }: NotificationGroupSkeletonProps) {
  return (
    <div>
      {/* Header du groupe */}
      <Skeleton className="h-3 w-24 mb-2" />

      {/* Items */}
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <NotificationItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
