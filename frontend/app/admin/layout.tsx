import { ReactNode } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ToastProvider } from '@/components/ui/Toast';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'staff', 'doctor']}>
      <ToastProvider>
        <div className="flex h-screen overflow-hidden bg-[#F5F5F0] vida-grain-strong">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main Content */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Header */}
            <AdminHeader />
            
            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-4">
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </ProtectedRoute>
  );
}
