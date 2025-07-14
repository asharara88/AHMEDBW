import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle: string;
  icon: LucideIcon;
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red';
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  onClick?: () => void;
}

const colorClasses = {
  green: {
    bg: 'bg-green-50 border-green-200',
    icon: 'text-green-600',
    value: 'text-green-700',
    trend: 'text-green-500'
  },
  blue: {
    bg: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    value: 'text-blue-700',
    trend: 'text-blue-500'
  },
  purple: {
    bg: 'bg-purple-50 border-purple-200',
    icon: 'text-purple-600',
    value: 'text-purple-700',
    trend: 'text-purple-500'
  },
  orange: {
    bg: 'bg-orange-50 border-orange-200',
    icon: 'text-orange-600',
    value: 'text-orange-700',
    trend: 'text-orange-500'
  },
  red: {
    bg: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    value: 'text-red-700',
    trend: 'text-red-500'
  }
};

export default function MetricCard({ 
  title, 
  value, 
  unit, 
  subtitle, 
  icon: Icon, 
  color, 
  trend, 
  trendValue,
  onClick 
}: MetricCardProps) {
  const classes = colorClasses[color];
  
  return (
    <div 
      className={`${classes.bg} border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 ${classes.icon}`} />
        {trend && trendValue && (
          <div className={`text-sm font-medium ${classes.trend}`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="flex items-baseline space-x-1">
          <span className={`text-3xl font-bold ${classes.value}`}>{value}</span>
          {unit && <span className="text-sm text-gray-500">{unit}</span>}
        </div>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}