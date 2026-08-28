import React, { useState, useEffect } from 'react';
import { Order, SiteSettings, OrderStatus } from '../types';
import { api } from '../services/api';
import { CompanyBadge } from './CompanyBadge';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  MessageCircle,
  Package as PackageIcon,
  Phone,
  Calendar,
  CreditCard,
  Check,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface OrderTrackerProps {
  initialOrderNumber?: string;
  settings: SiteSettings | null;
  onGoBackToPackages?: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  initialOrderNumber = '',
  settings,
  onGoBackToPackages,
}) => {
  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderNumber);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialOrderNumber) {
      setOrderNumberInput(initialOrderNumber);
      handleSearchOrder(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearchOrder = async (queryNumber?: string) => {
    const num = (queryNumber || orderNumberInput).trim();
    if (!num) {
      setErrorMessage('يرجى إدخال رقم الطلب للبحث');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSearched(true);

    try {
      const data = await api.trackOrder(num);
      setOrder(data);
    } catch (err: any) {
      setOrder(null);
      setErrorMessage(err.message || 'لم يتم العثور على طلب بهذا الرقم');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (order) {
      handleSearchOrder(order.order_number);
    }
  };

  // Helper to calculate progress step
  const getStepProgress = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return 1;
      case 'pending_payment':
        return 2;
      case 'payment_confirmed':
        return 3;
      case 'processing':
        return 4;
      case 'recharged':
        return 5;
      case 'completed':
        return 6;
      case 'cancelled':
        return -1;
      default:
        return 1;
    }
  };

  const getStatusArabicLabel = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return { label: 'تم إنشاء الطلب', color: 'bg-blue-100 text-blue-900 border-blue-200' };
      case 'pending_payment':
        return { label: 'في انتظار الدفع', color: 'bg-amber-100 text-amber-900 border-amber-200' };
      case 'payment_confirmed':
        return { label: 'تم تأكيد الدفع', color: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
      case 'processing':
        return { label: 'جاري تنفيذ الشحن', color: 'bg-indigo-100 text-indigo-900 border-indigo-200 animate-pulse' };
      case 'recharged':
        return { label: 'تم شحن الخط بنجاح', color: 'bg-teal-100 text-teal-900 border-teal-200' };
      case 'completed':
        return { label: 'مكتمل بنجاح', color: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
      case 'cancelled':
        return { label: 'تم إلغاء الطلب', color: 'bg-rose-100 text-rose-900 border-rose-200' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const timelineSteps = [
    { step: 1, title: 'إنشاء الطلب', desc: 'تم استلام بيانات الشحن بنجاح' },
    { step: 2, title: 'مراجعة التحويل', desc: 'التحقق من استلام المبلغ على فودافون كاش' },
    { step: 3, title: 'تأكيد الدفع', desc: 'تمت مطابقة الحوالة المالية' },
    { step: 4, title: 'جاري التنفيذ', desc: 'المسؤول يقوم بالشحن اليدوي على الخط' },
    { step: 5, title: 'تم الشحن', desc: 'وصلت الباقة أو الرصيد إلى خطك' },
    { step: 6, title: 'مكتمل', desc: 'تم إنهاء الطلب بنجاح' },
  ];

  const currentStep = order ? getStepProgress(order.status) : 1;
  const isCancelled = order?.status === 'cancelled';

  return (
    <div id="order-tracker-view" className="w-full max-w-6xl mx-auto space-y-8 py-4 sm:py-6">
      {/* Search Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs text-center space-y-5">
        <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <Search className="w-7 h-7" />
        </div>

        <div className="max-w-xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-3xl font-black text-slate-900">تتبع حالة طلب الشحن</h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            أدخل رقم طلبك لمعرفة مرحلة التنفيذ الحالية ومتابعة رصيدك لحظة بلحظة
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchOrder();
          }}
          className="max-w-lg mx-auto flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <input
              id="tracker-input-field"
              type="text"
              dir="ltr"
              value={orderNumberInput}
              onChange={(e) => setOrderNumberInput(e.target.value)}
              placeholder="ORD-YYYYMMDD-XXX"
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm sm:text-base font-mono font-black text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-center uppercase shadow-xs"
            />
          </div>

          <button
            type="submit"
            id="tracker-search-submit-btn"
            disabled={loading}
            className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-102 active:scale-98"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>تتبع الطلب</span>
          </button>
        </form>

        {/* Quick test order numbers */}
        <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400 flex-wrap">
          <span className="font-medium">أرقام طلبات سريعة للتجربة:</span>
          <button
            type="button"
            onClick={() => {
              setOrderNumberInput('ORD-20260827-001');
              handleSearchOrder('ORD-20260827-001');
            }}
            className="text-emerald-700 hover:underline font-mono font-bold"
          >
            ORD-20260827-001
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => {
              setOrderNumberInput('ORD-20260827-002');
              handleSearchOrder('ORD-20260827-002');
            }}
            className="text-emerald-700 hover:underline font-mono font-bold"
          >
            ORD-20260827-002
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-5 text-center text-red-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 max-w-lg mx-auto shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Order Results Detail */}
      {order && (
        <div
          id="tracked-order-results"
          className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          {/* Top Status Banner */}
          <div className="bg-slate-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">رقم الطلب:</span>
                <span className="font-mono text-lg sm:text-xl font-black text-amber-300 tracking-wider">
                  {order.order_number}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                تاريخ التسجيل:{' '}
                {new Date(order.created_at).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div
                className={`px-4 py-2 rounded-2xl border text-xs sm:text-sm font-black flex items-center gap-2 shadow-xs ${
                  getStatusArabicLabel(order.status).color
                }`}
              >
                {order.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                {order.status === 'cancelled' && <XCircle className="w-4 h-4" />}
                {order.status === 'processing' && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{getStatusArabicLabel(order.status).label}</span>
              </div>

              <button
                id="refresh-order-status-btn"
                onClick={handleRefresh}
                className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="تحديث الحالة الآن"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Step Progression Timeline */}
            {!isCancelled ? (
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  مراحل تنفيذ طلب الشحن:
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {timelineSteps.map((s) => {
                    const isDone = currentStep >= s.step;
                    const isCurrent = currentStep === s.step;

                    return (
                      <div
                        key={s.step}
                        className={`relative p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                          isDone
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs'
                            : 'bg-slate-50 border-slate-200/80 text-slate-400 opacity-60'
                        } ${isCurrent ? 'ring-2 ring-emerald-500 shadow-md bg-white opacity-100' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                              isDone
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.step}
                          </span>
                          {isCurrent && (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                          )}
                        </div>

                        <div>
                          <h4 className="font-black text-xs sm:text-sm text-slate-900 leading-tight">
                            {s.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                            {s.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-center gap-3">
                <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                <div>
                  <h4 className="font-extrabold">تم إلغاء هذا الطلب</h4>
                  <p className="text-xs text-rose-700 mt-0.5">
                    إذا كان لديك استفسار أو قمت بالتحويل بالفعل، يرجى التواصل فوراً مع الدعم الفني عبر واتساب.
                  </p>
                </div>
              </div>
            )}

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/80 rounded-3xl p-5 sm:p-6 border border-slate-200/80">
              <div className="space-y-3 text-xs sm:text-sm">
                <h4 className="font-black text-slate-900 text-sm border-b border-slate-200/80 pb-2">
                  بيانات الخط والعميل
                </h4>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">اسم العميل:</span>
                  <span className="font-bold text-slate-900">{order.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">رقم الهاتف المراد شحنه:</span>
                  <span className="font-mono font-bold text-slate-900" dir="ltr">
                    {order.phone_number}
                  </span>
                </div>
                {order.contact_phone && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">رقم التواصل:</span>
                    <span className="font-mono font-bold text-slate-900" dir="ltr">
                      {order.contact_phone}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">الشركة:</span>
                  <span className="font-bold text-slate-900">{order.company_name}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <h4 className="font-black text-slate-900 text-sm border-b border-slate-200/80 pb-2">
                  تفاصيل الباقة والمبلغ
                </h4>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">الباقة:</span>
                  <span className="font-bold text-emerald-800">{order.package_name}</span>
                </div>
                {order.package_quota && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">سعة الإنترنت/الوحدات:</span>
                    <span className="font-bold text-slate-900">{order.package_quota}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">طريقة الدفع:</span>
                  <span className="font-bold text-slate-900">
                    {order.payment_method === 'vodafone_cash'
                      ? 'فودافون كاش'
                      : order.payment_method === 'instapay'
                      ? 'إنستاباي'
                      : 'تحويل يدوي'}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500 font-bold">المبلغ المطلوب:</span>
                  <span className="font-black text-slate-900 text-base">
                    {order.amount} {settings?.currency || 'جنيه'}
                  </span>
                </div>
              </div>
            </div>

            {/* Status History Logs */}
            {order.status_history && order.status_history.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-600">سجل التحديثات الزمنية:</h4>
                <div className="space-y-2">
                  {order.status_history.map((h, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        <span className="font-bold text-slate-900">
                          {getStatusArabicLabel(h.status).label}
                        </span>
                        {h.note && <span className="text-slate-500 font-medium">— {h.note}</span>}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(h.timestamp).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Support CTA */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-slate-500 text-center sm:text-right font-medium">
                هل لديك استفسار بخصوص هذا الطلب أو تود إرسال صورة الإيصال؟
              </p>
              {settings?.whatsapp_number && (
                <a
                  id="whatsapp-tracker-support-btn"
                  href={`https://wa.me/${settings.whatsapp_number.replace(
                    /\+/g,
                    ''
                  )}?text=${encodeURIComponent(
                    `مرحباً، أستفسر عن طلبي برقم: ${order.order_number} الخاص بالرقم: ${order.phone_number}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all cursor-pointer shadow-md shadow-emerald-600/20 hover:scale-102"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>تواصل مع المشرف عبر واتساب</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Return to packages button */}
      {onGoBackToPackages && (
        <div className="text-center pt-2">
          <button
            onClick={onGoBackToPackages}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لتصفح الباقات وشحن خط جديد</span>
          </button>
        </div>
      )}
    </div>
  );
};
