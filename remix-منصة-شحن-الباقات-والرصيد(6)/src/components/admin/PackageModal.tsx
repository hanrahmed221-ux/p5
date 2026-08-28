import React, { useState, useEffect } from 'react';
import { Package, Company, Category } from '../../types';
import { api } from '../../services/api';
import {
  X,
  Plus,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  Package as PackageIcon,
  Check,
  TrendingUp,
  Percent,
  Coins,
} from 'lucide-react';

interface PackageModalProps {
  pkg: Package | null; // null for creating new
  companies: Company[];
  categories: Category[];
  onClose: () => void;
  onSaved: (pkg: Package) => void;
}

export const PackageModal: React.FC<PackageModalProps> = ({
  pkg,
  companies,
  categories,
  onClose,
  onSaved,
}) => {
  const isEditing = Boolean(pkg);

  const [name, setName] = useState(pkg?.name || '');
  const [companyId, setCompanyId] = useState(pkg?.company_id || companies[0]?.id || 'vodafone');
  const [categoryId, setCategoryId] = useState(pkg?.category_id || categories[0]?.id || 'internet');
  const [price, setPrice] = useState<number | string>(pkg?.price ?? '');
  const [cost, setCost] = useState<number | string>(pkg?.cost ?? '');
  const [profit, setProfit] = useState<number | string>(pkg?.profit ?? '');
  const [quota, setQuota] = useState(pkg?.quota || '');
  const [duration, setDuration] = useState(pkg?.duration || '30 يوم');
  const [badge, setBadge] = useState(pkg?.badge || '');
  const [description, setDescription] = useState(pkg?.description || '');
  const [features, setFeatures] = useState<string[]>(pkg?.features || []);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [active, setActive] = useState(pkg ? pkg.active : true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-calculate profit when price or cost changes
  const handlePriceChange = (val: string) => {
    setPrice(val);
    const p = parseFloat(val);
    if (!isNaN(p)) {
      const c = parseFloat(String(cost));
      if (!isNaN(c)) {
        setProfit(Number((p - c).toFixed(2)));
      } else {
        // Default estimate: 85% cost, 15% profit
        const estimatedCost = Math.round(p * 0.85);
        setCost(estimatedCost);
        setProfit(p - estimatedCost);
      }
    }
  };

  const handleCostChange = (val: string) => {
    setCost(val);
    const c = parseFloat(val);
    const p = parseFloat(String(price));
    if (!isNaN(c) && !isNaN(p)) {
      setProfit(Number((p - c).toFixed(2)));
    }
  };

  const handleProfitChange = (val: string) => {
    setProfit(val);
    const pr = parseFloat(val);
    const p = parseFloat(String(price));
    if (!isNaN(pr) && !isNaN(p)) {
      setCost(Number((p - pr).toFixed(2)));
    }
  };

  // Calculate profit margin percentage
  const numPrice = parseFloat(String(price)) || 0;
  const numCost = parseFloat(String(cost)) || 0;
  const numProfit = parseFloat(String(profit)) || 0;
  const profitMarginPercent = numPrice > 0 ? ((numProfit / numPrice) * 100).toFixed(1) : '0';

  const handleAddFeature = () => {
    if (newFeatureText.trim()) {
      setFeatures([...features, newFeatureText.trim()]);
      setNewFeatureText('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('يرجى إدخال اسم الباقة');
      return;
    }

    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMsg('يرجى إدخال سعر بيع صحيح بالجنيه');
      return;
    }

    try {
      setLoading(true);
      const pkgPayload = {
        name: name.trim(),
        company_id: companyId,
        category_id: categoryId,
        price: numPrice,
        cost: !isNaN(numCost) ? numCost : Math.round(numPrice * 0.85),
        profit: !isNaN(numProfit) ? numProfit : (numPrice - (!isNaN(numCost) ? numCost : Math.round(numPrice * 0.85))),
        quota: quota.trim() || undefined,
        duration: duration.trim() || '30 يوم',
        badge: badge.trim() || undefined,
        description: description.trim() || undefined,
        features: features.filter(Boolean),
        active,
      };

      let result: Package;
      if (isEditing && pkg) {
        result = await api.updatePackage(pkg.id, pkgPayload);
      } else {
        result = await api.createPackage(pkgPayload);
      }

      onSaved(result);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل حفظ الباقة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div
        id="package-modal-container"
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 text-right max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <PackageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                {isEditing ? 'تعديل بيانات وأرباح الباقة' : 'إضافة باقة جديدة وتحديد الأرباح'}
              </h2>
              <p className="text-xs text-slate-400">حدد سعر البيع، التكلفة، وصافي الربح لتتبع الإحصائيات بدقة</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Package Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              اسم الباقة: <span className="text-red-500">*</span>
            </label>
            <input
              id="pkg-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: فودافون نت 40 جيجا"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Company & Category Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                شركة الاتصالات: <span className="text-red-500">*</span>
              </label>
              <select
                id="pkg-company-select"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.nameEn})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                نوع الخدمة / القسم: <span className="text-red-500">*</span>
              </label>
              <select
                id="pkg-category-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* FINANCIALS: Price, Cost, Profit & Margin */}
          <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>حسابات السعر والتكلفة والأرباح:</span>
              </span>

              {numPrice > 0 && (
                <span
                  id="pkg-profit-margin-badge"
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                    numProfit >= 0
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  نسبة الربح: {profitMarginPercent}% ({numProfit} ج)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Selling Price */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  سعر البيع للعميل (ج): <span className="text-red-500">*</span>
                </label>
                <input
                  id="pkg-price-input"
                  type="number"
                  step="any"
                  required
                  value={price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="مثال: 200"
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white text-sm font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Wholesale Cost */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  تكلفة الباقة عليك (ج):
                </label>
                <input
                  id="pkg-cost-input"
                  type="number"
                  step="any"
                  value={cost}
                  onChange={(e) => handleCostChange(e.target.value)}
                  placeholder="مثال: 165"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Net Profit */}
              <div>
                <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                  صافي ربحك في الباقة (ج):
                </label>
                <input
                  id="pkg-profit-input"
                  type="number"
                  step="any"
                  value={profit}
                  onChange={(e) => handleProfitChange(e.target.value)}
                  placeholder="مثال: 35"
                  className="w-full px-3 py-2 rounded-xl border border-emerald-400 bg-emerald-50 text-sm font-black text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
            <p className="text-[10px] text-emerald-700">
              💡 يمكنك كتابة سعر البيع والتكلفة وسيتم حساب صافي الربح والنسبة تلقائياً في الإحصائيات والمبيعات.
            </p>
          </div>

          {/* Quota & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                سعة الإنترنت / الرصيد:
              </label>
              <input
                id="pkg-quota-input"
                type="text"
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                placeholder="مثال: 40 GB"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">مدة الباقة:</label>
              <input
                id="pkg-duration-input"
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30 يوم"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Badge */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              شارة مميزة (اختياري - يظهر أعلى الكارت):
            </label>
            <input
              id="pkg-badge-input"
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="مثال: الأكثر طلباً، عرض خاص، سوبر"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">وصف تفصيلي للباقة:</label>
            <textarea
              id="pkg-desc-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب وصفاً موجزاً يوضح مميزات الباقة للعميل..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Features bullet points */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              نقاط المميزات في كارت الباقة:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="أضف ميزة (مثال: صالحة لكافة المواقع والفيديوهات)"
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة</span>
              </button>
            </div>

            {features.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <span className="flex items-center gap-1.5 text-slate-800">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{feat}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active status switch */}
          <div className="pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 select-none">
              <input
                id="pkg-active-checkbox"
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>تفعيل وإظهار الباقة للعملاء في الصفحة الرئيسية</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              id="save-package-submit-btn"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isEditing ? 'حفظ التعديلات' : 'إضافة الباقة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
