'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import AuthInputWithValidation from '@/components/auth/AuthInputWithValidation';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';
import LegalCheckbox from '@/components/auth/LegalCheckbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

const registerSchema = z.object({
  email: z.string().min(1, 'Email requis').email('Email invalide'),
  password: z.string().min(12, 'Le mot de passe doit contenir au moins 12 caractères'),
  password_confirm: z.string(),
  first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().min(9, 'Numéro de téléphone invalide').optional().or(z.literal('')),
  accept_cgu: z.boolean().refine((val) => val === true, {
    message: 'Vous devez accepter les CGU',
  }),
  accept_privacy: z.boolean().refine((val) => val === true, {
    message: 'Vous devez accepter la politique de confidentialité',
  }),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirm'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function InscriptionPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const formData = watch();
  const passwordValue = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    if (currentStep !== totalSteps) return;

    setIsSubmitting(true);
    try {
      await registerUser(data);
      showToast('Inscription réussie ! Bienvenue sur VIDA.', 'success');
      router.push('/');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.email?.[0] || 
                          error?.response?.data?.message ||
                          'Une erreur est survenue lors de l\'inscription';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    if (currentStep >= totalSteps) return;

    let fieldsToValidate: (keyof RegisterFormData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['email', 'password', 'password_confirm'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['first_name', 'last_name', 'phone'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <AuthSplitLayout
      illustration="/illustrations/auth/unlock.svg"
      illustrationAlt="Créer un compte"
      title="Inscription"
      subtitle="Créez votre compte patient VIDA"
    >
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          {[...Array(totalSteps)].map((_, index) => {
            const step = index + 1;
            const isActive = step === currentStep;
            const isCompleted = step < currentStep;
            return (
              <div key={step} className="flex items-center flex-1">
                {index > 0 && (
                  <div
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      isCompleted || isActive ? 'bg-vida-teal' : 'bg-gray-200'
                    }`}
                  />
                )}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-vida-teal text-white scale-110 shadow-vida-2'
                      : isCompleted
                      ? 'bg-vida-teal text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? '✓' : step}
                </div>
                {index < totalSteps - 1 && (
                  <div
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-vida-teal' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-3 text-xs font-medium text-gray-600">
          <span>Compte</span>
          <span>Informations</span>
          <span>Validation</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={currentStep}>
            {/* Step 1: Compte */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <AuthInputWithValidation
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="votre@email.com"
                  error={errors.email?.message}
                  isValid={!!formData.email && !errors.email}
                  showValidation={!!formData.email}
                  required
                  {...register('email')}
                />

                <div>
                  <AuthInputWithValidation
                    id="password"
                    label="Mot de passe"
                    type="password"
                    placeholder="••••••••••••"
                    error={errors.password?.message}
                    isValid={!!formData.password && !errors.password}
                    showValidation={false}
                    required
                    {...register('password')}
                  />
                  <PasswordStrengthIndicator password={passwordValue || ''} />
                </div>

                <AuthInputWithValidation
                  id="password_confirm"
                  label="Confirmer le mot de passe"
                  type="password"
                  placeholder="••••••••••••"
                  error={errors.password_confirm?.message}
                  isValid={!!formData.password_confirm && !errors.password_confirm}
                  showValidation={!!formData.password_confirm}
                  required
                  {...register('password_confirm')}
                />
              </motion.div>
            )}

            {/* Step 2: Informations */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                custom={2}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <AuthInputWithValidation
                  id="first_name"
                  label="Prénom"
                  type="text"
                  placeholder="Votre prénom"
                  error={errors.first_name?.message}
                  isValid={!!formData.first_name && !errors.first_name}
                  showValidation={!!formData.first_name}
                  required
                  {...register('first_name')}
                />

                <AuthInputWithValidation
                  id="last_name"
                  label="Nom"
                  type="text"
                  placeholder="Votre nom"
                  error={errors.last_name?.message}
                  isValid={!!formData.last_name && !errors.last_name}
                  showValidation={!!formData.last_name}
                  required
                  {...register('last_name')}
                />

                <AuthInputWithValidation
                  id="phone"
                  label="Téléphone"
                  type="tel"
                  placeholder="06 XXX XX XX"
                  error={errors.phone?.message}
                  isValid={!!formData.phone && !errors.phone}
                  showValidation={!!formData.phone}
                  {...register('phone')}
                />
              </motion.div>
            )}

            {/* Step 3: Validation */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                custom={3}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">Récapitulatif</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email :</span>
                      <span className="font-medium text-gray-900">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nom complet :</span>
                      <span className="font-medium text-gray-900">
                        {formData.first_name} {formData.last_name}
                      </span>
                    </div>
                    {formData.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Téléphone :</span>
                        <span className="font-medium text-gray-900">{formData.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <LegalCheckbox
                    id="accept_cgu"
                    label="J'accepte les"
                    linkText="Conditions Générales d'Utilisation"
                    linkHref="/cgu"
                    error={errors.accept_cgu?.message}
                    {...register('accept_cgu')}
                  />

                  <LegalCheckbox
                    id="accept_privacy"
                    label="J'accepte la"
                    linkText="Politique de Confidentialité"
                    linkHref="/politique-confidentialite"
                    error={errors.accept_privacy?.message}
                    {...register('accept_privacy')}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-3 mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              Précédent
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="ml-auto flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-vida-teal hover:bg-vida-teal-dark rounded-lg transition-all duration-200 shadow-vida-2 hover:shadow-vida-3"
            >
              Suivant
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="ml-auto flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-vida-teal hover:bg-vida-teal-dark rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-vida-2 hover:shadow-vida-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Inscription...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Créer mon compte
                </>
              )}
            </button>
          )}
        </div>

        <div className="text-center pt-6 mt-6 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{' '}
            <a
              href="/connexion"
              className="text-vida-teal font-semibold hover:text-vida-teal-dark transition-colors"
            >
              Se connecter
            </a>
          </p>
        </div>
      </form>
    </AuthSplitLayout>
  );
}
