import React, { useState } from 'react';
import { Company, Category } from '../../types';
import { api } from '../../services/api';
import { CompanyBadge } from '../CompanyBadge';
import {
  Building2,
  FolderTree,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Edit2,
  Loader2,
} from 'lucide-react';

interface CompaniesTabProps {
  companies: Company[];
  categories: Category[];
  onDataChanged: () => void;
}

export const CompaniesTab: React.FC<CompaniesTabProps> = ({
  companies,
  categories,
  onDataChanged,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeletingCat, setIsDeletingCat] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleToggleCompany = async (company: Company) => {
    try {
      await api.updateCompany(company.id, { active: !company.active });
      setAlertMsg({
        type: 'success',
        text: `تم ${!company.active ? 'تفعيل' : 'تعطيل'} شبكة ${company.name} بنجاح`,
      });
      onDataChanged();
      setTimeout(() => setAlertMsg(null), 3000);
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'فشل تحديث حالة الشركة' });
    }
  };

  const handleToggleCategory = async (cat: Category) => {
    try {
      await api.updateCategory(cat.id, { active: !cat.active });
      setAlertMsg({
        type: 'success',
        text: `تم ${!cat.active ? 'تفعيل' : 'إخفاء'} قسم ${cat.name} بنجاح`,
      });
      onDataChanged();
      setTimeout(() => setAlertMsg(null), 3000);
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'فشل تحديث حالة القسم' });
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      await api.createCategory({
        name: newCatName.trim(),
        nameEn: newCatNameEn.trim() || newCatName.trim(),
        icon: 'Layers',
        active: true,
      });
      setNewCatName('');
      setNewCatNameEn('');
      setAlertMsg({ type: 'success', text: 'تمت إضافة القسم الجديد بنجاح!' });
      onDataChanged();
      setTimeout(() => setAlertMsg(null), 3000);
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'فشل إضافة القسم' });
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeletingCat(true);
      await api.deleteCategory(categoryToDelete.id);
      setAlertMsg({ type: 'success', text: `تم حذف قسم "${categoryToDelete.name}" بنجاح` });
      setCategoryToDelete(null);
      onDataChanged();
      setTimeout(() => setAlertMsg(null), 3000);
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'فشل حذف القسم' });
    } finally {
      setIsDeletingCat(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Alert toast */}
      {alertMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {alertMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Section 1: Telecom Companies */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">شركات الاتصالات والشبكات</h3>
            <p className="text-xs text-slate-500">
              تحكم في ظهور أو إخفاء أي شبكة اتصالات على الصفحة الرئيسية
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {companies.map((comp) => (
            <div
              key={comp.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                comp.active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <CompanyBadge companyId={comp.id} companyName={comp.name} size="md" />
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    comp.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {comp.active ? 'مفعلة' : 'معطلة'}
                </span>
              </div>

              <div className="text-xs">
                <span className="font-bold text-slate-900 block">{comp.name}</span>
                <span className="text-slate-400 text-[11px] font-mono">{comp.nameEn}</span>
              </div>

              <button
                id={`toggle-company-${comp.id}`}
                onClick={() => handleToggleCompany(comp)}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  comp.active
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {comp.active ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{comp.active ? 'تعطيل الشبكة' : 'تفعيل الشبكة'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Categories Management */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">أقسام وتصنيفات الخدمات</h3>
            <p className="text-xs text-slate-500">
              إدارة أقسام الباقات (إنترنت، مكالمات وفليكسات، شحن رصيد، باقات إضافية)
            </p>
          </div>
        </div>

        {/* Existing Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 ${
                cat.active ? 'bg-slate-50 border-slate-200' : 'bg-slate-100 border-dashed border-slate-300 opacity-60'
              }`}
            >
              <div>
                <span className="font-bold text-slate-900 text-xs block">{cat.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">{cat.nameEn}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleCategory(cat)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                  title={cat.active ? 'إخفاء' : 'تفعيل'}
                >
                  {cat.active ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-amber-600" />}
                </button>

                {categories.length > 2 && (
                  <button
                    onClick={() => setCategoryToDelete(cat)}
                    className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="حذف القسم"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <span className="text-xs font-black text-slate-800 block">إضافة قسم خدمة جديد:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="اسم القسم بالعربي (مثال: إنترنت منزلي)"
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            <input
              type="text"
              value={newCatNameEn}
              onChange={(e) => setNewCatNameEn(e.target.value)}
              placeholder="اسم القسم بالإنجليزية (Home DSL)"
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة القسم</span>
            </button>
          </div>
        </form>
      </div>

      {/* Category Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-right animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                تأكيد حذف القسم
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف قسم <span className="font-bold text-slate-800">"{categoryToDelete.name}"</span>؟
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingCat}
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isDeletingCat}
                onClick={handleConfirmDeleteCategory}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDeletingCat ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>نعم، احذف القسم</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
