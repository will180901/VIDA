'use client';

import { useClinicSettings } from '@/hooks/useCMS';

export default function Footer() {
  const { data: settings } = useClinicSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#F5F5F0] vida-grain-strong border-t border-gray-200/50">
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Footer Bottom */}
        <div className="flex flex-col items-center justify-between gap-3 text-[10px] text-gray-500 md:flex-row">
          <p>© {currentYear} {settings?.name || "Centre Médical VIDA"} - Brazzaville, Congo</p>
          <div className="flex items-center gap-3">
            <a href="/cgu" className="hover:text-vida-teal transition-colors">CGU</a>
            <span>•</span>
            <a href="/politique-confidentialite" className="hover:text-vida-teal transition-colors">Politique de Confidentialité</a>
          </div>
          <p>RCCM : {settings?.rccm || "B13-0506"} | NIU : {settings?.niu || "M2300009961883"}</p>
        </div>
      </div>
    </footer>
  );
}
