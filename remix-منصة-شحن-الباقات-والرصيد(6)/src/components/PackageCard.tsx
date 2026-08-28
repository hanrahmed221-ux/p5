import React from 'react';
import { Package, Company } from '../types';
import { CompanyBadge } from './CompanyBadge';
import { Check, Clock, Zap, ArrowLeft } from 'lucide-react';

interface PackageCardProps {
  pkg: Package;
  companies: Company[];
  currency?: string;
  onSelect: (pkg: Package) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  companies,
  currency = 'جنيه',
  onSelect,
}) => {
  const company = companies.find((c) => c.id === pkg.company_id);
  const companyName = company?.name || pkg.company_id;

  const getCardBorderColor = (companyId: string) => {
    switch (companyId) {
      case 'vodafone':
        return 'hover:border-red-400 group-hover:shadow-red-600/10';
      case 'orange':
        return 'hover:border-orange-400 group-hover:shadow-orange-500/10';
      case 'etisalat':
        return 'hover:border-lime-500 group-hover:shadow-lime-600/10';
      case 'we':
        return 'hover:border-purple-400 group-hover:shadow-purple-600/10';
      default:
        return 'hover:border-emerald-400 group-hover:shadow-emerald-600/10';
    }
  };

  const getButtonBg = (companyId: string) => {
    switch (companyId) {
      case 'vodafone':
        return 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-red-600/20';
      case 'orange':
        return 'bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-500 shadow-orange-500/20';
      case 'etisalat':
        return 'bg-lime-700 hover:bg-lime-800 text-white focus:ring-lime-600 shadow-lime-700/20';
      case 'we':
        return 'bg-purple-700 hover:bg-purple-800 text-white focus:ring-purple-500 shadow-purple-700/20';
      default:
        return 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-emerald-600/20';
    }
  };

  return (
    <div
      id={`package-card-${pkg.id}`}
      className={`group relative bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${getCardBorderColor(
        pkg.company_id
      )}`}
    >
      {/* Top Badge (if any) */}
      {pkg.badge && (
        <div className="absolute -top-3 left-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
            <Zap className="w-3 h-3 fill-white" />
            <span>{pkg.badge}</span>
          </span>
        </div>
      )}

      {/* Card Header: Company & Duration */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <CompanyBadge companyId={pkg.company_id} companyName={companyName} size="sm" />

          {pkg.duration && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-bold bg-slate-100/90 px-2.5 py-1 rounded-xl">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{pkg.duration}</span>
            </span>
          )}
        </div>

        {/* Package Title */}
        <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
          {pkg.name}
        </h3>

        {/* Quota Highlight Pill */}
        {pkg.quota && (
          <div className="mt-2.5 inline-block">
            <span className="inline-block px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-extrabold border border-emerald-200/80">
              {pkg.quota}
            </span>
          </div>
        )}

        {/* Description */}
        {pkg.description && (
          <p className="mt-3 text-xs text-slate-500 leading-relaxed line-clamp-2">
            {pkg.description}
          </p>
        )}

        {/* Features list */}
        {pkg.features && pkg.features.length > 0 && (
          <ul className="mt-4 space-y-2 border-t border-slate-100 pt-3">
            {pkg.features.map((feat, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span className="leading-tight">{feat}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Card Footer: Price & Order Action */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-slate-400 block font-bold">سعر الشحن</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {pkg.price}
            </span>
            <span className="text-xs font-bold text-slate-500">{currency}</span>
          </div>
        </div>

        <button
          id={`select-pkg-btn-${pkg.id}`}
          onClick={() => onSelect(pkg)}
          className={`flex items-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm transition-all duration-150 cursor-pointer shadow-md hover:scale-102 active:scale-98 focus:outline-hidden focus:ring-2 focus:ring-offset-2 ${getButtonBg(
            pkg.company_id
          )}`}
        >
          <span>اختيار الباقة</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
