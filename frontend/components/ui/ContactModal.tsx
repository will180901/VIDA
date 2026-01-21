'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { backdropFade, modalScale } from '@/lib/animations';
import { useToast } from '@/components/ui/Toast';
import api from '@/lib/api';

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await api.post('/cms/contact-messages/', data);
      showToast('Message envoyé avec succès ! Notre équipe vous contactera sous 24h.', 'success');
      reset();
      onClose();
    } catch (error: any) {
      if (error.response?.status === 400) {
        showToast('Veuillez vérifier les informations saisies.', 'error');
      } else if (error.response?.status === 500) {
        showToast('Erreur serveur. Veuillez réessayer plus tard.', 'error');
      } else {
        showToast('Erreur de connexion. Vérifiez votre connexion internet.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          {/* Backdrop flou */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            variants={backdropFade}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-xl max-w-lg w-full border border-white/20 flex flex-col"
            variants={modalScale}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 font-heading">
                <Send className="h-4 w-4 text-vida-teal" />
                Nous écrire
              </h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Formulaire */}
            <form className="flex flex-col flex-1 overflow-hidden" onSubmit={handleSubmit(onSubmit)}>
              <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      id="name"
                      className={`w-full px-3 py-2 text-xs bg-white border ${
                        errors.name ? 'border-red-500' : 'border-gray-200'
                      } rounded-md outline-none focus:ring-1 focus:ring-vida-teal/30 transition-colors`}
                      placeholder="Votre nom"
                    />
                    {errors.name && (
                      <p className="mt-1 text-[10px] text-red-500 italic">{errors.name.message}</p>
                    )}
              </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      id="email"
                      className={`w-full px-3 py-2 text-xs bg-white border ${
                        errors.email ? 'border-red-500' : 'border-gray-200'
                      } rounded-md outline-none focus:ring-1 focus:ring-vida-teal/30 transition-colors`}
                      placeholder="votre@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-[10px] text-red-500 italic">{errors.email.message}</p>
                    )}
              </div>

                  <div>
                    <label htmlFor="subject" className="block text-xs font-medium text-gray-700 mb-1">
                      Sujet <span className="text-gray-400 font-normal">(optionnel)</span>
                    </label>
                    <input
                      {...register('subject')}
                      type="text"
                      id="subject"
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-md outline-none focus:ring-1 focus:ring-vida-teal/30 transition-colors"
                      placeholder="Objet de votre message"
                    />
              </div>

                  <div>
                    <label htmlFor="message" className="block text-xs font-medium text-gray-700 mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register('message')}
                      id="message"
                      rows={6}
                      className={`w-full px-3 py-2 text-xs bg-white border ${
                        errors.message ? 'border-red-500' : 'border-gray-200'
                      } rounded-md outline-none focus:ring-1 focus:ring-vida-teal/30 transition-colors resize-none`}
                      placeholder="Comment pouvons-nous vous aider ?"
                    />
                    {errors.message && (
                      <p className="mt-1 text-[10px] text-red-500 italic">{errors.message.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer avec bouton */}
              <div className="flex justify-end gap-2 p-4 border-t border-gray-200 flex-shrink-0">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white bg-vida-teal rounded-md hover:bg-vida-teal/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-3 w-3" />
                      Envoyer le message
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
