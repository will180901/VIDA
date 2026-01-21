'use client';

import { Calendar, UserPlus, FileText, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      label: 'Nouveau RDV',
      icon: Calendar,
      onClick: () => router.push('/admin/appointments'),
    },
    {
      label: 'Nouveau Patient',
      icon: UserPlus,
      onClick: () => router.push('/admin/patients'),
    },
    {
      label: 'Nouveau Dossier',
      icon: FileText,
      onClick: () => {
        // À implémenter quand le module dossiers sera créé
        console.log('Nouveau Dossier - À implémenter');
      },
    },
    {
      label: 'Paramètres',
      icon: Settings,
      onClick: () => {
        // À implémenter quand le module paramètres sera créé
        console.log('Paramètres - À implémenter');
      },
    },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 vida-grain">
      <h3 className="text-xs font-semibold text-gray-900 mb-3 font-heading">
        Actions rapides
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              onClick={action.onClick}
              className="flex items-center gap-2 px-3 py-2 text-[10px] font-medium text-gray-700 bg-gray-900/5 backdrop-blur-sm border border-gray-900/10 rounded-md hover:bg-gray-900/10 transition-colors duration-150"
            >
              <Icon className="h-3.5 w-3.5 text-gray-600" />
              <span>{action.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
