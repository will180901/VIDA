'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, X, Calendar, Phone, Send, User, LogOut, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';
import AppointmentModal from '@/components/ui/AppointmentModal';
import ContactModal from '@/components/ui/ContactModal';
import { backdropFade, modalScale } from '@/lib/animations';
import { useClinicSettings, useSocialLinks } from '@/hooks/useCMS';
import { useAuth } from '@/contexts/AuthContext';
import { useConsultationFees } from '@/hooks/useConsultationFees';

export default function Header() {
  const { data: settings } = useClinicSettings();
  const { data: socialLinks } = useSocialLinks();
  const { data: consultationFees } = useConsultationFees();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [horairesDropdownOpen, setHorairesDropdownOpen] = useState(false);
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { showToast } = useToast();

  const navigation = [
    { name: 'Accueil', href: '#hero' },
    { name: 'Services', href: '#services' },
    { name: 'À propos', href: '#a-propos' },
    { name: 'Horaires & Tarifs', href: '#', dropdownType: 'horaires' },
    { name: 'Contact', href: '#', dropdownType: 'contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'services', 'a-propos', 'pourquoi-vida', 'cta'];
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && scrollPosition >= section.offsetTop) {
          if (sections[i] === 'pourquoi-vida' || sections[i] === 'cta') {
            setActiveSection('a-propos');
          } else {
            setActiveSection(sections[i]);
          }
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#') && href !== '#') {
      e.preventDefault();
      if (href === '#hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
      setMobileMenuOpen(false);
    }
  };

  const isActive = (href: string) => {
    if (href.startsWith('#') && href !== '#') {
      return href === `#${activeSection}`;
    }
    return false;
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copié !`, 'success');
    } catch (err) {
      showToast('Erreur lors de la copie', 'error');
    }
  };


  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Backdrop flouté pour les dropdowns */}
      {(horairesDropdownOpen || contactDropdownOpen || userDropdownOpen) && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onMouseEnter={() => {
            setHorairesDropdownOpen(false);
            setContactDropdownOpen(false);
            setUserDropdownOpen(false);
          }}
        />
      )}
      
      <div className="backdrop-blur-md bg-white/85 border-b border-gray-100 relative z-50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          {/* Logo */}
          <div className="flex lg:flex-1">
            <a 
              href="#hero" 
              onClick={(e) => scrollToSection(e, '#hero')}
              className="-m-1 p-1"
            >
              <span className="text-base font-bold text-vida-teal tracking-wide font-hero">VIDA</span>
            </a>
          </div>

          {/* Menu Mobile Toggle */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2 p-2 text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Navigation Desktop */}
          <div className="hidden lg:flex lg:gap-x-8 lg:items-center relative">
            {navigation.map((item) => {
              const active = isActive(item.href);
              
              if (item.dropdownType === 'horaires') {
                return (
                  <div
                    key={item.name}
                    className="relative flex items-center"
                    onMouseEnter={() => setHorairesDropdownOpen(true)}
                    onMouseLeave={() => setHorairesDropdownOpen(false)}
                  >
                    <button
                      className="relative text-xs font-medium transition-colors text-gray-600 hover:text-vida-teal cursor-pointer"
                    >
                      {item.name}
                    </button>
                    
                    {/* Dropdown Horaires */}
                    {horairesDropdownOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-[100]">
                        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-[#F5F5F0] border-l border-t border-gray-200/50" />
                        
                        <div className="relative bg-[#F5F5F0] border border-gray-200/50 rounded-lg shadow-lg p-5 min-w-[280px]">
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold text-gray-900 mb-2">Horaires d&apos;ouverture</h4>
                          <div className="space-y-1.5 text-xs text-gray-600">
                            <div className="flex justify-between">
                              <span>Lundi - Vendredi</span>
                              <span className="font-medium text-gray-900">{settings?.opening_hours?.['lun-ven'] || '08h30 - 17h00'}</span>
                            </div>
                            {settings?.opening_hours?.['pause'] && (
                              <div className="flex justify-between text-[10px] text-gray-400 italic">
                                <span>Pause déjeuner</span>
                                <span>{settings.opening_hours['pause']}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Samedi</span>
                              <span className="font-medium text-gray-900">{settings?.opening_hours?.['sam'] || '08h00 - 12h30'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Dimanche</span>
                              <span className="font-medium text-gray-500">{settings?.opening_hours?.['dim'] || 'Fermé'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200/50 my-3" />
                        
                        <div>
                          <h4 className="text-xs font-semibold text-gray-900 mb-2">Tarifs consultation</h4>
                          <div className="space-y-1.5 text-xs text-gray-600">
                            {consultationFees && consultationFees.length > 0 ? (
                              consultationFees.map((fee) => (
                                <div key={fee.id} className="flex justify-between">
                                  <span>{fee.consultation_type_display}</span>
                                  <span className="font-medium text-gray-900">{fee.price.toLocaleString()} FCFA</span>
                                </div>
                              ))
                            ) : (
                              <>
                                <div className="flex justify-between">
                                  <span>Consultation générale</span>
                                  <span className="font-medium text-gray-900">{settings?.fee_general?.toLocaleString() || '15 000'} FCFA</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Consultation spécialisée</span>
                                  <span className="font-medium text-gray-900">{settings?.fee_specialized?.toLocaleString() || '25 000'} FCFA</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
                );
              }

              if (item.dropdownType === 'contact') {
                return (
                  <div
                    key={item.name}
                    className="relative flex items-center"
                    onMouseEnter={() => setContactDropdownOpen(true)}
                    onMouseLeave={() => setContactDropdownOpen(false)}
                  >
                    <button
                      className="relative text-xs font-medium transition-colors text-gray-600 hover:text-vida-teal cursor-pointer"
                    >
                      {item.name}
                    </button>
                    
                    {/* Dropdown Contact */}
                    {contactDropdownOpen && (
                      <div className="absolute top-full right-0 pt-3 z-[100]">
                        <div className="absolute top-1.5 right-6 w-3 h-3 rotate-45 bg-[#F5F5F0] border-l border-t border-gray-200/50" />
                        
                        <div className="relative bg-[#F5F5F0] border border-gray-200/50 rounded-lg shadow-lg p-5 min-w-[300px]">
                        {/* Section Contact - 75% */}
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold text-gray-900 mb-3">Nous contacter</h4>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm">
                                <Phone className="h-3.5 w-3.5 text-gray-500" />
                              </div>
                              <div className="text-xs text-gray-600">
                                <p className="font-medium text-gray-900">Téléphone</p>
                                <p>
                                  <button 
                                    onClick={() => copyToClipboard(settings?.phone_primary?.replace(/\s/g, '') || '066934735', 'Numéro')}
                                    className="text-gray-500 hover:text-vida-teal transition-colors cursor-pointer"
                                  >
                                    {settings?.phone_primary || '06 693 47 35'}
                                  </button>
                                  {(settings?.phone_secondary || '05 745 36 88') && (
                                    <>
                                      {' / '}
                                      <button 
                                        onClick={() => copyToClipboard(settings?.phone_secondary?.replace(/\s/g, '') || '057453688', 'Numéro')}
                                        className="text-gray-500 hover:text-vida-teal transition-colors cursor-pointer"
                                      >
                                        {settings?.phone_secondary || '05 745 36 88'}
                                      </button>
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => setContactModalOpen(true)}
                              className="flex items-center justify-center gap-2 mx-auto px-4 py-2 text-xs font-medium text-gray-700 bg-gray-900/5 backdrop-blur-sm border border-gray-900/10 rounded-md hover:bg-gray-900/10 transition-all"
                            >
                              Nous écrire
                              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {/* Séparateur */}
                        <div className="border-t border-gray-200/50 my-4" />
                        
                        {/* Section Réseaux Sociaux - 25% */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-900 mb-3">Suivez-nous</h4>
                          <div className="flex items-center gap-2">
                            {socialLinks?.map((link) => (
                              <a 
                                key={link.id} 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex h-8 w-8 items-center justify-center transition-all duration-200 group/icon"
                              >
                                {link.platform === 'whatsapp' && (
                                  <svg className="h-5 w-5 fill-gray-400 transition-colors duration-200 group-hover/icon:fill-[#25D366]" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                  </svg>
                                )}
                                {link.platform === 'facebook' && (
                                  <svg className="h-5 w-5 fill-gray-400 transition-colors duration-200 group-hover/icon:fill-[#1877F2]" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                  </svg>
                                )}
                                {link.platform === 'instagram' && (
                                  <svg className="h-5 w-5 fill-gray-400 transition-colors duration-200 group-hover/icon:fill-[#E4405F]" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                  </svg>
                                )}
                                {link.platform === 'tiktok' && (
                                  <svg className="h-5 w-5 fill-gray-400 transition-colors duration-200 group-hover/icon:fill-black" viewBox="0 0 24 24">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                                  </svg>
                                )}
                                {link.platform === 'linkedin' && (
                                  <svg className="h-5 w-5 fill-gray-400 transition-colors duration-200 group-hover/icon:fill-[#0A66C2]" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                  </svg>
                                )}
                                {link.platform === 'youtube' && (
                                  <svg className="h-5 w-5 fill-gray-400 transition-colors duration-200 group-hover/icon:fill-[#FF0000]" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                  </svg>
                                )}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
                );
              }
              
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className={`relative text-xs font-medium transition-colors flex items-center ${
                    active 
                      ? 'text-vida-teal' 
                      : 'text-gray-600 hover:text-vida-teal'
                  }`}
                >
                  {item.name}
                  {active && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-vida-teal" />
                  )}
                </a>
              );
            })}
          </div>

          {/* CTA Buttons Desktop */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-x-3">
            {/* Bouton Prendre RDV - MONOCHROME */}
            <motion.button
              onClick={() => setAppointmentModalOpen(true)}
              className="flex items-center gap-1.5 rounded-md bg-gray-900/5 backdrop-blur-sm border border-gray-900/10 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-900/10 transition-colors h-[30px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Calendar className="h-3.5 w-3.5" />
              Prendre RDV
            </motion.button>

            {/* Bouton Mon Compte - VERT DOUX (même forme que Prendre RDV) */}
            <div
              className="relative"
              onMouseEnter={() => setUserDropdownOpen(true)}
              onMouseLeave={() => setUserDropdownOpen(false)}
            >
              <motion.button
                className="flex items-center gap-1.5 rounded-md bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-500/15 transition-colors relative h-[30px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserCircle className="h-3.5 w-3.5" />
                {isAuthenticated ? user?.first_name || 'Mon compte' : 'Mon compte'}
                
                {/* Badge COLORÉ selon statut - en haut à droite */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  {isAuthenticated && (
                    <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                  )}
                  <span className={`relative inline-flex rounded-full h-3 w-3 border-2 border-white shadow-sm ${
                    isAuthenticated ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </span>
              </motion.button>

              {/* Dropdown Monochrome */}
              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full right-0 pt-4 z-[100]"
                  >
                    {/* Flèche */}
                    <div className="absolute top-2.5 right-5 w-3 h-3 rotate-45 bg-white border-l border-t border-gray-100 shadow-xl" />
                    
                    {/* Contenu Dropdown Monochrome */}
                    <div className="relative bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-2xl shadow-2xl p-3 w-[260px] overflow-hidden">
                      {/* Gradient Monochrome */}
                      <div className="absolute top-0 left-0 right-0 h-20 opacity-5 bg-gradient-to-br from-gray-700 to-gray-900" />
                      
                      {isAuthenticated ? (
                        <div className="relative">
                          {/* Profil Connecté Monochrome */}
                          <div className="px-4 py-4 mb-3 bg-gradient-to-br from-gray-900/5 to-transparent rounded-xl border border-gray-900/10">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                {/* Avatar Monochrome */}
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white ring-offset-2 ring-offset-transparent">
                                  {user?.first_name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                {/* Badge Online VERT */}
                                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white shadow-md" />
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.first_name || 'Utilisateur'}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                {/* Badge "En ligne" VERT */}
                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[10px] font-bold text-green-700 bg-green-50 rounded-full border border-green-200/50">
                                  <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                                  EN LIGNE
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Actions Style CTA */}
                          <div className="space-y-2">
                            <Link
                              href="/profile"
                              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 bg-gray-900/5 backdrop-blur-sm border border-gray-900/10 rounded-md hover:bg-gray-900/10 transition-colors duration-150"
                            >
                              <User className="h-3.5 w-3.5" />
                              <span>Mon profil</span>
                            </Link>
                            
                            <button
                              onClick={() => {
                                logout();
                                showToast('Déconnexion réussie', 'success');
                              }}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 bg-gray-900/5 backdrop-blur-sm border border-gray-900/10 rounded-md hover:bg-gray-900/10 transition-colors duration-150"
                            >
                              <LogOut className="h-3.5 w-3.5" />
                              <span>Déconnexion</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          {/* Header Déconnecté Monochrome */}
                          <div className="px-4 py-5 mb-3 text-center">
                            <div className="relative inline-flex mb-3">
                              {/* Glow Monochrome */}
                              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 blur-lg opacity-15" />
                              <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border-2 border-gray-200/50 shadow-lg">
                                <UserCircle className="h-7 w-7 text-gray-400" />
                              </div>
                              {/* Badge Offline ROUGE */}
                              <span className="absolute bottom-0 right-0 h-4 w-4 bg-red-500 border-2 border-white rounded-full shadow-md" />
                            </div>
                            <p className="text-sm font-bold text-gray-900 mb-1">Bienvenue sur VIDA</p>
                            <p className="text-xs text-gray-500">Connectez-vous pour gérer vos rendez-vous</p>
                          </div>
                          
                          {/* Boutons Style CTA Exact */}
                          <div className="space-y-2">
                            <Link
                              href="/connexion"
                              className="relative flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 bg-gray-900/5 backdrop-blur-sm border border-gray-900/10 rounded-md hover:bg-gray-900/10 transition-colors duration-150 group overflow-hidden"
                            >
                              {/* Shimmer Monochrome */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                              <User className="h-3.5 w-3.5 relative z-10" />
                              <span className="relative z-10">Se connecter</span>
                            </Link>
                            
                            <Link
                              href="/inscription"
                              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 bg-gray-900/5 backdrop-blur-sm border border-gray-900/10 rounded-md hover:bg-gray-900/10 transition-colors duration-150"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                              </svg>
                              <span>Créer un compte</span>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100">
            <div className="px-6 py-4 space-y-1">
              {navigation.map((item) => {
                const active = isActive(item.href);
                
                if (item.dropdownType === 'horaires') {
                  return (
                    <div key={item.name} className="space-y-2">
                      <span className="block px-3 py-2 text-sm font-medium text-gray-700">
                        {item.name}
                      </span>
                      <div className="ml-3 pl-3 border-l border-gray-200 space-y-1 text-xs text-gray-600">
                        <p>Lun-Ven : {settings?.opening_hours?.['lun-ven'] || '08h30 - 17h00'}</p>
                        <p>Sam : {settings?.opening_hours?.['sam'] || '08h00 - 12h30'}</p>
                      </div>
                    </div>
                  );
                }

                if (item.dropdownType === 'contact') {
                  return (
                    <div key={item.name} className="space-y-2">
                      <span className="block px-3 py-2 text-sm font-medium text-gray-700">
                        {item.name}
                      </span>
                      <div className="ml-3 pl-3 border-l border-gray-200 space-y-1 text-xs text-gray-600">
                        <p>06 569 12 35 / 05 745 36 88</p>
                        <p>centremedvida@gmail.com</p>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => scrollToSection(e, item.href)}
                    className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      active 
                        ? 'text-vida-teal bg-vida-teal/5' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </a>
                );
              })}
              <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAppointmentModalOpen(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-vida-teal rounded-md"
                >
                  <Calendar className="h-4 w-4" />
                  Prendre RDV
                </button>

                {isAuthenticated ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-vida-teal bg-vida-teal/10 rounded-lg border border-vida-teal/20"
                    >
                      <User className="h-4 w-4" />
                      Mon profil
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                        showToast('Déconnexion réussie', 'success');
                      }}
                      className="flex w-full items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg border border-red-100"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/connexion"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-vida-teal to-vida-teal-dark rounded-lg shadow-md shadow-vida-teal/25"
                    >
                      <User className="h-4 w-4" />
                      Se connecter
                    </Link>
                    <Link
                      href="/inscription"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-vida-teal bg-vida-teal/5 border border-vida-teal/20 rounded-lg"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Créer un compte
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Contact */}
      <ContactModal 
        isOpen={contactModalOpen} 
        onClose={() => setContactModalOpen(false)} 
      />

      {/* Modals */}
      <AppointmentModal 
        isOpen={appointmentModalOpen} 
        onClose={() => setAppointmentModalOpen(false)} 
      />
    </header>
  );
}
