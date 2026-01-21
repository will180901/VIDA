import StatCardSkeleton from './StatCardSkeleton';
import RecentAppointmentSkeleton from './RecentAppointmentSkeleton';
import QuickActionSkeleton from './QuickActionSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Skeleton pour le dashboard admin complet
 * 
 * Architecture identique au vrai dashboard :
 * - 4 StatCards en haut
 * - Section "Rendez-vous récents" (4 items)
 * - Section "Actions rapides" (4 boutons)
 * 
 * Animation : Shimmer + Pulse
 */
export default function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats Cards (4 colonnes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Rendez-vous récents */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <div className="space-y-2">
          <RecentAppointmentSkeleton />
          <RecentAppointmentSkeleton />
          <RecentAppointmentSkeleton />
          <RecentAppointmentSkeleton />
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionSkeleton />
          <QuickActionSkeleton />
          <QuickActionSkeleton />
          <QuickActionSkeleton />
        </div>
      </div>
    </div>
  );
}
