import { useMemo } from 'react';
import { format, addDays, isSameDay, isBefore, startOfDay } from 'date-fns';
import { useClinicSchedules, useClinicHolidays } from './useCMS';

// Configuration centralisée de la clinique
const CLINIC_CONFIG = {
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
  
  // Horaires par défaut (fallback si pas de CMS)
  schedule: {
    weekday: {
      morning: ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
      afternoon: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30']
    },
    saturday: {
      morning: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00']
    }
  }
};

interface UseDateTimeValidationOptions {
  excludeAppointmentId?: number; // Pour exclure un RDV lors de la vérification de disponibilité
}

export function useDateTimeValidation(options: UseDateTimeValidationOptions = {}) {
  const { data: schedules } = useClinicSchedules();
  const { data: holidays } = useClinicHolidays();

  // Vérifier si une date est disponible
  const isDateAvailable = useMemo(() => {
    return (date: Date): boolean => {
      const today = startOfDay(new Date());
      const selectedDate = startOfDay(date);
      
      // 1. Passé (avant aujourd'hui)
      if (isBefore(selectedDate, today)) return false;
      
      // 2. Trop loin (> 90 jours)
      const maxDate = addDays(today, CLINIC_CONFIG.maxAdvanceDays);
      if (isBefore(maxDate, selectedDate)) return false;
      
      // 3. Jour fermé (Dimanche)
      if (CLINIC_CONFIG.closedDays.includes(date.getDay())) return false;
      
      // 4. Jour férié
      const dateStr = format(date, 'yyyy-MM-dd');
      const isHoliday = holidays?.some(h => h.date === dateStr) || CLINIC_CONFIG.holidays.includes(dateStr);
      if (isHoliday) return false;
      
      // 5. Vérifier si la clinique est ouverte ce jour (selon CMS)
      if (schedules && schedules.length > 0) {
        const dayOfWeek = date.getDay();
        const djangoDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const schedule = schedules.find(s => s.day_of_week === djangoDay);
        
        if (!schedule || !schedule.is_open) return false;
      }
      
      return true;
    };
  }, [schedules, holidays]);

  // Vérifier si un créneau horaire est disponible
  const isTimeSlotAvailable = useMemo(() => {
    return (date: Date, timeSlot: string): boolean => {
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
  }, []);

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
  const getAvailableSlots = useMemo(() => {
    return (date: Date): string[] => {
      const dayOfWeek = date.getDay();
      const djangoDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      let allSlots: string[] = [];
      
      // Utiliser les horaires du CMS si disponibles
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
        // Fallback : horaires par défaut
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
      
      // Filtrer les créneaux selon l'heure actuelle
      return allSlots.filter(slot => isTimeSlotAvailable(date, slot));
    };
  }, [schedules, isTimeSlotAvailable]);

  // Obtenir la classe CSS pour une date dans le calendrier
  const getDateClassName = useMemo(() => {
    return (date: Date, selectedDate?: string): string => {
      const isDisabled = !isDateAvailable(date);
      const dateStr = format(date, 'yyyy-MM-dd');
      const isSelected = selectedDate === dateStr;
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
  }, [isDateAvailable, holidays]);

  // Obtenir un message d'erreur si la date n'est pas valide
  const getDateErrorMessage = (date: Date): string | null => {
    const today = startOfDay(new Date());
    const selectedDate = startOfDay(date);
    
    if (isBefore(selectedDate, today)) {
      return 'Cette date est dans le passé';
    }
    
    const maxDate = addDays(today, CLINIC_CONFIG.maxAdvanceDays);
    if (isBefore(maxDate, selectedDate)) {
      return `Vous ne pouvez pas réserver plus de ${CLINIC_CONFIG.maxAdvanceDays} jours à l'avance`;
    }
    
    if (CLINIC_CONFIG.closedDays.includes(date.getDay())) {
      return 'La clinique est fermée le dimanche';
    }
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const isHoliday = holidays?.some(h => h.date === dateStr) || CLINIC_CONFIG.holidays.includes(dateStr);
    if (isHoliday) {
      return 'La clinique est fermée ce jour férié';
    }
    
    if (schedules && schedules.length > 0) {
      const dayOfWeek = date.getDay();
      const djangoDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const schedule = schedules.find(s => s.day_of_week === djangoDay);
      
      if (!schedule || !schedule.is_open) {
        return 'La clinique est fermée ce jour';
      }
    }
    
    return null;
  };

  return {
    isDateAvailable,
    isTimeSlotAvailable,
    getAvailableSlots,
    getDateClassName,
    getDateErrorMessage,
    config: CLINIC_CONFIG,
  };
}
