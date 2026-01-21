'use client';

import React, { useState, useEffect } from 'react';
import { BadgeCheck, Stethoscope, Ear, Smartphone, ArrowRight, X, Send } from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import HeroSlider from '@/components/ui/HeroSlider';
import SectionIndicator from '@/components/ui/SectionIndicator';
import ScrollIndicator from '@/components/ui/ScrollIndicator';
import { useToast } from '@/components/ui/Toast';
import AppointmentModal from '@/components/ui/AppointmentModal';
import ContactModal from '@/components/ui/ContactModal';
import PageSkeleton from '@/components/ui/PageSkeleton';
import { fadeInUp, staggerContainer, staggerItem, backdropFade, modalScale } from '@/lib/animations';
import { usePageLoading } from '@/hooks/usePageLoading';
import { useMedicalServices, useClinicSettings, useWhyVidaReasons } from '@/hooks/useCMS';
import { getMediaUrl } from '@/lib/media';

const STATIC_SERVICES = [
  {
    image: "/images/services/consultation.png",
    title: "Consultations",
    description: "Examens de vue complets, dépistage glaucome et cataracte",
    details: "Nos ophtalmologues réalisent des examens complets de la vue incluant le dépistage du glaucome, de la cataracte et d'autres pathologies oculaires. Consultation sur rendez-vous du lundi au samedi."
  },
  {
    image: "/images/services/depistage.png",
    title: "Dépistage",
    description: "Détection précoce des maladies oculaires (diabète, DMLA)",
    details: "Dépistage précoce des maladies oculaires liées au diabète, à l'hypertension et à l'âge (DMLA). Un diagnostic précoce permet une meilleure prise en charge."
  },
  {
    image: "/images/services/lunetterie.png",
    title: "Lunetterie",
    description: "Large choix de montures et verres correcteurs adaptés",
    details: "Notre lunetterie propose un large choix de montures de qualité et de verres correcteurs adaptés à vos besoins. Conseils personnalisés pour trouver la monture qui vous convient."
  },
  {
    image: "/images/services/chirurgie.png",
    title: "Chirurgie",
    description: "Chirurgie réfractive au laser (myopie, astigmatisme)",
    details: "Chirurgie réfractive au laser pour corriger la myopie, l'hypermétropie et l'astigmatisme. Intervention rapide et indolore avec suivi post-opératoire complet."
  }
];

const STATIC_REASONS = [
  {
    icon_name: "BadgeCheck",
    title: "Compétence",
    description: "Ophtalmologues expérimentés et personnel formé pour vous offrir des soins de qualité"
  },
  {
    icon_name: "Stethoscope",
    title: "Équipement Moderne",
    description: "Matériel adapté pour des examens fiables et un diagnostic précis"
  },
  {
    icon_name: "Ear",
    title: "À Votre Écoute",
    description: "Chaque patient est unique. Nous prenons le temps de comprendre vos besoins"
  },
  {
    icon_name: "Smartphone",
    title: "Facilité d'Accès",
    description: "Réservation en ligne, par téléphone ou WhatsApp. Horaires du lundi au samedi"
  }
];

