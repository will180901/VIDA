'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import AuthInputWithValidation from '@/components/auth/AuthInputWithValidation';
import HCaptchaComponent, { HCaptchaRef } from '@/components/HCaptcha';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

const loginSchema = z.object({
  email: z.string().min(1, 'Email requis').email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function ConnexionPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptchaRef>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');

  const onSubmit = async (data: LoginFormData) => {
    if (!captchaToken) {
      showToast('Veuillez compléter le CAPTCHA', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ ...data, captcha: captchaToken });
      showToast('Connexion réussie !', 'success');
      router.push('/');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.captcha?.[0] ||
                          'Email ou mot de passe incorrect';
      showToast(errorMessage, 'error');
      // Reset CAPTCHA en cas d'erreur
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const handleCaptchaExpire = () => {
    setCaptchaToken(null);
    showToast('CAPTCHA expiré, veuillez réessayer', 'warning');
  };

  const handleCaptchaError = () => {
    setCaptchaToken(null);
    showToast('Erreur CAPTCHA, veuillez réessayer', 'error');
  };

  return (
    <AuthSplitLayout
      illustration="/illustrations/auth/personal data.svg"
      illustrationAlt="Connexion sécurisée"
      title="Connexion"
      subtitle="Connectez-vous à votre espace patient VIDA"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

        <AuthInputWithValidation
          id="password"
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          isValid={!!passwordValue && !errors.password}
          showValidation={false}
          required
          {...register('password')}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 text-vida-teal border-gray-300 rounded focus:ring-vida-teal/20 cursor-pointer"
              {...register('remember')}
            />
            <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
              Se souvenir de moi
            </span>
          </label>
          <Link
            href="/mot-de-passe-oublie"
            className="text-vida-teal hover:text-vida-teal-dark font-medium transition-colors"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        {/* hCaptcha */}
        <HCaptchaComponent
          ref={captchaRef}
          onVerify={handleCaptchaVerify}
          onExpire={handleCaptchaExpire}
          onError={handleCaptchaError}
        />

        <button
          type="submit"
          disabled={isSubmitting || !captchaToken}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-vida-teal hover:bg-vida-teal-dark rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-vida-2 hover:shadow-vida-3"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Connexion en cours...
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5" />
              Se connecter
            </>
          )}
        </button>

        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Vous n'avez pas de compte ?{' '}
            <Link
              href="/inscription"
              className="text-vida-teal font-semibold hover:text-vida-teal-dark transition-colors"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </form>
    </AuthSplitLayout>
  );
}
