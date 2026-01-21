'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
        setIsVisible(true);
      }
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return {
          left: coords.x,
          top: coords.y - 8,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          left: coords.x,
          top: coords.y + 8,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          left: coords.x - 8,
          top: coords.y,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          left: coords.x + 8,
          top: coords.y,
          transform: 'translate(0, -50%)',
        };
      default:
        return {};
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[9999] pointer-events-none"
            style={getPositionStyles()}
          >
            <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
              {content}
              {/* Arrow */}
              <div
                className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
                  position === 'top'
                    ? 'bottom-[-4px] left-1/2 -translate-x-1/2'
                    : position === 'bottom'
                    ? 'top-[-4px] left-1/2 -translate-x-1/2'
                    : position === 'left'
                    ? 'right-[-4px] top-1/2 -translate-y-1/2'
                    : 'left-[-4px] top-1/2 -translate-y-1/2'
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
