'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface AuthSplitLayoutProps {
  children: ReactNode;
  illustration: string;
  illustrationAlt: string;
  title: string;
  subtitle?: string;
}

export default function AuthSplitLayout({
  children,
  illustration,
  illustrationAlt,
  title,
  subtitle,
}: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration (Desktop only) */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden vida-grain flex-col"
        style={{
          background: 'linear-gradient(135deg, #0D5C63 0%, #14919B 100%)',
        }}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo - En haut centré */}
        <div className="absolute top-6 left-0 right-0 z-10 flex justify-center">
          <Link href="/">
            <Image
              src="/logo/vida-logo-white.svg"
              alt="VIDA Logo"
              width={150}
              height={50}
              className="drop-shadow-2xl"
            />
          </Link>
        </div>

        {/* Illustration - En bas */}
        <div className="flex-1 flex items-end justify-center pb-12 pt-24">
          <motion.div
            className="relative w-full max-w-lg px-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Image
              src={illustration}
              alt={illustrationAlt}
              width={600}
              height={600}
              className="w-full h-auto drop-shadow-2xl"
              priority
            />
          </motion.div>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
      </motion.div>

      {/* Right Side - Form */}
      <motion.div
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-white"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="w-full max-w-md">
          {/* Logo Mobile */}
          <Link href="/" className="lg:hidden block mb-8">
            <Image
              src="/logo/vida-logo.svg"
              alt="VIDA Logo"
              width={150}
              height={50}
              className="mx-auto"
            />
          </Link>

          {/* Title */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h1 className="text-3xl font-bold text-vida-teal font-heading mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-text-secondary font-body">
                {subtitle}
              </p>
            )}
          </motion.div>

          {/* Form Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
