import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  // Layout vide - les pages auth gèrent leur propre layout
  return <>{children}</>;
}
