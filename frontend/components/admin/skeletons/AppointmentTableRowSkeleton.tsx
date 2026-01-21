import { Skeleton, SkeletonBadge, SkeletonButton } from '@/components/ui/Skeleton';

/**
 * Skeleton pour une ligne de tableau de rendez-vous
 * 
 * Architecture identique à la ligne réelle :
 * - Patient (nom)
 * - Date & Heure
 * - Type de consultation
 * - Statut (badge)
 * - Actions (3 boutons)
 * 
 * Animation : Shimmer + Pulse
 */
export default function AppointmentTableRowSkeleton() {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      {/* Patient */}
      <td className="px-4 py-3">
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </td>

      {/* Date & Heure */}
      <td className="px-4 py-3">
        <div className="space-y-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </td>

      {/* Type */}
      <td className="px-4 py-3">
        <Skeleton className="h-3 w-28" />
      </td>

      {/* Statut */}
      <td className="px-4 py-3">
        <SkeletonBadge />
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </td>
    </tr>
  );
}
