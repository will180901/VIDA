'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  DollarSign, 
  Package, 
  BarChart3, 
  Settings 
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Rendez-vous', href: '/admin/appointments', icon: Calendar },
  { name: 'Patients', href: '/admin/patients', icon: Users },
  { name: 'Dossiers médicaux', href: '/admin/medical-records', icon: FileText },
  { name: 'Facturation', href: '/admin/billing', icon: DollarSign },
  { name: 'Stock', href: '/admin/inventory', icon: Package },
  { name: 'Rapports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Paramètres', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="text-lg font-bold text-vida-teal tracking-wide font-hero">
            VIDA
          </span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-vida-teal/10 text-vida-teal' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-vida-teal to-vida-teal-dark flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              Admin
            </p>
            <p className="text-xs text-gray-500 truncate">
              admin@vida.cg
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
