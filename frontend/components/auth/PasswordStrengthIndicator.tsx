'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

interface StrengthData {
  score: number;
  label: string;
  color: 'error' | 'warning' | 'success';
}

export default function PasswordStrengthIndicator({
  password,
  className = '',
}: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState<StrengthData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!password || password.length < 3) {
      setStrength(null);
      return;
    }

    // Debounce pour éviter trop d'appels API
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await api.post('/auth/password-strength/', { password });
        setStrength(response.data);
      } catch (error) {
        // Fallback : calcul côté client basique
        const score = Math.min(password.length * 5, 100);
        let label = 'Très faible';
        let color: 'error' | 'warning' | 'success' = 'error';
        
        if (score >= 80) {
          label = 'Très fort';
          color = 'success';
        } else if (score >= 60) {
          label = 'Fort';
          color = 'success';
        } else if (score >= 40) {
          label = 'Moyen';
          color = 'warning';
        } else if (score >= 20) {
          label = 'Faible';
          color = 'error';
        }
        
        setStrength({ score, label, color });
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [password]);

  if (!strength) return null;

  const getColorClasses = () => {
    switch (strength.color) {
      case 'success':
        return {
          bg: 'bg-success',
          text: 'text-success',
          border: 'border-success',
        };
      case 'warning':
        return {
          bg: 'bg-warning',
          text: 'text-warning',
          border: 'border-warning',
        };
      case 'error':
        return {
          bg: 'bg-error',
          text: 'text-error',
          border: 'border-error',
        };
    }
  };

  const colors = getColorClasses();

  return (
    <AnimatePresence>
      <motion.div
        className={`mt-2 ${className}`}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${colors.bg}`}
            initial={{ width: 0 }}
            animate={{ width: `${strength.score}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Label */}
        <div className="flex items-center justify-between mt-1">
          <span className={`text-xs font-medium ${colors.text}`}>
            {isLoading ? 'Analyse...' : strength.label}
          </span>
          <span className="text-xs text-gray-500">
            {strength.score}%
          </span>
        </div>

        {/* Requirements (if weak) */}
        {strength.score < 60 && (
          <motion.div
            className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="font-medium mb-1">Votre mot de passe doit contenir :</p>
            <ul className="space-y-0.5 text-[11px]">
              <li>• Au moins 12 caractères</li>
              <li>• Une lettre majuscule</li>
              <li>• Une lettre minuscule</li>
              <li>• Un chiffre</li>
              <li>• Un caractère spécial (!@#$%...)</li>
            </ul>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
