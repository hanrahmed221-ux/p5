import React, { useState, useEffect } from 'react';
import { Package, Company, SiteSettings, Order } from '../types';
import { api } from '../services/api';
import { CompanyBadge } from './CompanyBadge';
import {
  X,
  Phone,
  User,
  CreditCard,
  FileText,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderModalProps {
  pkg: Package | null;
  companies: Company[];
  settings: SiteSettings | null;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  pkg,
  companies,
  settings,
  onClose,
  onOrderSuccess,
}) => {
  if (!pkg) return null;

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [hasDifferentContact, setHasDifferentContact] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'vodafone_cash' | 'instapay' | 'manual_transfer'>('vodafone_cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedInstapay, setCopiedInstapay] = useState(false);

  const company = companies.find((c) => c.id === pkg.company_id);
  const companyName = company?.name || pkg.company_id;

  // Auto-detect Egyptian carrier from prefix
  const detectCarrier = (phone: string) => {
    const clean = phone.replace(/\s+/g, '');
    if (clean.startsWith('010') || clean.startsWith('+2010') || clean.startsWith('2010')) return 'vodafone';
    if (clean.startsWith('011') || clean.startsWith('+2011') || clean.startsWith('2011')) return 'etisalat';
    if (clean.startsWith('012') || clean.startsWith('+2012') || clean.startsWith('2012')) return 'orange';
    if (clean.startsWith('015') || clean.startsWith('+2015') || clean.startsWith('2015')) return 'we';
    return null;
  };

  const detectedCarrier = detectCarrier(phoneNumber);
  const isCarrierMismatch = detectedCarrier && detectedCarrier !== pkg.company_id;

  const handleCopyCash = () => {
    if (settings?.vodafone_cash_number) {
      navigator.clipboard.writeText(settings.vodafone_cash_number);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2500);
    }
  };

  const handleCopyInstapay = () => {
    if (settings?.instapay_address) {
      navigator.clipboard.writeText(settings.instapay_address);
      setCopiedInstapay(true);
      setTimeout(() => setCopiedInstapay(false), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage('يرجى كتابة الاسم الثلاثي أو الثنائي للعميل');
      return;
    }

    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    const phoneRegex = /^(010|011|012|015|\+2010|\+2011|\+2012|\+2015|2010|2011|2012|2015)\d{8}$/;
    if (!phoneRegex.test(cleanPhone) && cleanPhone.length !== 11) {
      setErrorMessage('يرجى إدخال رقم هاتف مصري صحيح مكون من 11 رقماً (مثال: 01012345678)');
      return;
    }

    try {
      setLoading(true);
      const res = await api.createOrder({
        customer_name: customerName.trim(),
        phone_number: cleanPhone,
        contact_phone: hasDifferentContact && contactPhone.trim() ? contactPhone.trim() : undefined,
        package_id: pkg.id,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
      });

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // Confetti optional
      }

      onOrderSuccess(res.order);
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        id="order-modal-container"
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 text-right max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 fill-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">طلب شحن باقة</h2>
              <p className="text-xs text-slate-300">أدخل بيانات الخط لتنفيذ الشحن يدوياً</p>
            </div>
          </div>

          <button
            id="close-order-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Selected Package Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CompanyBadge companyId={pkg.company_id} companyName={companyName} size="sm" />
                {pkg.quota && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    {pkg.quota}
                  </span>
                )}
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">{pkg.name}</h3>
              <p className="text-xs text-slate-500">{pkg.duration || '30 يوم'}</p>
            </div>

            <div className="text-right sm:text-left shrink-0 bg-white border border-slate-200 px-4 py-2 rounded-xl">
              <span className="text-[11px] text-slate-400 block">المبلغ المطلوب</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-600">{pkg.price}</span>
                <span className="text-xs font-bold text-slate-700">{settings?.currency || 'جنيه'}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>الاسم بالكامل:</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                id="order-customer-name-input"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="اكتب اسمك الثلاثي أو الثنائي"
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Target Recharge Phone Number */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>رقم الموبايل المراد شحنه:</span>
                  <span className="text-red-500">*</span>
                </span>
                <span className="text-[11px] text-slate-500 font-normal">رقم الخط المصري (11 رقم)</span>
              </label>
              <input
                id="order-phone-number-input"
                type="tel"
                dir="ltr"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="010XXXXXXXX"
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-base font-bold text-slate-900 placeholder-slate-400 tracking-wider focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-left"
              />

              {/* Carrier Warning / Indicator */}
              {isCarrierMismatch && (
                <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    تنبيه: الرقم الذي أدخلته يبدو تابعاً لشبكة أخرى، بينما الباقة المختارة لشبكة{' '}
                    <strong>{companyName}</strong>. يرجى التأكد من صحة الرقم!
                  </span>
                </div>
              )}
            </div>

            {/* Optional Different Contact Number Toggle */}
            <div>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                <input
                  id="different-contact-checkbox"
                  type="checkbox"
                  checked={hasDifferentContact}
                  onChange={(e) => setHasDifferentContact(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>رقم التواصل الخاص بك مختلف عن رقم الشحن؟</span>
              </label>

              {hasDifferentContact && (
                <div className="mt-2 animate-in fade-in duration-150">
                  <input
                    id="order-contact-phone-input"
                    type="tel"
                    dir="ltr"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="رقم التواصل (واتساب أو اتصال)"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-bold text-slate-900 placeholder-slate-400 text-left"
                  />
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>طريقة الدفع (تحويل يدوي):</span>
                <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  id="pay-method-vodafone-cash"
                  onClick={() => setPaymentMethod('vodafone_cash')}
                  className={`p-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'vodafone_cash'
                      ? 'border-red-500 bg-red-50/70 text-red-800 ring-2 ring-red-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  <span>فودافون كاش</span>
                </button>

                <button
                  type="button"
                  id="pay-method-instapay"
                  onClick={() => setPaymentMethod('instapay')}
                  className={`p-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'instapay'
                      ? 'border-purple-500 bg-purple-50/70 text-purple-800 ring-2 ring-purple-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                  <span>إنستاباي InstaPay</span>
                </button>

                <button
                  type="button"
                  id="pay-method-manual"
                  onClick={() => setPaymentMethod('manual_transfer')}
                  className={`p-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                    paymentMethod === 'manual_transfer'
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>تحويل يدوي آخر</span>
                </button>
              </div>
            </div>

            {/* Payment Transfer Instructions Box */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-300" />
                  <span>بيانات تحويل المبلغ:</span>
                </span>
                <span className="text-xs font-black text-emerald-400">
                  {pkg.price} {settings?.currency || 'جنيه'}
                </span>
              </div>

              {/* Vodafone Cash Number */}
              {paymentMethod === 'vodafone_cash' && settings?.vodafone_cash_number && (
                <div className="bg-slate-950/80 border border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block">رقم فودافون كاش للتحويل:</span>
                    <span className="text-base sm:text-lg font-mono font-black text-amber-400 tracking-wider">
                      {settings.vodafone_cash_number}
                    </span>
                  </div>
                  <button
                    type="button"
                    id="copy-vodafone-cash-btn"
                    onClick={handleCopyCash}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    {copiedNumber ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الرقم</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* InstaPay address */}
              {paymentMethod === 'instapay' && settings?.instapay_address && (
                <div className="bg-slate-950/80 border border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block">عنوان أو رقم إنستاباي:</span>
                    <span className="text-sm sm:text-base font-mono font-black text-purple-300">
                      {settings.instapay_address}
                    </span>
                  </div>
                  <button
                    type="button"
                    id="copy-instapay-btn"
                    onClick={handleCopyInstapay}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    {copiedInstapay ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ العنوان</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Step instructions */}
              <div className="text-xs text-slate-300 space-y-1 pt-1 border-t border-slate-700/60 leading-relaxed">
                <p className="font-semibold text-slate-200">خطوات الشحن اليدوي البسيطة:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                  <li>قم بتحويل قيمة الباقة ({pkg.price} جنيه).</li>
                  <li>احتفظ بصورة التحويل أو رسالة التأكيد.</li>
                  <li>أرسل الطلب الآن وسيتم التحقق وتنفيذ الشحن لخطك فوراً.</li>
                </ol>
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>ملاحظات اختيارية (مثلاً: رقم المحول منه أو كود العملية):</span>
              </label>
              <textarea
                id="order-notes-input"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="اكتب أي ملاحظة إضافية تود إبلاغ الإدارة بها..."
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                id="confirm-submit-order-btn"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-xl shadow-emerald-600/30 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري إرسال الطلب...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>تأكيد وإرسال طلب الشحن</span>
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-slate-500 mt-2">
                ⚡ الشحن يدوي بالكامل من خلال إدارة المنصة بعد التأكد من التحويل
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
