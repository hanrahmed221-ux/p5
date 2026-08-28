import React, { useState, useMemo } from 'react';
import { Package, Company, Category } from '../types';
import { PackageCard } from './PackageCard';
import { Search, SlidersHorizontal, RefreshCw, AlertCircle, X } from 'lucide-react';

interface PackagesGridProps {
  packages: Package[];
  companies: Company[];
  categories: Category[];
  selectedCompanyId: string;
  selectedCategoryId: string;
  currency?: string;
  onSelectPackage: (pkg: Package) => void;
  onResetFilters: () => void;
}

export const PackagesGrid: React.FC<PackagesGridProps> = ({
  packages,
  companies,
  categories,
  selectedCompanyId,
  selectedCategoryId,
  currency = 'جنيه',
  onSelectPackage,
  onResetFilters,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      // Company filter
      if (selectedCompanyId !== 'all' && pkg.company_id !== selectedCompanyId) {
        return false;
      }
      // Category filter
      if (selectedCategoryId !== 'all' && pkg.category_id !== selectedCategoryId) {
        return false;
      }
      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchName = pkg.name.toLowerCase().includes(q);
        const matchQuota = pkg.quota?.toLowerCase().includes(q);
        const matchDesc = pkg.description?.toLowerCase().includes(q);
        const matchPrice = pkg.price.toString().includes(q);
        return matchName || matchQuota || matchDesc || matchPrice;
      }
      return true;
    });
  }, [packages, selectedCompanyId, selectedCategoryId, searchTerm]);

  const activeCompanyName =
    selectedCompanyId === 'all'
      ? 'جميع الشبكات'
      : companies.find((c) => c.id === selectedCompanyId)?.name || 'الباقات';

  const activeCategoryName =
    selectedCategoryId === 'all'
      ? 'كافة الخدمات'
      : categories.find((c) => c.id === selectedCategoryId)?.name || '';

  return (
    <div id="packages-section" className="w-full space-y-5">
      {/* Search & Meta Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        {/* Results title */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-slate-900 text-sm sm:text-base">
              {activeCompanyName} — {activeCategoryName}
            </span>
            <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-bold">
              {filteredPackages.length} باقة متاحة
            </span>
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80 lg:w-96">
          <input
            id="package-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بالسعة أو السعر (مثال: 40 جيجا، فليكس...)"
            className="w-full pl-8 pr-10 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Packages: 1 on mobile, 2 on tablet, 3 on desktop, 4 on 1400px+ / 1920px */}
      {filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 w-full">
          {filteredPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              companies={companies}
              currency={currency}
              onSelect={onSelectPackage}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">لا توجد باقات تطابق خياراتك</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              لم نعثر على باقات تطابق البحث الحالي. جرب إزالة شروط الفلترة أو اختيار شبكة أخرى.
            </p>
          </div>
          <button
            id="reset-filter-btn"
            onClick={() => {
              setSearchTerm('');
              onResetFilters();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-950 text-white text-xs font-black hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة ضبط وعرض كافة الباقات</span>
          </button>
        </div>
      )}
    </div>
  );
};
