'use client';

import { usePathname } from 'next/navigation';
import NotificationButton from '@/components/notifications/NotificationButton';

const breadcrumbMap: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/appointments': 'Rendez-vous',
  '/admin/patients': 'Patients',
  '/admin/medical-records': 'Dossiers médicaux',
  '/admin/billing': 'Facturation',
  '/admin/inventory': 'Stock',
  '/admin/reports': 'Rapports',
  '/admin/settings': 'Paramètres',
};

export default function AdminHeader() {
  const pathname = usePathname();
  const currentPage = breadcrumbMap[pathname] || 'Admin';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Admin</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{currentPage}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationButton />
      </div>
    </header>
  );
}
