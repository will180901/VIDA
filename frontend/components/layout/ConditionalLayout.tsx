'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import GradientMeshBackground from '@/components/ui/GradientMeshBackground';

interface ConditionalLayoutProps {
  children: ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Pages d'authentification (sans Header/Footer)
  const isAuthPage = pathname?.startsWith('/connexion') || 
                     pathname?.startsWith('/inscription') || 
                     pathname?.startsWith('/mot-de-passe-oublie');
  
  // Pages admin (sans Header/Footer du site vitrine)
  const isAdminPage = pathname?.startsWith('/admin');
  
  // Pages légales (sans Header mais avec Footer)
  const isLegalPage = pathname?.startsWith('/cgu') || 
                      pathname?.startsWith('/politique-confidentialite');

  // Si page auth ou admin, retourner seulement les children
  if (isAuthPage || isAdminPage) {
    return <>{children}</>;
  }

  // Si page légale, retourner children + Footer (sans Header)
  if (isLegalPage) {
    return (
      <>
        {children}
        <Footer />
      </>
    );
  }

  // Sinon, retourner le layout complet avec Header/Footer
  return (
    <>
      <GradientMeshBackground />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
