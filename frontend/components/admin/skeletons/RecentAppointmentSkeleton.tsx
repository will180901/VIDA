import { Skeleton, SkeletonBadge } from '@/components/ui/Skeleton';

/**
 * Skeleton pour un item de rendez-vous récent
 * 
 * Architecture identique à l'item de la liste :
 * - Nom du patient
 * - Date & Heure
 * - Badge statut
 * 
 * Animation : Shimmer + Pulse
 */
export default function RecentAppointmentSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
      {/* Infos patient */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-32" />
      </div>

      {/* Badge statut */}
      <SkeletonBadge />
    </div>
  );
}
