import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  description,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor,
  bgColor,
  onClick
}: StatCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${onClick ? 'cursor-pointer select-none active:scale-98' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
            {value}
          </h3>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bgColor} ${iconColor} shadow-inner`}>
          <Icon size={20} />
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100/80">
        <span className="text-[11px] text-slate-400 font-medium truncate">{description}</span>
        {change && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0
            ${changeType === 'increase' ? 'bg-teal-50 text-teal-600' : ''}
            ${changeType === 'decrease' ? 'bg-red-50 text-red-600' : ''}
            ${changeType === 'neutral' ? 'bg-slate-100 text-slate-600' : ''}
          `}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
