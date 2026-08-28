import React, { useState, useEffect } from 'react';
import { MonthlySubscriber, Company, Package } from '../../types';
import { X, Save, Phone, User, Calendar, DollarSign, Layers, Tag, Loader2, Sparkles, MessageCircle } from 'lucide-react';

interface SubscriberModalProps {
  subscriber: MonthlySubscriber | null;
  companies: Company[];
  packages: Package[];
  currency: string;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export const SubscriberModal: React.FC<SubscriberModalProps> = ({
  subscriber,
  companies,
  packages,
  currency,
  onClose,
  onSave,
}) => {
  const isEdit = Boolean(subscriber);

  const [customerName, setCustomerName] = useState(subscriber?.customer_name || '');
  const [phoneNumber, setPhoneNumber] = useState(subscriber?.phone_number || '');
  const [contactPhone, setContactPhone] = useState(subscriber?.contact_phone || '');
  const [companyId, setCompanyId] = useState(subscriber?.company_id || companies[0]?.id || 'vodafone');
  const [packageId, setPackageId] = useState(subscriber?.package_id || '');
  const [packageName, setPackageName] = useState(subscriber?.package_name || '');
  const [packagePrice, setPackagePrice] = useState<number | ''>(subscriber?.package_price ?? 150);
  const [packageCost, setPackageCost] = useState<number | ''>(subscriber?.package_cost ?? 127.5);
  const [packageProfit, setPackageProfit] = useState<number | ''>(subscriber?.package_profit ?? 22.5);
  const [renewalDay, setRenewalDay] = useState<number>(subscriber?.renewal_day || new Date().getDate());
  const [nextRenewalDate, setNextRenewalDate] = useState<string>(subscriber?.next_renewal_date || '');
  const [notes, setNotes] = useState(subscriber?.notes || '');
  const [autoNotifyWhatsapp, setAutoNotifyWhatsapp] = useState(subscriber?.auto_notify_whatsapp ?? true);
  const [active, setActive] = useState(subscriber?.active ?? true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter packages for selected company
  const companyPackages = packages.filter((p) => p.company_id === companyId && p.active);

  // If next renewal date not set, calculate default based on renewalDay
  useEffect(() => {
    if (!nextRenewalDate) {
      const now = new Date();
      let targetMonth = now.getMonth();
      let targetYear = now.getFullYear();
      if (now.getDate() > renewalDay) {
        targetMonth += 1;
        if (targetMonth > 11) {
          targetMonth = 0;
          targetYear += 1;
        }
      }
      const day = Math.min(renewalDay, 28); // safe
      setNextRenewalDate(`${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    }
  }, [renewalDay]);

  // When package selected from list, autofill name, price, cost, profit
  const handleSelectPresetPackage = (pkgId: string) => {
    setPackageId(pkgId);
    const found = packages.find((p) => p.id === pkgId);
    if (found) {
      setPackageName(found.name);
      setPackagePrice(found.price);
      const cost = typeof found.cost === 'number' ? found.cost : Math.round(found.price * 0.85);
      const profit = typeof found.profit === 'number' ? found.profit : (found.price - cost);
      setPackageCost(cost);
      setPackageProfit(profit);
    }
  };

  // Auto calculate profit on price/cost change
  const handlePriceChange = (val: string) => {
    const num = val === '' ? '' : parseFloat(val);
    setPackagePrice(num);
    if (typeof num === 'number') {
      const cost = typeof packageCost === 'number' ? packageCost : Math.round(num * 0.85);
      setPackageProfit(Number((num - cost).toFixed(2)));
    }
  };

  const handleCostChange = (val: string) => {
    const num = val === '' ? '' : parseFloat(val);
    setPackageCost(num);
    if (typeof num === 'number' && typeof packagePrice === 'number') {
      setPackageProfit(Number((packagePrice - num).toFixed(2)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError('يرجى كتابة اسم العميل');
      return;
    }

    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (cleanPhone.length < 10) {
      setError('يرجى إدخال رقم هاتف شحن صحيح (11 رقماً)');
      return;
    }

    if (!packageName.trim()) {
      setError('يرجى تحديد أو كتابة اسم الباقة الشهرية');
      return;
    }

    if (packagePrice === '' || packagePrice < 0) {
      setError('يرجى إدخال سعر صحيح للباقة');
      return;
    }

    try {
      setLoading(true);
      const selComp = companies.find((c) => c.id === companyId);

      await onSave({
        customer_name: customerName.trim(),
        phone_number: cleanPhone,
        contact_phone: contactPhone.trim() || cleanPhone,
        company_id: companyId,
        company_name: selComp?.name || companyId,
        package_id: packageId || undefined,
        package_name: packageName.trim(),
        package_price: Number(packagePrice),
        package_cost: packageCost !== '' ? Number(packageCost) : Math.round(Number(packagePrice) * 0.85),
        package_profit: packageProfit !== '' ? Number(packageProfit) : Number(packagePrice) - (packageCost !== '' ? Number(packageCost) : Math.round(Number(packagePrice) * 0.85)),
        renewal_day: renewalDay,
        next_renewal_date: nextRenewalDate,
        notes: notes.trim() || undefined,
        auto_notify_whatsapp: autoNotifyWhatsapp,
        active,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200 my-8 text-right">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {isEdit ? 'تعديل بيانات عميل شحن شهري' : 'إضافة عميل شحن شهري جديد'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                تسجيل العميل في جدول التجديد الدوري لتذكيره بميعاد الشحن
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>اسم العميل *</span>
            </label>
            <input
              type="text"
              id="sub-name-input"
              required
              placeholder="مثال: أحمد عبد الله"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-bold"
            />
          </div>

          {/* Phone Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>رقم الشحن الأساسي *</span>
              </label>
              <input
                type="tel"
                id="sub-phone-input"
                required
                placeholder="01XXXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>رقم الواتساب للتواصل</span>
              </label>
              <input
                type="tel"
                id="sub-contact-phone-input"
                placeholder="اتركه فارغاً إذا كان نفس الرقم"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-bold"
              />
            </div>
          </div>

          {/* Company and Preset Packages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>شركة الاتصالات *</span>
              </label>
              <select
                id="sub-company-select"
                value={companyId}
                onChange={(e) => {
                  setCompanyId(e.target.value);
                  setPackageId('');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-bold bg-white"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">
                اختيار باقة جاهزة (اختياري)
              </label>
              <select
                id="sub-preset-package-select"
                value={packageId}
                onChange={(e) => handleSelectPresetPackage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-bold bg-white"
              >
                <option value="">-- باقة مخصصة أو اختر من القائمة --</option>
                {companyPackages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.price} {currency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Package Name */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>اسم الباقة المشترك بها *</span>
            </label>
            <input
              type="text"
              id="sub-package-name-input"
              required
              placeholder="مثال: فودافون بلس 30 جيجا أو فليكس 70"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-bold"
            />
          </div>

          {/* Financials: Price, Cost, Profit */}
          <div className="grid grid-cols-3 gap-2.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                سعر البيع ({currency}) *
              </label>
              <input
                type="number"
                id="sub-price-input"
                required
                min="0"
                step="any"
                value={packagePrice}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-black text-slate-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                التكلفة عليك ({currency})
              </label>
              <input
                type="number"
                id="sub-cost-input"
                min="0"
                step="any"
                value={packageCost}
                onChange={(e) => handleCostChange(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold text-slate-700 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-emerald-800 mb-1">
                صافي ربحك ({currency})
              </label>
              <input
                type="number"
                id="sub-profit-input"
                step="any"
                value={packageProfit}
                onChange={(e) => setPackageProfit(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50/60 focus:outline-none text-xs font-black text-emerald-900"
              />
            </div>
          </div>

          {/* Renewal Day & Next Renewal Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/40 p-3.5 rounded-2xl border border-emerald-200/80">
            <div>
              <label className="block text-xs font-black text-emerald-950 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span>يوم التجديد من كل شهر *</span>
              </label>
              <select
                id="sub-renewal-day-select"
                value={renewalDay}
                onChange={(e) => setRenewalDay(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-black text-emerald-950 bg-white"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    يوم {day} من كل شهر
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-emerald-700 mt-1 block">
                تاريخ ثابت لتذكيرك شهرياً
              </span>
            </div>

            <div>
              <label className="block text-xs font-black text-emerald-950 mb-1">
                تاريخ التجديد القادم
              </label>
              <input
                type="date"
                id="sub-next-date-input"
                required
                value={nextRenewalDate}
                onChange={(e) => setNextRenewalDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold text-emerald-950 bg-white"
              />
              <span className="text-[10px] text-emerald-700 mt-1 block">
                يظهر في التنبيهات عند حلول هذا التاريخ
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              ملاحظات خاصة بالعميل (طريقة الدفع المفضلة، تعليمات خاصة)
            </label>
            <textarea
              id="sub-notes-input"
              rows={2}
              placeholder="مثال: يفضل التحويل فودافون كاش، يرغب بالتأكيد قبل الشحن بساعة"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs"
            />
          </div>

          {/* Active status */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-black text-slate-800 block">حالة الاشتراك الشهري</span>
              <span className="text-[10px] text-slate-500">تفعيل أو إيقاف مؤقت للتذكيرات والاشتراك</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              id="sub-save-btn"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isEdit ? 'حفظ التعديلات' : 'إضافة العميل للجدول'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
