import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

interface DatePickerProps {
  value: string; // ISO format
  onChange: (value: string) => void;
  label?: string;
}

export const PremiumDatePicker: React.FC<DatePickerProps> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayMonth, setDisplayMonth] = useState(new Date(value || Date.now()));

  // Formatting helpers
  const formatDateForDisplay = (iso: string) => {
    if (!iso) return 'SELECT DATE';
    const date = new Date(iso);
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const days = Array.from({ length: getDaysInMonth(displayMonth.getFullYear(), displayMonth.getMonth()) }, (_, i) => i + 1);
  const firstDay = getFirstDayOfMonth(displayMonth.getFullYear(), displayMonth.getMonth());
  const monthName = displayMonth.toLocaleString('default', { month: 'long' });

  const handleDateSelect = (day: number) => {
    const newDate = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
    onChange(newDate.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const changeMonth = (offset: number) => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + offset, 1));
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--lux-muted)] mb-2 px-1">{label}</label>}
      
      {/* Trigger Button - Matching User Screenshot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center justify-between gap-6 px-6 py-4 bg-black/60 rounded-[1.5rem] border border-white/5 hover:border-[var(--lux-gold)]/40 transition-all shadow-xl min-w-[240px]"
      >
        <div className="flex items-center gap-4">
          <CalendarIcon size={18} className="text-[var(--lux-gold)] group-hover:scale-110 transition-transform" />
          <span className="text-[14px] font-black tracking-tight text-white">{formatDateForDisplay(value)}</span>
        </div>
        <CalendarDays size={14} className="opacity-20 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Calendar Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[100] top-[calc(100%+10px)] left-0 w-80 bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-3xl shadow-2xl p-6 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/5 rounded-xl transition-all"><ChevronLeft size={16} /></button>
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--lux-gold)]">{monthName} {displayMonth.getFullYear()}</h4>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/5 rounded-xl transition-all"><ChevronRight size={16} /></button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(d => (
                <span key={d} className="text-[8px] font-black opacity-30">{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {days.map(d => {
                const dateStringsMatch = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), d).toISOString().split('T')[0] === value;
                return (
                  <button
                    key={d}
                    onClick={() => handleDateSelect(d)}
                    className={`h-10 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center ${dateStringsMatch ? 'bg-[var(--lux-gold)] text-black shadow-lg shadow-[var(--lux-gold)]/20 scale-110' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
