'use client';

import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';

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
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
