'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Clock } from 'lucide-react';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { useDropdownContext } from '@/contexts/DropdownContext';

interface TimePickerProps {
  value: string; // Format: HH:MM
  onChange: (time: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  minTime?: string; // Format: HH:MM
  maxTime?: string; // Format: HH:MM
  disabled?: boolean;
  placeholder?: string;
  step?: number; // Minutes (15, 30, 60)
  id?: string;
  className?: string;
}

export default function TimePicker({
  value,
  onChange,
  label,
  required = false,
  error,
  minTime = '08:00',
  maxTime = '18:00',
  disabled = false,
  placeholder = 'Sélectionner une heure',
  step = 30,
  id,
  className = '',
}: TimePickerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const timeButtonRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  // Contexte global des dropdowns (un seul ouvert à la fois)
  const { openDropdownId, openDropdown, closeDropdown, registerDropdown } = useDropdownContext();
  
  // ID unique pour ce dropdown
  const dropdownId = useMemo(() => registerDropdown(), [registerDropdown]);
  
  // État d'ouverture basé sur le contexte global
  const showPicker = openDropdownId === dropdownId;
  
  // Calculer la position du dropdown pour le portail avec positionnement intelligent
  const dropdownPosition = useDropdownPosition(timeButtonRef, showPicker, {
    maxHeight: 300,
    offset: 8,
    preferredDirection: 'auto',
  });

  // S'assurer que le composant est monté côté client (pour le portail)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fermer le picker au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPicker && timeButtonRef.current && !timeButtonRef.current.contains(event.target as Node)) {
        if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
          closeDropdown();
        }
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPicker, closeDropdown]);

  const togglePicker = () => {
    if (disabled) return;
    
    if (showPicker) {
      closeDropdown();
    } else {
      openDropdown(dropdownId);
    }
  };

  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    const [minHour, minMinute] = minTime.split(':').map(Number);
    const [maxHour, maxMinute] = maxTime.split(':').map(Number);

    let currentHour = minHour;
    let currentMinute = minMinute;

    while (
      currentHour < maxHour ||
      (currentHour === maxHour && currentMinute <= maxMinute)
    ) {
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      slots.push(timeStr);

      currentMinute += step;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Séparer matin et après-midi
  const morningSlots = timeSlots.filter((slot) => {
    const hour = parseInt(slot.split(':')[0]);
    return hour < 12;
  });

  const afternoonSlots = timeSlots.filter((slot) => {
    const hour = parseInt(slot.split(':')[0]);
    return hour >= 12;
  });

  const selectTime = (time: string) => {
    onChange(time);
    closeDropdown();
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none z-10" />
        <button
          ref={timeButtonRef}
          id={id}
          type="button"
          onClick={togglePicker}
          disabled={disabled}
          className={`w-full pl-9 pr-3 py-2 text-xs bg-white border ${
            error ? 'border-red-500' : 'border-gray-200'
          } rounded-md outline-none focus:ring-1 focus:ring-vida-teal/30 transition-colors text-left ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label={label || 'Sélectionner une heure'}
        >
          {value || placeholder}
        </button>

        {/* Picker popup - Rendu via portail pour éviter les problèmes de z-index */}
        {isMounted && showPicker && createPortal(
          <div
            ref={pickerRef}
            className="bg-white rounded-xl shadow-2xl border border-gray-300 p-4 overflow-y-auto [&::-webkit-scrollbar]:hidden"
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

            {/* Matin */}
            {morningSlots.length > 0 && (
              <div className="mb-4">
                <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="h-3 w-3 text-vida-teal" />
                  Matin
                </h5>
                <div className="grid grid-cols-3 gap-2">
                  {morningSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => selectTime(slot)}
                      className={`px-3 py-2 text-xs font-medium rounded-md border transition-all duration-200 ${
                        value === slot
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

            {/* Après-midi */}
            {afternoonSlots.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="h-3 w-3 text-vida-teal" />
                  Après-midi
                </h5>
                <div className="grid grid-cols-3 gap-2">
                  {afternoonSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => selectTime(slot)}
                      className={`px-3 py-2 text-xs font-medium rounded-md border transition-all duration-200 ${
                        value === slot
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
          </div>,
          document.body
        )}
      </div>

      {error && <p className="mt-1 text-[10px] text-red-500 italic">{error}</p>}
    </div>
  );
}
