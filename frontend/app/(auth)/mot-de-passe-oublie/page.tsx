'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import AuthInputWithValidation from '@/components/auth/AuthInputWithValidation';
import { useToast } from '@/components/ui/Toast';
import api from '@/lib/api';

const resetRequestSchema = z.object({
  email: z.string().min(1, 'Email requis').email('Email invalide'),
});

type ResetRequestFormData = z.infer<typeof resetRequestSchema>;

export default function MotDePasseOubliePage() {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetRequestFormData>({
    resolver: zodResolver(resetRequestSchema),
    mode: 'onChange',
  });

  const emailValue = watch('email');

  const onSubmit = async (data: ResetRequestFormData) => {
    setIsSubmitting(true);
    try {
      await api.post('/auth/password-reset/', data);
      setIsSuccess(true);
      showToast('Email de réinitialisation envoyé !', 'success');
    } catch (error) {
      showToast('Une erreur est survenue', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      illustration="/illustrations/auth/unlock.svg"
      illustrationAlt="Réinitialiser le mot de passe"
      title={isSuccess ? 'Email envoyé' : 'Mot de passe oublié'}
      subtitle={
        isSuccess
          ? 'Consultez votre boîte de réception'
          : 'Entrez votre email pour réinitialiser votre mot de passe'
      }
    >
      {isSuccess ? (
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-vida-teal/10 rounded-full mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
          >
            <CheckCircle className="h-10 w-10 text-vida-teal" />
          </motion.div>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Si un compte existe avec cette adresse email, vous recevrez un lien de
            réinitialisation de mot de passe dans quelques instants.
          </p>
          <a
            href="/connexion"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-vida-teal hover:text-white hover:bg-vida-teal border-2 border-vida-teal rounded-lg transition-all duration-200 shadow-vida-1 hover:shadow-vida-3"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour à la connexion
          </a>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AuthInputWithValidation
            id="email"
            label="Email"
            type="email"
            placeholder="votre@email.com"
            error={errors.email?.message}
            isValid={!!emailValue && !errors.email}
            showValidation={!!emailValue}
            required
            {...register('email')}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-vida-teal hover:bg-vida-teal-dark rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-vida-2 hover:shadow-vida-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Mail className="h-5 w-5" />
                Envoyer le lien
              </>
            )}
          </button>

          <div className="text-center pt-6 mt-6 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Vous vous souvenez de votre mot de passe ?{' '}
              <a
                href="/connexion"
                className="text-vida-teal font-semibold hover:text-vida-teal-dark transition-colors"
              >
                Se connecter
              </a>
            </p>
          </div>
        </form>
      )}
    </AuthSplitLayout>
  );
}
