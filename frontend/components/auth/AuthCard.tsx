'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { modalScale } from '@/lib/animations';
import Link from 'next/link';

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  footer?: {
    text: string;
    linkText: string;
    linkHref: string;
  };
}

export default function AuthCard({ children, title, subtitle, footer }: AuthCardProps) {
  return (
    <motion.div
      className="vida-grain bg-white/80 backdrop-blur-xl rounded-xl shadow-vida-3 border border-white/60 p-8"
      variants={modalScale}
      initial="hidden"
      animate="visible"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-vida-teal font-heading mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-600 font-body">
            {subtitle}
          </p>
        )}
      </div>

      {children}

      {footer && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {footer.text}{' '}
            <Link 
              href={footer.linkHref}
              className="text-vida-teal font-medium hover:text-vida-teal-dark transition-colors"
            >
              {footer.linkText}
            </Link>
          </p>
        </div>
      )}
    </motion.div>
  );
}
