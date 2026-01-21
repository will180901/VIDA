'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfDay, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { useDropdownContext } from '@/contexts/DropdownContext';

interface DatePickerProps {
  value: string; // Format: YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  minDate?: string; // Format: YYYY-MM-DD
  maxDate?: string; // Format: YYYY-MM-DD
  disabled?: boolean;
  placeholder?: string;
  disabledDates?: string[]; // Array of dates to disable (YYYY-MM-DD)
  highlightWeekends?: boolean;
  id?: string;
  className?: string;
}

export default function DatePicker({
  value,
  onChange,
  label,
  required = false,
  error,
  minDate,
  maxDate,
  disabled = false,
  placeholder = 'Sélectionner une date',
  disabledDates = [],
  highlightWeekends = true,
  id,
  className = '',
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value + 'T00:00:00') : new Date()
  );
  const [isMounted, setIsMounted] = useState(false);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Contexte global des dropdowns (un seul ouvert à la fois)
  const { openDropdownId, openDropdown, closeDropdown, registerDropdown } = useDropdownContext();
  
  // ID unique pour ce dropdown
  const dropdownId = useMemo(() => registerDropdown(), [registerDropdown]);
  
  // État d'ouverture basé sur le contexte global
  const showCalendar = openDropdownId === dropdownId;
  
  // Calculer la position du dropdown pour le portail avec positionnement intelligent
  const dropdownPosition = useDropdownPosition(dateButtonRef, showCalendar, {
    maxHeight: 350,
    offset: 8,
    preferredDirection: 'auto',
  });

  // S'assurer que le composant est monté côté client (pour le portail)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fermer le calendrier au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCalendar && dateButtonRef.current && !dateButtonRef.current.contains(event.target as Node)) {
        if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
          closeDropdown();
        }
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCalendar, closeDropdown]);

  const toggleCalendar = () => {
    if (disabled) return;
    
    if (showCalendar) {
      closeDropdown();
    } else {
      openDropdown(dropdownId);
    }
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return placeholder;
    const date = new Date(dateString + 'T00:00:00');
    return format(date, 'EEEE d MMMM yyyy', { locale: fr });
  };

  const isDateDisabled = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Vérifier date min
    if (minDate && dateStr < minDate) return true;
    
    // Vérifier date max
    if (maxDate && dateStr > maxDate) return true;
    
    // Vérifier dates désactivées
    if (disabledDates.includes(dateStr)) return true;
    
    return false;
  };

  const getDateClassName = (date: Date): string => {
    const isDisabled = isDateDisabled(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    const isSelected = value === dateStr;
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (isDisabled) {
      return 'text-gray-300 cursor-not-allowed';
    }
    
    if (isSelected) {
      return 'bg-vida-teal text-white shadow-sm font-semibold';
    }
    
    if (highlightWeekends && dayOfWeek === 6) {
      return 'text-orange-600 hover:bg-orange-50 font-medium';
    }
    
    if (highlightWeekends && dayOfWeek === 0) {
      return 'text-gray-400';
    }
    
    return 'hover:bg-vida-teal/10 hover:text-vida-teal';
  };

  const selectDate = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!isDateDisabled(selectedDate)) {
      onChange(format(selectedDate, 'yyyy-MM-dd'));
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const renderCalendarDays = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];

    // Cellules vides avant le premier jour
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-6 w-6" />);
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateClassName = getDateClassName(date);
      const isDisabled = isDateDisabled(date);
      
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
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none z-10" />
        <button
          ref={dateButtonRef}
          id={id}
          type="button"
          onClick={toggleCalendar}
          disabled={disabled}
          className={`w-full pl-9 pr-3 py-2 text-xs bg-white border ${
            error ? 'border-red-500' : 'border-gray-200'
          } rounded-md outline-none focus:ring-1 focus:ring-vida-teal/30 transition-colors text-left ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label={label || 'Sélectionner une date'}
        >
          {formatDisplayDate(value)}
        </button>

        {/* Calendrier popup - Rendu via portail pour éviter les problèmes de z-index */}
        {isMounted && showCalendar && createPortal(
          <div
            ref={calendarRef}
            className="bg-white rounded-xl shadow-2xl border border-gray-300 p-4 [&::-webkit-scrollbar]:hidden"
            style={{
              position: 'fixed',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              maxHeight: `${dropdownPosition.maxHeight}px`,
              zIndex: dropdownPosition.zIndex,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {/* Flèche décorative - Position adaptative */}
            <div
              className={`absolute w-3 h-3 rotate-45 bg-white border-gray-300 ${
                dropdownPosition.direction === 'down'
                  ? '-top-1.5 border-l border-t'
                  : '-bottom-1.5 border-r border-b'
              }`}
              style={{
                left: '20px', // Position fixe à gauche pour cohérence
              }}
            />

            {/* En-tête */}
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

            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'].map((day) => (
                <div
                  key={day}
                  className="h-6 flex items-center justify-center text-[10px] font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Jours du mois */}
            <div className="grid grid-cols-7 gap-0.5">
              {renderCalendarDays()}
            </div>
          </div>,
          document.body
        )}
      </div>
      
      {error && <p className="mt-1 text-[10px] text-red-500 italic">{error}</p>}
    </div>
  );
}
