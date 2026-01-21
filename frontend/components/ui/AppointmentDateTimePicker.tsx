'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { format, addMonths, subMonths, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useDateTimeValidation } from '@/hooks/useDateTimeValidation';
import { useAvailableSlots } from '@/hooks/useAppointments';
import { useDropdownContext } from '@/contexts/DropdownContext';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import api from '@/lib/api';

interface AppointmentDateTimePickerProps {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  excludeAppointmentId?: number;
  showCalendar?: boolean;
  showTimeSlots?: boolean;
  required?: boolean;
  dateLabel?: string;
  timeLabel?: string;
  dateError?: string;
  timeError?: string;
}

export default function AppointmentDateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  excludeAppointmentId,
  showCalendar = true,
  showTimeSlots = true,
  required = true,
  dateLabel = 'Date',
  timeLabel = 'Heure',
  dateError,
  timeError,
}: AppointmentDateTimePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [availabilitySuccess, setAvailabilitySuccess] = useState(false);
  
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Contexte global des dropdowns (un seul ouvert à la fois)
  const { openDropdownId, openDropdown, closeDropdown, registerDropdown } = useDropdownContext();
  
  // ID unique pour ce dropdown
  const dropdownId = useMemo(() => registerDropdown(), [registerDropdown]);
  
  // État d'ouverture basé sur le contexte global
  const showCalendarDropdown = openDropdownId === dropdownId;
  
  // Calculer la position du dropdown pour le portail avec positionnement intelligent
  const dropdownPosition = useDropdownPosition(dateButtonRef, showCalendarDropdown, {
    maxHeight: 400,
    offset: 8,
    preferredDirection: 'auto',
  });

  // S'assurer que le composant est monté côté client (pour le portail)
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const {
    isDateAvailable,
    getAvailableSlots,
    getDateClassName,
    getDateErrorMessage,
  } = useDateTimeValidation({ excludeAppointmentId });
  
  const { data: slotsData, isLoading: slotsLoading } = useAvailableSlots(date || null);
  
  // Calculer les créneaux disponibles
  let availableSlots = date ? (slotsData?.slots && slotsData.slots.length > 0 
    ? slotsData.slots 
    : getAvailableSlots(new Date(date + 'T00:00:00'))
  ) : [];
  
  // ✅ IMPORTANT : Si on modifie un RDV existant, ajouter le créneau actuel aux créneaux disponibles
  // Cela permet de garder le créneau actuel même s'il n'est plus dans les créneaux "disponibles"
  if (excludeAppointmentId && time && !availableSlots.includes(time)) {
    availableSlots = [...availableSlots, time].sort();
  }
  
  // Séparer matin/après-midi
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

  // Vérifier la disponibilité quand la date ou l'heure change
  useEffect(() => {
    const checkAvailability = async () => {
      if (!date || !time) {
        setAvailabilityError('');
        setAvailabilitySuccess(false);
        return;
      }

      setIsCheckingAvailability(true);
      setAvailabilityError('');
      setAvailabilitySuccess(false);

      try {
        // Vérifier si le créneau est disponible
        const response = await api.get(`/appointments/appointments/`, {
          params: { date }
        });

        const appointments = Array.isArray(response.data) ? response.data : response.data.results || [];
        
        // Vérifier si le créneau est déjà pris par un autre RDV
        const conflictingAppointment = appointments.find((apt: any) => 
          apt.id !== excludeAppointmentId &&
          apt.date === date && 
          apt.time === time &&
          ['pending', 'confirmed', 'awaiting_patient_response', 'awaiting_admin_response', 'modification_pending'].includes(apt.status)
        );

        if (conflictingAppointment) {
          setAvailabilityError('Ce créneau est déjà réservé par un autre patient.');
        } else {
          setAvailabilitySuccess(true);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de disponibilité:', error);
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    const timer = setTimeout(checkAvailability, 500); // Debounce 500ms
    return () => clearTimeout(timer);
  }, [date, time, excludeAppointmentId]);

  // ✅ SUPPRIMÉ : Ne plus réinitialiser le créneau car on l'ajoute maintenant aux disponibles
  // useEffect(() => {
  //   if (time && !availableSlots.includes(time)) {
  //     onTimeChange('');
  //   }
  // }, [availableSlots, time, onTimeChange]);

  // Fermer le calendrier au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCalendarDropdown && dateButtonRef.current && !dateButtonRef.current.contains(event.target as Node)) {
        if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
          closeDropdown();
        }
      }
    };

    if (showCalendarDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCalendarDropdown, closeDropdown]);

  const toggleCalendar = () => {
    if (showCalendarDropdown) {
      closeDropdown();
    } else {
      openDropdown(dropdownId);
    }
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'Sélectionner une date';
    const dateObj = new Date(dateString + 'T00:00:00');
    return format(dateObj, 'EEEE d MMMM yyyy', { locale: fr });
  };

  const selectDate = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (isDateAvailable(selectedDate)) {
      onDateChange(format(selectedDate, 'yyyy-MM-dd'));
      closeDropdown();
    }
  };

  const changeMonth = (direction: number) => {
    if (direction > 0) {
      setCurrentMonth(addMonths(currentMonth, 1));
    } else {
      setCurrentMonth(subMonths(currentMonth, 1));
    }
  };

  const getDaysInMonth = (dateObj: Date) => {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
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
      const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateClassName = getDateClassName(dateObj, date);
      const isDisabled = !isDateAvailable(dateObj);
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => selectDate(day)}
          disabled={isDisabled}
          className={`h-6 w-6 text-[10px] rounded-full transition-all duration-200 ${dateClassName}`}
          title={isDisabled ? getDateErrorMessage(dateObj) || 'Date non disponible' : format(dateObj, 'EEEE d MMMM yyyy', { locale: fr })}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="space-y-4">
      {/* Date Picker */}
      {showCalendar && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {dateLabel} {required && <span className="text-red-500">*</span>}
          </label>
          <button
            ref={dateButtonRef}
            type="button"
            onClick={toggleCalendar}
            className={`w-full px-3 py-2 text-xs bg-white border ${dateError ? 'border-red-500' : 'border-gray-200'} rounded-md outline-none focus:ring-1 focus:ring-vida-teal/30 transition-colors text-left flex items-center gap-2`}
          >
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span className={date ? 'text-gray-900' : 'text-gray-500'}>
              {formatDisplayDate(date)}
            </span>
          </button>
          {dateError && <p className="mt-1 text-[10px] text-red-500 italic">{dateError}</p>}
          
          {/* Calendar Dropdown - Rendu via portail pour éviter les problèmes de z-index */}
          {isMounted && showCalendarDropdown && createPortal(
            <div
              ref={calendarRef}
              className="bg-white rounded-xl shadow-2xl border border-gray-300 p-3"
              style={{
                position: 'fixed',
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                maxHeight: `${dropdownPosition.maxHeight}px`,
                zIndex: dropdownPosition.zIndex,
                minWidth: '280px',
              }}
            >
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <h4 className="text-xs font-semibold text-gray-900">
                    {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                  </h4>
                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Days of week */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                    <div key={i} className="h-6 w-6 flex items-center justify-center text-[10px] font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendarDays()}
                </div>

                {/* Legend */}
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                  <div className="flex items-center gap-2 text-[10px] text-gray-600">
                    <div className="w-3 h-3 rounded-full bg-vida-teal"></div>
                    <span>Sélectionné</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-600">
                    <div className="w-3 h-3 rounded-full bg-orange-100"></div>
                    <span>Samedi</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-600">
                    <div className="w-3 h-3 rounded-full bg-red-100"></div>
                    <span>Jour férié</span>
                  </div>
                </div>
              </div>,
            document.body
          )}
        </div>
      )}

      {/* Time Slots */}
      {showTimeSlots && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {timeLabel} {required && <span className="text-red-500">*</span>}
          </label>
          
          {!date && (
            <div className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-md border border-gray-200">
              Sélectionnez d'abord une date
            </div>
          )}
          
          {slotsLoading && date && (
            <div className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Chargement des créneaux...
            </div>
          )}
          
          {!slotsLoading && date && availableSlots.length === 0 && (
            <div className="text-xs text-gray-500 italic bg-orange-50 p-3 rounded-md border border-orange-200">
              {isSameDay(new Date(date + 'T00:00:00'), new Date()) 
                ? 'Aucun créneau disponible aujourd\'hui (délai minimum : 2h)'
                : 'Aucun créneau disponible pour cette date'}
            </div>
          )}
          
          {!slotsLoading && date && availableSlots.length > 0 && (
            <div className="space-y-3">
              {/* Matin */}
              {timeSlots.morning.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-gray-600 mb-2">Matin</p>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.morning.map((slot: string) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => onTimeChange(slot)}
                        className={`px-3 py-2 text-xs rounded-md transition-all ${
                          time === slot
                            ? 'bg-vida-teal text-white shadow-sm'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-vida-teal hover:text-vida-teal'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Après-midi */}
              {timeSlots.afternoon.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-gray-600 mb-2">Après-midi</p>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.afternoon.map((slot: string) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => onTimeChange(slot)}
                        className={`px-3 py-2 text-xs rounded-md transition-all ${
                          time === slot
                            ? 'bg-vida-teal text-white shadow-sm'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-vida-teal hover:text-vida-teal'
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
          
          {timeError && <p className="mt-1 text-[10px] text-red-500 italic">{timeError}</p>}
        </div>
      )}

      {/* Availability Status */}
      {date && time && (
        <>
          {isCheckingAvailability && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-blue-50 rounded-lg p-3 border border-blue-200 flex items-center gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <p className="text-xs text-blue-800">Vérification de la disponibilité...</p>
            </motion.div>
          )}

          {!isCheckingAvailability && availabilityError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 rounded-lg p-3 border border-red-200 flex items-start gap-2"
            >
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-800">{availabilityError}</p>
            </motion.div>
          )}

          {!isCheckingAvailability && !availabilityError && availabilitySuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 rounded-lg p-3 border border-green-200 flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 text-green-600" />
              <p className="text-xs text-green-800">✓ Ce créneau est disponible</p>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
