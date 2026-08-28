import React, { useState, useEffect } from 'react';
import { Package, Company, Category, SiteSettings } from '../../types';
import { api } from '../../services/api';
import { CompanyBadge } from '../CompanyBadge';
import { PackageModal } from './PackageModal';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  SlidersHorizontal,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Package as PackageIcon,
} from 'lucide-react';

interface PackagesTabProps {
  companies: Company[];
  categories: Category[];
  settings: SiteSettings | null;
  onDataChanged?: () => void;
}

export const PackagesTab: React.FC<PackagesTabProps> = ({
  companies,
  categories,
  settings,
  onDataChanged,
}) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminPackages();
      setPackages(data);
    } catch (err) {
      console.error('Failed to fetch packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleToggleActive = async (pkg: Package) => {
    try {
      const updated = await api.updatePackage(pkg.id, { active: !pkg.active });
      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? updated : p)));
      setAlertMsg({
        type: 'success',
        text: `تم ${updated.active ? 'تفعيل' : 'إخفاء'} باقة "${pkg.name}" بنجاح`,
      });
      if (onDataChanged) onDataChanged();
      setTimeout(() => setAlertMsg(null), 3000);
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'فشل تحديث الحالة' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!packageToDelete) return;
    try {
      setIsDeleting(true);
      await api.deletePackage(packageToDelete.id);
      setPackages((prev) => prev.filter((p) => p.id !== packageToDelete.id));
      setAlertMsg({ type: 'success', text: `تم حذف باقة "${packageToDelete.name}" بنجاح` });
      setPackageToDelete(null);
      if (onDataChanged) onDataChanged();
      setTimeout(() => setAlertMsg(null), 3000);
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'فشل حذف الباقة' });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPackages = packages.filter((p) => {
    if (selectedCompanyId !== 'all' && p.company_id !== selectedCompanyId) return false;
    if (selectedCategoryId !== 'all' && p.category_id !== selectedCategoryId) return false;
    return true;
  });

  const currency = settings?.currency || 'جنيه';

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">إدارة الباقات والأسعار</h2>
          <p className="text-xs text-slate-500">
            أضف باقات جديدة أو عدل الأسعار والمميزات أو أوقف إظهار أي باقة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="admin-add-package-btn"
            onClick={() => {
              setEditingPackage(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة باقة جديدة</span>
          </button>

          <button
            onClick={fetchPackages}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

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

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          <span>تصفية حسب:</span>
        </div>

        <select
          value={selectedCompanyId}
          onChange={(e) => setSelectedCompanyId(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
        >
          <option value="all">جميع الشركات ({packages.length})</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({packages.filter((p) => p.company_id === c.id).length})
            </option>
          ))}
        </select>

        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
        >
          <option value="all">كافة الأقسام</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-xs text-slate-500 font-bold">جاري تحميل الباقات...</span>
        </div>
      ) : filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPackages.map((pkg) => {
            const company = companies.find((c) => c.id === pkg.company_id);
            const category = categories.find((c) => c.id === pkg.category_id);

            return (
              <div
                key={pkg.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                  pkg.active ? 'border-slate-200' : 'border-dashed border-slate-300 opacity-60 bg-slate-50'
                }`}
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CompanyBadge
                      companyId={pkg.company_id}
                      companyName={company?.name || pkg.company_id}
                      size="sm"
                    />

                    <div className="flex items-center gap-1.5">
                      {pkg.badge && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {pkg.badge}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          pkg.active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {pkg.active ? 'مفعلة' : 'مخفية'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{pkg.name}</h3>
                    <p className="text-xs text-slate-500">{category?.name || 'خدمة'} • {pkg.duration || '30 يوم'}</p>
                  </div>

                  {/* Price & Quota Box */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">سعر البيع:</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-emerald-600">{pkg.price}</span>
                          <span className="text-xs font-bold text-slate-600">{currency}</span>
                        </div>
                      </div>

                      {pkg.quota && (
                        <span className="text-xs font-black text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {pkg.quota}
                        </span>
                      )}
                    </div>

                    {/* Cost & Profit Breakdown */}
                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1 text-slate-500">
                        <span>التكلفة:</span>
                        <span className="font-bold text-slate-700">
                          {pkg.cost !== undefined ? pkg.cost : Math.round(pkg.price * 0.85)} {currency}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-emerald-700 font-bold">صافي الربح:</span>
                        <span className="font-black text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded-md text-[10px]">
                          +
                          {pkg.profit !== undefined
                            ? pkg.profit
                            : Math.round(pkg.price - Math.round(pkg.price * 0.85))}{' '}
                          {currency}
                          {pkg.price > 0 &&
                            ` (${Math.round(
                              ((pkg.profit !== undefined
                                ? pkg.profit
                                : pkg.price - Math.round(pkg.price * 0.85)) /
                                pkg.price) *
                                100
                            )}%)`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Features brief */}
                  {pkg.features && pkg.features.length > 0 && (
                    <ul className="text-[11px] text-slate-600 space-y-1 pt-1">
                      {pkg.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="line-clamp-1">
                          • {f}
                        </li>
                      ))}
                      {pkg.features.length > 3 && (
                        <li className="text-slate-400 font-medium">
                          + {pkg.features.length - 3} مميزات أخرى
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  {/* Toggle show/hide */}
                  <button
                    id={`toggle-pkg-active-${pkg.id}`}
                    onClick={() => handleToggleActive(pkg)}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title={pkg.active ? 'إخفاء من المتجر' : 'إظهار في المتجر'}
                  >
                    {pkg.active ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                    <span className="text-[11px] font-bold">{pkg.active ? 'إخفاء' : 'تفعيل'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Edit */}
                    <button
                      id={`edit-pkg-btn-${pkg.id}`}
                      onClick={() => {
                        setEditingPackage(pkg);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      title="تعديل الباقة"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      id={`delete-pkg-btn-${pkg.id}`}
                      onClick={() => setPackageToDelete(pkg)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      title="حذف الباقة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <PackageIcon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">لا توجد باقات في هذا القسم</h3>
          <p className="text-xs text-slate-500">
            يمكنك إضافة أول باقة لشركة الاتصالات هذه بسهولة.
          </p>
          <button
            onClick={() => {
              setEditingPackage(null);
              setModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
          >
            + إضافة باقة الآن
          </button>
        </div>
      )}

      {/* Package Delete Confirmation Modal */}
      {packageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-right animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                تأكيد حذف الباقة
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف باقة <span className="font-bold text-slate-800">"{packageToDelete.name}"</span> نهائياً؟ لن يتمكن العملاء من طلبها بعد الآن.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                id="cancel-delete-pkg-btn"
                type="button"
                disabled={isDeleting}
                onClick={() => setPackageToDelete(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                id="confirm-delete-pkg-btn"
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>نعم، احذف الباقة</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Add / Edit Modal */}
      {modalOpen && (
        <PackageModal
          pkg={editingPackage}
          companies={companies}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            fetchPackages();
            if (onDataChanged) onDataChanged();
          }}
        />
      )}
    </div>
  );
};
