/**
 * Skeleton Loading pour toute la page
 * Affiche pendant le chargement initial du site
 */

'use client';

import { HeaderSkeleton, FooterSkeleton } from '@/components/layout/LayoutSkeleton';

export default function PageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Skeleton */}
      <HeaderSkeleton />

      {/* Hero Skeleton */}
      <div className="h-[calc(100vh-34px)] relative bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200">
        <div className="absolute inset-0 skeleton" />
        <div className="absolute z-30 left-8 md:left-16 lg:left-24 top-1/2 -translate-y-1/2 max-w-lg lg:max-w-xl space-y-4 md:space-y-5">
          {/* Titre principal */}
          <div className="space-y-3">
            <div className="skeleton h-8 md:h-10 lg:h-12 w-full rounded" />
            <div className="skeleton h-8 md:h-10 lg:h-12 w-5/6 rounded" />
          </div>
          {/* Sous-titre */}
          <div className="space-y-2">
            <div className="skeleton h-4 md:h-5 w-4/5 rounded" />
            <div className="skeleton h-4 md:h-5 w-3/4 rounded" />
          </div>
        </div>
        {/* Navigation dots */}
        <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton w-2 h-2 rounded-full" />
          ))}
        </div>
      </div>

      {/* Services Section Skeleton */}
      <section className="py-16 px-6 bg-[#F5F5F0] pb-24">
        <div className="mx-auto max-w-6xl w-full">
          {/* Header */}
          <div className="mb-8 text-center space-y-2">
            <div className="skeleton h-3 w-24 mx-auto rounded" />
            <div className="skeleton h-6 w-32 mx-auto rounded" />
          </div>

          {/* Cards Grid avec padding pour border */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-2">
                <div className="skeleton h-[200px] md:h-[240px] rounded-lg" />
              </div>
            ))}
          </div>

          {/* Dropdown Details Skeleton */}
          <div className="skeleton h-[200px] md:h-[240px] rounded-lg" />
        </div>
      </section>

      {/* À propos Section Skeleton */}
      <section className="py-16 px-6 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="mx-auto max-w-5xl w-full">
          <div className="mb-8 text-center space-y-2">
            <div className="skeleton h-3 w-28 mx-auto rounded" />
            <div className="skeleton h-6 w-40 mx-auto rounded" />
          </div>
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-11/12 mx-auto rounded" />
            <div className="skeleton h-4 w-10/12 mx-auto rounded" />
            <div className="skeleton h-4 w-9/12 mx-auto rounded" />
          </div>
        </div>
      </section>

      {/* Pourquoi VIDA Section Skeleton */}
      <section className="py-16 px-6 bg-[#F5F5F0]">
        <div className="mx-auto max-w-5xl w-full">
          <div className="mb-8 text-center space-y-2">
            <div className="skeleton h-3 w-32 mx-auto rounded" />
            <div className="skeleton h-6 w-36 mx-auto rounded" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-white/60">
                {/* Icon */}
                <div className="skeleton h-9 w-9 flex-shrink-0 rounded-lg" />
                {/* Content */}
                <div className="flex-1 space-y-2 pt-1">
                  <div className="skeleton h-4 w-24 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-5/6 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section Skeleton */}
      <section className="py-10 px-6 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <div className="skeleton h-6 w-64 mx-auto rounded" />
          <div className="skeleton h-4 w-80 max-w-full mx-auto rounded" />
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="skeleton h-9 w-32 rounded-md" />
            <div className="skeleton h-9 w-32 rounded-md" />
          </div>
        </div>
      </section>

      {/* Footer Skeleton */}
      <FooterSkeleton />
    </div>
  );
}
