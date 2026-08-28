import React from 'react';

interface CompanyBadgeProps {
  companyId: string;
  companyName: string;
  size?: 'sm' | 'md' | 'lg';
  showLogo?: boolean;
}

export const CompanyBadge: React.FC<CompanyBadgeProps> = ({
  companyId,
  companyName,
  size = 'md',
  showLogo = true,
}) => {
  const getColors = () => {
    switch (companyId.toLowerCase()) {
      case 'vodafone':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          badgeBg: 'bg-red-600',
          dot: 'bg-red-500',
          iconText: 'VF',
        };
      case 'orange':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-200',
          badgeBg: 'bg-orange-500',
          dot: 'bg-orange-500',
          iconText: 'OR',
        };
      case 'etisalat':
        return {
          bg: 'bg-lime-50',
          text: 'text-lime-800',
          border: 'border-lime-200',
          badgeBg: 'bg-lime-600',
          dot: 'bg-lime-600',
          iconText: 'e&',
        };
      case 'we':
      case 'telecom_egypt':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200',
          badgeBg: 'bg-purple-600',
          dot: 'bg-purple-500',
          iconText: 'WE',
        };
      default:
        return {
          bg: 'bg-slate-100',
          text: 'text-slate-700',
          border: 'border-slate-200',
          badgeBg: 'bg-slate-700',
          dot: 'bg-slate-500',
          iconText: 'TEL',
        };
    }
  };

  const style = getColors();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-sm px-2.5 py-1 gap-2',
    lg: 'text-base px-3.5 py-1.5 gap-2.5 font-bold',
  };

  const logoSizes = {
    sm: 'w-4 h-4 text-[9px]',
    md: 'w-5 h-5 text-[10px]',
    lg: 'w-6 h-6 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border ${style.bg} ${style.text} ${style.border} ${sizeClasses[size]}`}
    >
      {showLogo && (
        <span
          className={`inline-flex items-center justify-center rounded-full text-white font-extrabold ${style.badgeBg} ${logoSizes[size]} shrink-0`}
        >
          {style.iconText}
        </span>
      )}
      <span>{companyName}</span>
    </span>
  );
};
