'use client';

import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export default function StatCard({ title, value, icon: Icon, trend, subtitle }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 vida-grain hover:shadow-vida-2 transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-xl font-bold text-gray-900 mt-1 font-heading">
            {value}
          </p>
          {subtitle && (
            <p className="text-[10px] text-gray-500 mt-0.5">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              <span
                className={`text-[10px] font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-[10px] text-gray-500">vs mois dernier</span>
            </div>
          )}
        </div>
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-vida-teal/10">
          <Icon className="h-5 w-5 text-vida-teal" />
        </div>
      </div>
    </motion.div>
  );
}
