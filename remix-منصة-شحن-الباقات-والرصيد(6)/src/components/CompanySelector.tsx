import React from 'react';
import { Company } from '../types';
import { Layers } from 'lucide-react';

interface CompanySelectorProps {
  companies: Company[];
  selectedCompanyId: string;
  onSelectCompany: (companyId: string) => void;
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({
  companies,
  selectedCompanyId,
  onSelectCompany,
}) => {
  const getCompanyStyles = (id: string, isSelected: boolean) => {
    switch (id) {
      case 'vodafone':
        return isSelected
          ? 'bg-red-600 text-white shadow-md shadow-red-600/20 border-red-600 ring-2 ring-red-600/20'
          : 'bg-white text-slate-800 border-slate-200/80 hover:border-red-400 hover:bg-red-50/40';
      case 'orange':
        return isSelected
          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 border-orange-500 ring-2 ring-orange-500/20'
          : 'bg-white text-slate-800 border-slate-200/80 hover:border-orange-400 hover:bg-orange-50/40';
      case 'etisalat':
        return isSelected
          ? 'bg-lime-700 text-white shadow-md shadow-lime-700/20 border-lime-700 ring-2 ring-lime-700/20'
          : 'bg-white text-slate-800 border-slate-200/80 hover:border-lime-400 hover:bg-lime-50/40';
      case 'we':
        return isSelected
          ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20 border-purple-700 ring-2 ring-purple-700/20'
          : 'bg-white text-slate-800 border-slate-200/80 hover:border-purple-400 hover:bg-purple-50/40';
      default:
        return isSelected
          ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 border-slate-900 ring-2 ring-slate-900/20'
          : 'bg-white text-slate-800 border-slate-200/80 hover:border-slate-400 hover:bg-slate-50';
    }
  };

  const getCompanyLogoBadge = (id: string) => {
    switch (id) {
      case 'vodafone':
        return { text: 'VF', bg: 'bg-red-600 text-white' };
      case 'orange':
        return { text: 'OR', bg: 'bg-orange-500 text-white' };
      case 'etisalat':
        return { text: 'e&', bg: 'bg-lime-600 text-white' };
      case 'we':
        return { text: 'WE', bg: 'bg-purple-600 text-white' };
      default:
        return { text: 'ALL', bg: 'bg-slate-700 text-white' };
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>١. اختر شركة الاتصالات (الشبكة):</span>
        </h2>
        {selectedCompanyId !== 'all' && (
          <button
            onClick={() => onSelectCompany('all')}
            className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            عرض جميع الشبكات
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
        {/* All Companies Option */}
        <button
          id="company-filter-all"
          onClick={() => onSelectCompany('all')}
          className={`flex items-center justify-center gap-2.5 p-3.5 sm:p-4 rounded-2xl border-2 font-black text-xs sm:text-sm transition-all duration-150 cursor-pointer ${
            selectedCompanyId === 'all'
              ? 'bg-slate-950 text-white border-slate-950 shadow-md shadow-slate-950/20'
              : 'bg-white text-slate-700 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
              selectedCompanyId === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Layers className="w-4 h-4" />
          </div>
          <span>جميع الشبكات</span>
        </button>

        {/* Dynamic Company Buttons */}
        {companies.map((comp) => {
          const isSelected = selectedCompanyId === comp.id;
          const badge = getCompanyLogoBadge(comp.id);
          const styling = getCompanyStyles(comp.id, isSelected);

          return (
            <button
              key={comp.id}
              id={`company-filter-${comp.id}`}
              onClick={() => onSelectCompany(comp.id)}
              className={`flex items-center justify-center gap-2.5 p-3.5 sm:p-4 rounded-2xl border-2 font-black text-xs sm:text-sm transition-all duration-150 cursor-pointer shadow-xs ${styling}`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                  isSelected ? 'bg-white/20 text-white' : badge.bg
                }`}
              >
                {badge.text}
              </div>
              <span className="leading-tight truncate">{comp.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
