import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}

export function StatsCard({ icon: Icon, label, value, subValue, color = "text-sage-600" }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-full bg-stone-50 mb-3 ${color}`}>
        <Icon size={24} />
      </div>
      <h3 className="text-stone-500 text-sm font-medium uppercase tracking-wide">{label}</h3>
      <div className="text-3xl font-bold text-stone-800 mt-1">{value}</div>
      {subValue && (
        <div className="text-xs text-stone-400 mt-2 font-medium">
          {subValue}
        </div>
      )}
    </div>
  );
}
