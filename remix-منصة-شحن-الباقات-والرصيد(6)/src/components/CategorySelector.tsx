import React from 'react';
import { Category } from '../types';
import { Wifi, PhoneCall, Wallet, Sparkles, LayoutGrid } from 'lucide-react';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const getCategoryIcon = (iconName: string, id: string) => {
    if (id === 'internet' || iconName === 'wifi') return <Wifi className="w-4 h-4" />;
    if (id === 'calls' || iconName === 'phone-call') return <PhoneCall className="w-4 h-4" />;
    if (id === 'balance' || iconName === 'wallet') return <Wallet className="w-4 h-4" />;
    return <Sparkles className="w-4 h-4" />;
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />
          <span>٢. اختر نوع الباقة أو الخدمة:</span>
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full">
        {/* All Services */}
        <button
          id="category-filter-all"
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm border transition-all cursor-pointer shadow-xs ${
            selectedCategoryId === 'all'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20 ring-2 ring-emerald-600/20'
              : 'bg-white text-slate-700 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>كافة الباقات والخدمات</span>
        </button>

        {/* Categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              id={`category-filter-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm border transition-all cursor-pointer shadow-xs ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20 ring-2 ring-emerald-600/20'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {getCategoryIcon(cat.icon, cat.id)}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
