import React, { useState } from 'react';
import { Order, SiteSettings } from '../types';
import {
  CheckCircle2,
  Copy,
  Search,
  MessageCircle,
  X,
  Phone,
  ShieldCheck,
} from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order;
  settings: SiteSettings | null;
  onClose: () => void;
  onTrackOrder: (orderNumber: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  settings,
  onClose,
  onTrackOrder,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappMessage = encodeURIComponent(
    `مرحباً، قمت بعمل طلب شحن على منصتكم:\n` +
      `📌 رقم الطلب: ${order.order_number}\n` +
      `📱 رقم الشحن: ${order.phone_number}\n` +
      `📦 الباقة: ${order.package_name}\n` +
      `💰 المبلغ: ${order.amount} ${settings?.currency || 'جنيه'}\n` +
      `👤 اسم العميل: ${order.customer_name}\n` +
      `برجاء مراجعة الدفع وتنفيذ الشحن. شكراً لكم!`
  );

  const whatsappUrl = settings?.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/\+/g, '')}?text=${whatsappMessage}`
    : `https://wa.me/?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        id="order-success-modal-container"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 text-right"
      >
        {/* Top Success Banner */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 text-center relative">
          <button
            id="close-success-modal-x-btn"
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full text-emerald-100 hover:text-white hover:bg-emerald-800/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-full bg-white/20 text-white flex items-center justify-center mx-auto mb-3 backdrop-blur-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-200 fill-emerald-500 stroke-[2.5]" />
          </div>

          <h2 className="text-2xl font-black text-white">تم استلام طلبك بنجاح!</h2>
          <p className="text-xs text-emerald-100 mt-1">
            سيتم مراجعة الدفع وتنفيذ الشحن يدويًا على خطك خلال دقائق
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Order Number Box */}
          <div className="bg-slate-50 border-2 border-dashed border-emerald-300 rounded-2xl p-4 text-center space-y-2">
            <span className="text-xs text-slate-500 font-bold block">رقم الطلب الخاص بك:</span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-black font-mono text-emerald-700 tracking-wider">
                {order.order_number}
              </span>
              <button
                id="copy-order-number-btn"
                onClick={handleCopyOrderNumber}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition-colors cursor-pointer"
                title="نسخ رقم الطلب"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              احتفظ برقم الطلب لتتمكن من تتبع حالة الشحن في أي وقت
            </p>
          </div>

          {/* Order Summary Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 divide-y divide-slate-100 text-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2">
              <span className="text-slate-500">اسم العميل:</span>
              <span className="font-bold text-slate-900">{order.customer_name}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500">رقم الهاتف المراد شحنه:</span>
              <span className="font-mono font-bold text-slate-900" dir="ltr">
                {order.phone_number}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500">الباقة المطلوبة:</span>
              <span className="font-bold text-emerald-700">{order.package_name}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500">طريقة الدفع:</span>
              <span className="font-bold text-slate-900">
                {order.payment_method === 'vodafone_cash'
                  ? 'فودافون كاش'
                  : order.payment_method === 'instapay'
                  ? 'إنستاباي InstaPay'
                  : 'تحويل يدوي'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-500">المبلغ الإجمالي:</span>
              <span className="font-black text-slate-900 text-sm">
                {order.amount} {settings?.currency || 'جنيه'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              id="track-this-order-now-btn"
              onClick={() => {
                onTrackOrder(order.order_number);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>تتبع حالة الطلب الآن</span>
            </button>

            <a
              id="send-whatsapp-order-proof-btn"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs sm:text-sm transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
              <span>إرسال إشعار التحويل عبر واتساب للإدارة</span>
            </a>

            <button
              id="finish-order-close-btn"
              onClick={onClose}
              className="w-full py-2.5 text-center text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
            >
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
