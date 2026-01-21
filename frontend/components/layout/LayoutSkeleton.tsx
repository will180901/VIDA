/**
 * Skeleton pour Header et Footer
 * Utilisé pendant le chargement initial
 */

'use client';

export function HeaderSkeleton() {
  return (
    <div className="sticky top-0 z-50 w-full">
      <div className="backdrop-blur-md bg-white/85 border-b border-gray-100">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
          {/* Logo */}
          <div className="skeleton h-6 w-16 rounded" />
          
          {/* Menu Mobile Toggle */}
          <div className="flex lg:hidden">
            <div className="skeleton h-5 w-5 rounded" />
          </div>
          
          {/* Navigation Desktop */}
          <div className="hidden lg:flex lg:gap-x-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-4 w-20 rounded" />
            ))}
          </div>
          
          {/* CTA Button */}
          <div className="hidden lg:block skeleton h-8 w-28 rounded-md" />
        </nav>
      </div>
    </div>
  );
}

export function FooterSkeleton() {
  return (
    <footer className="bg-[#F5F5F0] border-t border-gray-200/50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Grid 4 colonnes */}
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton h-5 w-20 rounded" />
              <div className="space-y-2">
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-4/5 rounded" />
                <div className="skeleton h-3 w-3/4 rounded" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer Bottom */}
        <div className="mt-8 border-t border-gray-300/50 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <div className="skeleton h-3 w-48 rounded" />
            <div className="skeleton h-3 w-40 rounded" />
          </div>
        </div>
      </div>
    </footer>
  );
}