export default function Home() {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeServiceCard, setActiveServiceCard] = useState<number>(0);
  const { showToast } = useToast();
  const isLoadingPage = usePageLoading();
  
  const { data: cmsServices, isLoading: isLoadingServices, error: servicesError } = useMedicalServices();
  const { data: settings } = useClinicSettings();
  const { data: cmsReasons } = useWhyVidaReasons();

  // Logique robuste pour les services avec fallback
  const services = React.useMemo(() => {
    // Si les données CMS sont disponibles et non vides, les utiliser
    if (cmsServices && Array.isArray(cmsServices) && cmsServices.length > 0) {
      return cmsServices;
    }
    // Sinon, utiliser les services statiques
    return STATIC_SERVICES;
  }, [cmsServices]);

  // Logique robuste pour les raisons avec fallback
  const reasons = React.useMemo(() => {
    if (cmsReasons && Array.isArray(cmsReasons) && cmsReasons.length > 0) {
      return cmsReasons;
    }
    return STATIC_REASONS;
  }, [cmsReasons]);

  // Réinitialiser activeServiceCard si l'index dépasse la longueur
  useEffect(() => {
    if (activeServiceCard >= services.length) {
      setActiveServiceCard(0);
    }
  }, [services.length, activeServiceCard]);

  // Attendre que le composant soit monté côté client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Afficher skeleton pendant le chargement initial de la page
  if (isLoadingPage) {
    return <PageSkeleton />;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <SectionIndicator />
      <ScrollIndicator />
      
      {/* Section 1 - Hero (Accueil) */}
      <section id="hero" className="h-[calc(100vh-34px)] relative z-10">
        <HeroSlider />
      </section>

      {/* Section 2 - Services */}
      <section id="services" className="bg-[#F5F5F0] vida-grain-strong relative z-10">
        <div className="mx-auto max-w-6xl w-full px-6 py-16">
          <motion.div 
            className="mb-8 text-center space-y-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <p className="text-[10px] font-medium text-vida-teal tracking-widest uppercase">Nos expertises</p>
            <h2 className="text-lg font-semibold text-text-primary md:text-xl font-heading">Services</h2>
          </motion.div>

          {/* Skeleton pendant le chargement */}
          {isLoadingServices ? (
            <div className="pt-6">
              <div className="flex gap-3 overflow-x-auto scrollbar-hide" style={{ minHeight: '360px' }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex-none w-[calc(50%-6px)] md:w-[calc(25%-9px)]">
                    <div className="h-[200px] md:h-[240px] rounded-lg bg-gray-200 animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="w-full -mt-20 h-[200px] md:h-[240px] p-6 bg-white/50 rounded-lg animate-pulse" />
            </div>
          ) : services.length > 0 ? (
            <>
              <div className="pt-6">
                <motion.div 
                  className="flex gap-3 overflow-x-auto overflow-y-visible scrollbar-hide scroll-smooth"
                  style={{ scrollSnapType: 'x mandatory', minHeight: '360px' }}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={staggerContainer}
                >
                  {services.map((service: any, index: number) => (
                    <div
                      key={service.id || index}
                      className="flex-none w-[calc(50%-6px)] md:w-[calc(25%-9px)]"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <ServiceCard
                        index={index}
                        image={getMediaUrl(service.image)}
                        title={service.title}
                        description={service.description}
                        isActive={activeServiceCard === index}
                        onHover={() => setActiveServiceCard(index)}
                        onLeave={() => {}} // Ne rien faire au leave, garder la carte active
                      />
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Dropdown Details - Très rapproché des cartes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="w-full -mt-20"
              >
                <div className="service-details-dropdown h-[200px] md:h-[240px] p-6 flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeServiceCard}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      <h3 className="text-base font-semibold text-vida-teal font-heading">
                        {services[activeServiceCard]?.title || 'Service'}
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed font-body">
                        {services[activeServiceCard]?.details || services[activeServiceCard]?.description || 'Description du service'}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">Aucun service disponible pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Section 3 - À propos */}
      <section id="a-propos" className="py-16 px-6 bg-white/5 backdrop-blur-sm relative z-10 border-y border-white/10">
        <div className="mx-auto max-w-5xl w-full">
          <motion.div 
            className="mb-8 text-center space-y-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <p className="text-[10px] font-medium text-vida-teal tracking-widest uppercase">Qui sommes-nous</p>
            <h2 className="text-lg font-semibold text-text-primary md:text-xl font-heading">À propos de VIDA</h2>
          </motion.div>

          <motion.div 
            className="text-center max-w-2xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <p className="text-sm text-text-secondary leading-relaxed">
              {settings?.about_text || "Centre ophtalmologique situé à Brazzaville, nous mettons notre expertise au service de votre santé visuelle. Notre équipe vous accueille dans un environnement professionnel et vous accompagne avec attention, de la consultation au suivi de vos soins."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section Pourquoi VIDA */}
      <section id="pourquoi-vida" className="py-16 px-6 bg-[#F5F5F0] vida-grain-strong relative z-10">
        <div className="mx-auto max-w-5xl w-full">
          <motion.div 
            className="mb-8 text-center space-y-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <p className="text-[10px] font-medium text-vida-teal tracking-widest uppercase">Nos engagements</p>
            <h2 className="text-lg font-semibold text-text-primary md:text-xl font-heading">Pourquoi VIDA ?</h2>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 gap-4 md:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {reasons.map((reason, index) => {
              const IconComponent = reason.icon_name === 'BadgeCheck' ? BadgeCheck :
                                   reason.icon_name === 'Stethoscope' ? Stethoscope :
                                   reason.icon_name === 'Ear' ? Ear :
                                   reason.icon_name === 'Smartphone' ? Smartphone : BadgeCheck;
              
              return (
                <ReasonCard 
                  key={index}
                  icon={IconComponent} 
                  title={reason.title} 
                  description={reason.description} 
                />
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Section CTA */}
      <section id="cta" className="py-10 px-6 bg-white/5 backdrop-blur-sm relative z-10 border-y border-white/10">
        <motion.div 
          className="max-w-2xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <h2 className="text-base font-semibold text-text-primary md:text-lg font-heading mb-2">
            Une Question sur Votre Vue ?
          </h2>
          <p className="text-xs text-text-secondary font-body mb-5">
            Contactez-nous, nous vous répondrons rapidement
          </p>
          <div className="flex items-center justify-center gap-3">
            <motion.button
              onClick={() => setAppointmentModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 bg-gray-900/5 backdrop-blur-sm border border-gray-900/10 rounded-md hover:bg-gray-900/10 transition-colors duration-150"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Prendre RDV
              <ArrowRight className="w-3 h-3" />
            </motion.button>
            <motion.button
              onClick={() => setContactModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 bg-gray-900/5 backdrop-blur-sm border border-gray-900/10 rounded-md hover:bg-gray-900/10 transition-colors duration-150"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Nous écrire
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </motion.button>
          </div>
        </motion.div>
      </section>
      
      {/* Modal Contact */}
      <ContactModal 
        isOpen={contactModalOpen} 
        onClose={() => setContactModalOpen(false)} 
      />
      
      {/* Modal Rendez-vous - Rendu via portail au niveau du body */}
      {mounted && appointmentModalOpen && typeof window !== 'undefined' && createPortal(
        <AppointmentModal 
          isOpen={appointmentModalOpen} 
          onClose={() => setAppointmentModalOpen(false)} 
        />,
        document.body
      )}
    </motion.div>
  );
}

function ServiceCard({ 
  index, 
  image, 
  title, 
  description, 
  isActive, 
  onHover, 
  onLeave 
}: { 
  index: number;
  image: string; 
  title: string; 
  description: string;
  isActive: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <motion.div 
      className="group cursor-pointer relative p-2"
      variants={staggerItem}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Indicateur de carte active */}
      {isActive && (
        <motion.div
          layoutId="activeServiceIndicator"
          className="absolute inset-0 bg-vida-teal/20 rounded-lg border-2 border-vida-teal z-0"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      
      <div className="relative h-[200px] md:h-[240px] rounded-lg overflow-hidden shadow-sm z-10">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={image}
            fallbackSrc="/images/services/consultation.png"
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-sm font-semibold text-white mb-1 font-heading">{title}</h3>
          <p className="text-[10px] text-white/70 leading-relaxed font-body line-clamp-2">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ReasonCard({ icon: Icon, title, description }: { 
  icon: React.ComponentType<{ className?: string }>; 
  title: string; 
  description: string;
}) {
  return (
    <motion.div 
      className="flex items-start gap-3 p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm hover:bg-white/70 transition-colors duration-150"
      variants={staggerItem}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm">
        <Icon className="h-4 w-4 text-gray-600" />
      </div>
      <div className="space-y-0.5 pt-1">
        <h3 className="text-sm font-medium text-text-primary font-heading">{title}</h3>
        <p className="text-[11px] leading-relaxed text-text-secondary font-body">{description}</p>
      </div>
    </motion.div>
  );
}
