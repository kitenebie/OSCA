import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar } from 'lucide-react';

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  maxDate?: string;
  placeholder?: string;
  className?: string;
  onBlur?: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  maxDate,
  placeholder = 'Select date',
  className = '',
  onBlur,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Parse current value or default
  const parsed = useMemo(() => {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      return { year: y, month: m, day: d };
    }
    // Default to maxDate if set, else today
    if (maxDate) {
      const [y, m, d] = maxDate.split('-').map(Number);
      return { year: y, month: m, day: d };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }, [value, maxDate]);

  const [selMonth, setSelMonth] = useState(parsed.month);
  const [selDay, setSelDay] = useState(parsed.day);
  const [selYear, setSelYear] = useState(parsed.year);

  // Sync when value changes externally
  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      setSelYear(y);
      setSelMonth(m);
      setSelDay(d);
    }
  }, [value]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onBlur?.();
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onBlur]);

  // Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) { setIsOpen(false); onBlur?.(); }
    }
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onBlur]);

  // Year range (for senior citizens: ~1900 to maxDate year)
  const maxYear = maxDate ? parseInt(maxDate.split('-')[0], 10) : new Date().getFullYear();
  const minYear = 1900;
  const years = useMemo(() => {
    const arr = [];
    for (let y = maxYear; y >= minYear; y--) arr.push(y);
    return arr;
  }, [maxYear]);

  // Days in selected month/year
  const daysCount = getDaysInMonth(selYear, selMonth - 1);
  const days = useMemo(() => {
    const arr = [];
    for (let d = 1; d <= daysCount; d++) arr.push(d);
    return arr;
  }, [daysCount]);

  // Clamp day if month/year change reduces days
  useEffect(() => {
    if (selDay > daysCount) setSelDay(daysCount);
  }, [daysCount, selDay]);

  // Check if a specific date is disabled (after maxDate)
  const isDateDisabled = (y: number, m: number, d: number) => {
    if (!maxDate) return false;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return dateStr > maxDate;
  };

  // Confirm selection
  const handleConfirm = () => {
    if (isDateDisabled(selYear, selMonth, selDay)) return;
    const dateStr = `${selYear}-${String(selMonth).padStart(2, '0')}-${String(selDay).padStart(2, '0')}`;
    onChange(dateStr);
    setIsOpen(false);
    onBlur?.();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 hover:border-slate-300 ${
          value ? 'text-slate-800 font-semibold' : 'text-slate-400'
        }`}
      >
        <span className="truncate">
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
      </button>

      {/* Floating Picker */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-4 animate-in fade-in slide-in-from-top-1 w-full min-w-[340px]">
          {/* 3-column layout: Month | Day | Year */}
          <div className="grid grid-cols-11 gap-2">
            {/* MONTH COLUMN (3 cols) */}
            <div className="col-span-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 text-center">Month</p>
              <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                {SHORT_MONTHS.map((m, idx) => {
                  const monthNum = idx + 1;
                  const disabled = isDateDisabled(selYear, monthNum, 1);
                  return (
                    <button
                      key={m}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelMonth(monthNum)}
                      className={`px-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        disabled ? 'text-slate-300 cursor-not-allowed' :
                        selMonth === monthNum
                          ? 'bg-teal-500 text-white font-semibold shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DAY COLUMN (5 cols) */}
            <div className="col-span-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 text-center">Day</p>
              <div className="grid grid-cols-5 gap-1 max-h-48 overflow-y-auto">
                {days.map((d) => {
                  const disabled = isDateDisabled(selYear, selMonth, d);
                  return (
                    <button
                      key={d}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelDay(d)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                        disabled ? 'text-slate-300 cursor-not-allowed' :
                        selDay === d
                          ? 'bg-teal-500 text-white font-semibold shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* YEAR COLUMN (3 cols) */}
            <div className="col-span-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 text-center">Year</p>
              <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto pr-1">
                {years.map((y) => {
                  const disabled = maxDate ? y > maxYear : false;
                  return (
                    <button
                      key={y}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelYear(y)}
                      className={`px-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        disabled ? 'text-slate-300 cursor-not-allowed' :
                        selYear === y
                          ? 'bg-teal-500 text-white font-semibold shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Preview + Confirm */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-600">
              {SHORT_MONTHS[selMonth - 1]} {selDay}, {selYear}
              {isDateDisabled(selYear, selMonth, selDay) && (
                <span className="text-red-500 text-xs ml-2">(invalid)</span>
              )}
            </span>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDateDisabled(selYear, selMonth, selDay)}
              className="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
