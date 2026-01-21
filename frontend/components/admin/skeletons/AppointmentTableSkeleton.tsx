import { Skeleton } from '@/components/ui/Skeleton';
import AppointmentTableRowSkeleton from './AppointmentTableRowSkeleton';

/**
 * Skeleton pour le tableau complet de rendez-vous
 * 
 * Architecture identique au tableau réel :
 * - Header avec recherche et filtres
 * - Tableau avec 5 lignes
 * - Pagination
 * 
 * Animation : Shimmer + Pulse
 */
interface AppointmentTableSkeletonProps {
  rows?: number;
}

export default function AppointmentTableSkeleton({ rows = 5 }: AppointmentTableSkeletonProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between gap-4">
          {/* Recherche */}
          <Skeleton className="h-10 w-64 rounded-md" />
          
          {/* Filtres */}
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-16" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-24" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-20" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-16" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-16" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <AppointmentTableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
