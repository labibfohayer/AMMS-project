/* eslint-disable */
import { ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  color, 
  icon 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  color: string; 
  icon?: ReactNode 
}) {
  const { d } = useLanguage();
  const colorStyles: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
    blue: {
      bg: 'bg-blue-50/50',
      border: 'border-blue-200/80 hover:border-blue-400',
      text: 'text-blue-700',
      iconBg: 'bg-blue-500/10 text-blue-600',
    },
    green: {
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-200/80 hover:border-emerald-400',
      text: 'text-emerald-700',
      iconBg: 'bg-emerald-500/10 text-emerald-600',
    },
    red: {
      bg: 'bg-rose-50/50',
      border: 'border-rose-200/80 hover:border-rose-400',
      text: 'text-rose-700',
      iconBg: 'bg-rose-500/10 text-rose-600',
    },
    orange: {
      bg: 'bg-amber-50/50',
      border: 'border-amber-200/80 hover:border-amber-400',
      text: 'text-amber-700',
      iconBg: 'bg-amber-500/10 text-amber-600',
    },
    purple: {
      bg: 'bg-purple-50/50',
      border: 'border-purple-200/80 hover:border-purple-400',
      text: 'text-purple-700',
      iconBg: 'bg-purple-500/10 text-purple-600',
    },
  };

  const style = colorStyles[color] || colorStyles.blue;

  const displayVal = typeof value === 'number' ? d(value) : String(value).replace(/[0-9]+/g, (m) => d(m));

  return (
    <div className={`p-5 rounded-2xl bg-white border ${style.border} shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group`}>
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
          <h3 className={`text-2xl sm:text-3xl font-extrabold mt-1.5 ${style.text}`}>{displayVal}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg} transition-transform group-hover:scale-110`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
