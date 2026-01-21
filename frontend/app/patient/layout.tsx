import { ReactNode } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <div className="min-h-screen bg-[#F5F5F0] vida-grain-strong">
        {/* Header Patient (à créer) */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-vida-teal font-heading">
                VIDA - Espace Patient
              </h1>
              {/* Navigation patient à ajouter */}
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
