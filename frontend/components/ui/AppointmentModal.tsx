'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Calendar, Clock, User, FileText, Stethoscope, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './Toast';
import { format, addDays, isSameDay, isBefore, startOfDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { backdropFade, modalScale, staggerContainer, staggerItem } from '@/lib/animations';
import { useClinicSchedules, useClinicHolidays } from '@/hooks/useCMS';
import { useAvailableSlots, useCreateAppointment, useLockSlot, useUnlockSlot } from '@/hooks/useAppointments';
import { CONSULTATION_TYPES, formatPrice, getConsultationTypePrice } from '@/lib/consultationTypes';
import { useConsultationFees, getConsultationFeesMap } from '@/hooks/useConsultationFees';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Configuration centralisée de la clinique
const CLINIC_CONFIG = {
  // Horaires par type de jour
  schedule: {
    weekday: {
      morning: ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
      afternoon: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30']
    },
    saturday: {
      morning: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00']
    }
  },
  
  // Jours fermés (0 = Dimanche)
  closedDays: [0],
  
  // Jours fériés Congo-Brazzaville 2026
  holidays: [
    '2026-01-01', // Nouvel An
    '2026-04-13', // Lundi de Pâques
    '2026-05-01', // Fête du Travail
    '2026-05-21', // Ascension
    '2026-06-10', // Pentecôte
    '2026-08-15', // Assomption
    '2026-11-01', // Toussaint
    '2026-12-25', // Noël
  ],
  
  // Contraintes de réservation
  minAdvanceHours: 2,  // Minimum 2h à l'avance pour aujourd'hui
  maxAdvanceDays: 90, // Maximum 3 mois à l'avance
};

const appointmentSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().min(9, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  consultationType: z.enum(['generale', 'specialisee', 'suivi', 'urgence']),
  date: z.string().min(1, 'Veuillez sélectionner une date'),
  time: z.string().min(1, 'Veuillez sélectionner un créneau horaire'),
  reason: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export default function AppointmentModal({ isOpen, onClose, onSuccess }: AppointmentModalProps) {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 4;
  
  const { data: schedules } = useClinicSchedules();
  const { data: holidays } = useClinicHolidays();
  const { data: consultationFees } = useConsultationFees();
  
  const createAppointment = useCreateAppointment();
  const lockSlot = useLockSlot();
  const unlockSlot = useUnlockSlot();
  
  // Obtenir les prix dynamiques
  const dynamicPrices = getConsultationFeesMap(consultationFees);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    trigger,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      consultationType: 'generale',
      date: '',
      time: '',
    }
  });

  const formData = watch();
  
  const { data: slotsData, isLoading: slotsLoading } = useAvailableSlots(formData.date || null);

  // Calendrier state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarStyle, setCalendarStyle] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  
  // Refs pour auto-focus
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Réinitialiser l'étape quand le modal s'ouvre et auto-focus
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setShowCalendar(false);
      reset();
      // Auto-focus sur le premier champ après un court délai
      setTimeout(() => {
        firstNameRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Mettre à jour les créneaux disponibles quand la date change
  useEffect(() => {
    if (formData.date) {
      const selectedDate = new Date(formData.date + 'T00:00:00');
      
      let slots: string[] = [];
      if (slotsData?.slots && slotsData.slots.length > 0) {
        slots = slotsData.slots;
      } else {
        slots = getAvailableSlots(selectedDate);
      }
      
      setAvailableSlots(slots);
      
      // Si le créneau sélectionné n'est plus disponible, le réinitialiser
      if (formData.time && !slots.includes(formData.time)) {
        setValue('time', '');
      }
    } else {
      setAvailableSlots([]);
    }
  }, [formData.date, slotsData]);

  // Vérifier si une date est disponible
  const isDateAvailable = (date: Date): boolean => {
    const today = startOfDay(new Date());
    const selectedDate = startOfDay(date);
    
    // Passé (avant aujourd'hui)
    if (isBefore(selectedDate, today)) return false;
    
    // Trop loin (> 90 jours)
    const maxDate = addDays(today, CLINIC_CONFIG.maxAdvanceDays);
    if (isBefore(maxDate, selectedDate)) return false;
    
    // Jour fermé (Dimanche)
    if (CLINIC_CONFIG.closedDays.includes(date.getDay())) return false;
    
    // Jour férié
    const dateStr = format(date, 'yyyy-MM-dd');
    const isHoliday = holidays?.some(h => h.date === dateStr) || CLINIC_CONFIG.holidays.includes(dateStr);
    if (isHoliday) return false;
    
    // Si c'est aujourd'hui, vérifier qu'il reste des créneaux disponibles
    if (isSameDay(date, new Date())) {
      const availableSlots = getAvailableSlots(date);
      return availableSlots.length > 0;
    }
    
    return true;
  };

  // Vérifier si un créneau horaire est disponible
  const isTimeSlotAvailable = (date: Date, timeSlot: string): boolean => {
    // Si ce n'est pas aujourd'hui, tous les créneaux sont disponibles
    if (!isSameDay(date, new Date())) return true;
    
    // Pour aujourd'hui, vérifier l'heure actuelle + délai minimum
    const now = new Date();
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    
    // Ajouter le délai minimum (2h)
    const minTime = new Date(now.getTime() + CLINIC_CONFIG.minAdvanceHours * 60 * 60 * 1000);
    
    return slotTime > minTime;
  };

  // Générer les créneaux à partir d'une plage horaire
  const generateTimeSlots = (startTime: string, endTime: string, duration: number): string[] => {
    const slots: string[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      slots.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`);
      currentMin += duration;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }
    }
    
    return slots;
  };

  // Obtenir les créneaux disponibles pour une date
  const getAvailableSlots = (date: Date): string[] => {
    const dayOfWeek = date.getDay();
    const djangoDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    let allSlots: string[] = [];
    
    if (schedules && schedules.length > 0) {
      const schedule = schedules.find(s => s.day_of_week === djangoDay);
      
      if (!schedule || !schedule.is_open) return [];
      
      const slotDuration = schedule.slot_duration || 30;
      
      if (schedule.morning_start && schedule.morning_end) {
        allSlots = [...allSlots, ...generateTimeSlots(schedule.morning_start, schedule.morning_end, slotDuration)];
      }
      
      if (schedule.afternoon_start && schedule.afternoon_end) {
        allSlots = [...allSlots, ...generateTimeSlots(schedule.afternoon_start, schedule.afternoon_end, slotDuration)];
      }
    } else {
      const isSaturday = date.getDay() === 6;
      if (isSaturday) {
        allSlots = CLINIC_CONFIG.schedule.saturday.morning;
      } else {
        allSlots = [
          ...CLINIC_CONFIG.schedule.weekday.morning,
          ...CLINIC_CONFIG.schedule.weekday.afternoon
        ];
      }
    }
    
    return allSlots.filter(slot => isTimeSlotAvailable(date, slot));
  };

  // Obtenir la classe CSS pour une date dans le calendrier
  const getDateClassName = (date: Date): string => {
    const isDisabled = !isDateAvailable(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    const isSelected = formData.date === dateStr;
    const dayOfWeek = date.getDay();
    const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
    const isHolidayCMS = holidays?.some(h => h.date === dateStr);
    const isHoliday = isHolidayCMS || CLINIC_CONFIG.holidays.includes(dateStr);
    
    if (isDisabled) {
      if (isHoliday) {
        return 'text-red-300 cursor-not-allowed line-through';
      }
      return 'text-gray-300 cursor-not-allowed';
    }
    
    if (isSelected) {
      return 'bg-vida-teal text-white shadow-sm font-semibold';
    }
    
    if (isHoliday) {
      return 'text-red-500 hover:bg-red-50 font-medium';
    }
    
    if (dayOfWeek === 6) {
      return 'text-orange-600 hover:bg-orange-50 font-medium';
    }
    
    if (isWeekendDay) {
      return 'text-gray-400';
    }
    
    return 'hover:bg-vida-teal/10 hover:text-vida-teal';
  };

  // Fermer le calendrier quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCalendar && dateButtonRef.current && !dateButtonRef.current.contains(event.target as Node)) {
        const calendarElement = document.querySelector('[data-calendar]');
        if (calendarElement && !calendarElement.contains(event.target as Node)) {
          setShowCalendar(false);
        }
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showCalendar]);

  const toggleCalendar = () => {
    if (!showCalendar && dateButtonRef.current) {
      const rect = dateButtonRef.current.getBoundingClientRect();
      setCalendarStyle({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
    setShowCalendar(!showCalendar);
  };

  const timeSlots = {
    morning: availableSlots.filter((slot: string) => {
      const hour = parseInt(slot.split(':')[0]);
      return hour < 12;
    }),
    afternoon: availableSlots.filter((slot: string) => {
      const hour = parseInt(slot.split(':')[0]);
      return hour >= 12;
    })
  };
  
  // Fonction pour toggle un créneau (sélectionner/désélectionner)
  const toggleTimeSlot = async (slot: string) => {
    if (formData.time === slot) {
      // Désélectionner si déjà sélectionné
      setValue('time', '', { shouldValidate: true });
      if (formData.date) {
        try {
          await unlockSlot.mutateAsync({ date: formData.date, time: slot });
        } catch (error) {
          // Ignorer silencieusement
        }
      }
    } else {
      // Sélectionner le nouveau créneau
      setValue('time', slot, { shouldValidate: true });
      if (formData.date) {
        try {
          await lockSlot.mutateAsync({ date: formData.date, time: slot });
        } catch (error: any) {
          if (error.response?.status === 409) {
            showToast('Ce créneau vient d\'être réservé par un autre utilisateur.', 'error');
            setValue('time', '', { shouldValidate: true });
          }
        }
      }
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    // Empêcher la soumission si on n'est pas à la dernière étape
    if (currentStep !== totalSteps) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createAppointment.mutateAsync({
        patient_first_name: data.firstName,
        patient_last_name: data.lastName,
        patient_email: data.email || '',
        patient_phone: data.phone,
        date: data.date,
        time: data.time,
        consultation_type: data.consultationType,
        reason: data.reason,
      });
      
      showToast('Votre demande de RDV a été enregistrée ! Nous vous confirmerons par téléphone.', 'success');
      reset();
      setCurrentStep(1);
      setShowCalendar(false);
      onSuccess?.(); // Appeler onSuccess si fourni
      onClose();
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.non_field_errors?.[0] || 'Une erreur est survenue. Veuillez réessayer.';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    // Ne pas dépasser la dernière étape
    if (currentStep >= totalSteps) {
      return;
    }
    
    let fieldsToValidate: (keyof AppointmentFormData)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'phone'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['consultationType'];
    } else if (currentStep === 3) {
      fieldsToValidate = ['date', 'time'];
    }

    const isValid = await trigger(fieldsToValidate);
    
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.phone;
      case 2:
        return formData.consultationType;
      case 3:
        return formData.date && formData.time;
      default:
        return true;
    }
  };

  const handleClose = () => {
    if (formData.date && formData.time) {
      unlockSlot.mutate({ date: formData.date, time: formData.time });
    }
    setCurrentStep(1);
    setShowCalendar(false);
    onClose();
  };
  
  // Formatage du numéro de téléphone
  const formatPhoneNumber = (value: string) => {
    // Retirer tous les caractères non numériques
    const numbers = value.replace(/\D/g, '');
    
    // Formater: 06 XXX XX XX
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    if (numbers.length <= 7) return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5)}`;
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5, 7)} ${numbers.slice(7, 9)}`;
  };
  
  // Navigation clavier (Enter pour passer au champ suivant)
  const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLInputElement | null>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Empêcher la soumission du formulaire
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  // Fonctions calendrier
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'Sélectionner une date';
    const date = new Date(dateString + 'T00:00:00');
    return format(date, 'EEEE d MMMM yyyy', { locale: fr });
  };

  const selectDate = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (isDateAvailable(selectedDate)) {
      setValue('date', format(selectedDate, 'yyyy-MM-dd'), { shouldValidate: true });
      setShowCalendar(false);
    }
  };

  const changeMonth = (direction: number) => {
    if (direction > 0) {
      setCurrentMonth(addMonths(currentMonth, 1));
    } else {
      setCurrentMonth(subMonths(currentMonth, 1));
    }
  };

  const renderCalendarDays = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-6 w-6" />);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateClassName = getDateClassName(date);
      const isDisabled = !isDateAvailable(date);
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => selectDate(day)}
          disabled={isDisabled}
          className={`h-6 w-6 text-[10px] rounded-full transition-all duration-200 ${dateClassName}`}
          title={isDisabled ? 'Date non disponible' : format(date, 'EEEE d MMMM yyyy', { locale: fr })}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
            variants={backdropFade}
            initial="hidden"
            animate="visible"
            exit="exit"
          />
          
          {/* Modal */}
          <motion.div 
            className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-xl max-w-2xl w-full h-[500px] border border-white/20 flex flex-col"
            variants={modalScale}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 font-heading">
              <Calendar className="h-4 w-4 text-vida-teal" />
              Prendre un rendez-vous
            </h3>
            {/* Indicateur de progression */}
            <div className="flex items-center gap-2 mt-2">
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
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-vida-teal text-white scale-110'
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
          </div>
          <button 
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors ml-4"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <form 
            onSubmit={(e) => {
              e.preventDefault(); // Toujours empêcher le comportement par défaut
            }} 
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
              {/* Étape 1 : Informations personnelles */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-vida-teal" />
                      Vos informations
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="firstName" className="block text-xs font-medium text-gray-700 mb-1">
                        Prénom <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('firstName')}
                        ref={(e) => {
                          register('firstName').ref(e);
                          (firstNameRef as any).current = e;
                        }}
                        type="text"
                        id="firstName"
                        onKeyDown={(e) => handleKeyDown(e, lastNameRef)}
                        className={`w-full px-3 py-2 text-xs bg-white border ${errors.firstName ? 'border-red-500' : 'border-gray-200'} rounded-md outline-none focus:ring-1 focus:ring-vida-teal/30 transition-colors`}
                        placeholder="Votre prénom"
                      />
                      {errors.firstName && <p className="mt-1 text-[10px] text-red-500 italic">{errors.firstName.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-xs font-medium text-gray-700 mb-1">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('lastName')}
                        ref={(e) => {
                          register('lastName').ref(e);
                          (lastNameRef as any).current = e;
                        }}
                        type="text"
                        id="lastName"
                        onKeyDown={(e) => handleKeyDown(e, phoneRef)}
                        className={`w-full px-3 py-2 text-xs bg-white border ${errors.lastName ? 'border-red-500' : 'border-gray-200'} rounded-md outline-none focus:ring-1 focus:ring-vida-teal/30 transition-colors`}
                        placeholder="Votre nom"
                      />
                      {errors.lastName && <p className="mt-1 text-[10px] text-red-500 italic">{errors.lastName.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">
                        Téléphone <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('phone')}
                        ref={(e) => {
                          register('phone').ref(e);
                          (phoneRef as any).current = e;
                        }}
                        type="tel"
                        id="phone"
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setValue('phone', value, { shouldValidate: true });
                        }}
                        value={formatPhoneNumber(formData.phone || '')}
                        onKeyDown={(e) => handleKeyDown(e, emailRef)}
                        className={`w-full px-3 py-2 text-xs bg-white border ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-md outline-none focus:ring-1 focus:ring-vida-teal/30 transition-colors`}
                        placeholder="06 XXX XX XX"
                        maxLength={14}
                      />
                      {errors.phone && <p className="mt-1 text-[10px] text-red-500 italic">{errors.phone.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        {...register('email')}
                        ref={(e) => {
                          register('email').ref(e);
                          (emailRef as any).current = e;
                        }}
                        type="email"
                        id="email"
                        className={`w-full px-3 py-2 text-xs bg-white border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-md outline-none focus:ring-1 focus:ring-vida-teal/30 transition-colors`}
                        placeholder="votre@email.com (optionnel)"
                      />
                      {errors.email && <p className="mt-1 text-[10px] text-red-500 italic">{errors.email.message}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 2 : Type de consultation */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Stethoscope className="h-3.5 w-3.5 text-vida-teal" />
                    Type de consultation
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(CONSULTATION_TYPES).map(([value, config]) => (
                      <label
                        key={value}
                        className={`relative flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-all ${
                          formData.consultationType === value
                            ? 'border-vida-teal bg-vida-teal/5'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          {...register('consultationType')}
                          type="radio"
                          value={value}
                          className="text-vida-teal focus:ring-vida-teal"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-900">{config.label}</p>
                          <p className="text-[10px] text-gray-500">
                            {formatPrice(getConsultationTypePrice(value, dynamicPrices))}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Étape 3 : Date et heure */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-vida-teal" />
                    Date et heure
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Colonne gauche : Date */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Date souhaitée <span className="text-red-500">*</span>
                      </label>
                      <button
                        ref={dateButtonRef}
                        type="button"
                        onClick={toggleCalendar}
                        className={`w-full px-3 py-2 text-xs bg-white border ${errors.date ? 'border-red-500' : 'border-gray-200'} rounded-md outline-none focus:ring-1 focus:ring-vida-teal/30 transition-colors text-left`}
                      >
                        {formatDisplayDate(formData.date)}
                      </button>
                      {errors.date && <p className="mt-1 text-[10px] text-red-500 italic">{errors.date.message}</p>}
                    </div>
                    
                    {/* Colonne droite : Créneaux */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Créneau horaire <span className="text-red-500">*</span>
                      </label>
                      
                      {!formData.date && (
                        <div className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-md">
                          Sélectionnez d'abord une date
                        </div>
                      )}
                      
                      {slotsLoading && formData.date && (
                        <div className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-md flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Chargement des créneaux...
                        </div>
                      )}
                      
                      {!slotsLoading && formData.date && availableSlots.length === 0 && (
                        <div className="text-xs text-gray-500 italic bg-orange-50 p-3 rounded-md border border-orange-200">
                          {isSameDay(new Date(formData.date + 'T00:00:00'), new Date()) 
                            ? 'Aucun créneau disponible aujourd\'hui (délai minimum : 2h)'
                            : 'Aucun créneau disponible pour cette date'}
                        </div>
                      )}
                      
                      {!slotsLoading && formData.date && availableSlots.length > 0 && (
                        <div className="space-y-4">
                          {timeSlots.morning.length > 0 && (
                            <div>
                              <h5 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Clock className="h-3 w-3 text-vida-teal" />
                                Matin
                              </h5>
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {timeSlots.morning.map((slot: string) => (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => toggleTimeSlot(slot)}
                                    className={`px-3 py-2.5 text-xs font-medium rounded-md border transition-all duration-200 ${
                                      formData.time === slot
                                        ? 'bg-vida-teal text-white border-vida-teal shadow-sm'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-vida-teal hover:bg-vida-teal/5 hover:text-vida-teal'
                                    }`}
                                  >
                                    {slot}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          {timeSlots.afternoon.length > 0 && (
                            <div>
                              <h5 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Clock className="h-3 w-3 text-vida-teal" />
                                Après-midi
                              </h5>
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {timeSlots.afternoon.map((slot: string) => (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => toggleTimeSlot(slot)}
                                    className={`px-3 py-2.5 text-xs font-medium rounded-md border transition-all duration-200 ${
                                      formData.time === slot
                                        ? 'bg-vida-teal text-white border-vida-teal shadow-sm'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-vida-teal hover:bg-vida-teal/5 hover:text-vida-teal'
                                    }`}
                                  >
                                    {slot}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {errors.time && <p className="mt-1 text-[10px] text-red-500 italic">{errors.time.message}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 4 : Motif */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-vida-teal" />
                    Motif de consultation <span className="text-gray-400 font-normal">(optionnel)</span>
                  </h4>
                  <textarea
                    {...register('reason')}
                    id="reason"
                    rows={3}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-md outline-none focus:ring-1 focus:ring-vida-teal/30 transition-colors resize-none"
                    placeholder="Décrivez brièvement le motif de votre consultation..."
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 flex-shrink-0">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Précédent
                </button>
              )}
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-vida-teal hover:bg-vida-teal/90 rounded-md transition-colors"
                >
                  Suivant
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-white bg-vida-teal rounded-md hover:bg-vida-teal/90 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirmer le rendez-vous'}
                </button>
              )}
            </div>
          </form>
        </div>
      </motion.div>

      {/* Calendrier dropdown - position fixed pour éviter overflow */}
      {showCalendar && (
        <div 
          data-calendar
          className="fixed bg-white rounded-xl shadow-2xl border border-gray-300 p-4 z-[9999]"
          style={{
            top: calendarStyle.top,
            left: calendarStyle.left,
            width: calendarStyle.width
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <button 
              type="button"
              onClick={() => changeMonth(-1)}
              className="p-1 hover:bg-vida-teal/20 rounded-full transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-vida-teal" />
            </button>
            <span className="text-xs font-medium text-gray-700">
              {format(currentMonth, 'MMMM yyyy', { locale: fr }).toUpperCase()}
            </span>
            <button 
              type="button"
              onClick={() => changeMonth(1)}
              className="p-1 hover:bg-vida-teal/20 rounded-full transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-vida-teal" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'].map(day => (
              <div key={day} className="h-6 flex items-center justify-center text-[10px] font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-3">
            {renderCalendarDays()}
          </div>
          
          {/* Légende */}
          <div className="pt-2 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-1.5 text-[9px]">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-vida-teal"></div>
                <span className="text-gray-600">Disponible</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                <span className="text-gray-600">Samedi</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-gray-600">Férié</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <span className="text-gray-600">Fermé</span>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </AnimatePresence>
  );
}