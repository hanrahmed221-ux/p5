import React, { useState } from 'react';
import { Order, OrderStatus, SiteSettings } from '../../types';
import { api } from '../../services/api';
import { CompanyBadge } from '../CompanyBadge';
import {
  X,
  Phone,
  User,
  Package as PackageIcon,
  CreditCard,
  Clock,
  Calendar,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface OrderDetailsModalProps {
  order: Order;
  settings: SiteSettings | null;
  onClose: () => void;
  onOrderUpdated: (updatedOrder: Order) => void;
  onOrderDeleted: (orderId: string) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  settings,
  onClose,
  onOrderUpdated,
  onOrderDeleted,
}) => {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [statusNote, setStatusNote] = useState('');
  const [adminNotes, setAdminNotes] = useState(order.admin_notes || '');
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const statuses: { id: OrderStatus; label: string; color: string }[] = [
    { id: 'new', label: 'جديد (بانتظار المراجعة)', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { id: 'pending_payment', label: 'في انتظار الدفع / التحقق', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { id: 'payment_confirmed', label: 'تم تأكيد استلام الدفع', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { id: 'processing', label: 'جاري التنفيذ والشحن اليدوي', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    { id: 'recharged', label: 'تم شحن الخط بنجاح', color: 'text-teal-700 bg-teal-50 border-teal-200' },
    { id: 'completed', label: 'مكتمل بنجاح', color: 'text-emerald-800 bg-emerald-100 border-emerald-300' },
    { id: 'cancelled', label: 'ملغي', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  ];

  const handleUpdateStatus = async () => {
    try {
      setLoadingStatus(true);
      setErrorMsg('');
      const res = await api.updateOrderStatus(order.id, currentStatus, statusNote.trim() || undefined);
      setSuccessMsg('تم تحديث حالة الطلب وإضافة السجل بنجاح!');
      setStatusNote('');
      onOrderUpdated(res.order);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل تحديث الحالة');
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleSaveAdminNotes = async () => {
    try {
      setLoadingNotes(true);
      setErrorMsg('');
      const res = await api.updateOrderNotes(order.id, adminNotes);
      setSuccessMsg('تم حفظ ملاحظات الإدارة بنجاح!');
      onOrderUpdated(res.order);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل حفظ الملاحظات');
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleExecuteDelete = async () => {
    try {
      setLoadingDelete(true);
      setErrorMsg('');
      await api.deleteOrder(order.id);
      onOrderDeleted(order.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل حذف الطلب');
      setLoadingDelete(false);
      setShowDeleteConfirm(false);
    }
  };

  // WhatsApp helper for communicating with the customer
  const generateCustomerWhatsAppMessage = () => {
    const statusArabic = statuses.find((s) => s.id === currentStatus)?.label || currentStatus;
    const msg =
      `مرحباً أستاذ ${order.customer_name}،\n` +
      `بخصوص طلب الشحن الخاص بك برقم: ${order.order_number}\n` +
      `📱 رقم الشحن: ${order.phone_number}\n` +
      `📦 الباقة: ${order.package_name}\n` +
      `📌 الحالة الحالية: ${statusArabic}\n` +
      (statusNote ? `💬 ملاحظة: ${statusNote}\n` : '') +
      `شكراً لتعاملك مع منصتنا!`;
    return encodeURIComponent(msg);
  };

  const customerTargetPhone = order.contact_phone || order.phone_number;
  const cleanTargetPhone = customerTargetPhone.replace(/\D/g, '');
  const internationalPhone = cleanTargetPhone.startsWith('01') ? `2${cleanTargetPhone}` : cleanTargetPhone;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div
        id="order-details-modal-container"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 text-right max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <PackageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">تفاصيل الطلب:</h2>
                <span className="font-mono text-base font-black text-amber-400">
                  {order.order_number}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                تاريخ الإنشاء:{' '}
                {new Date(order.created_at).toLocaleString('ar-EG', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
          </div>

          <button
            id="close-order-details-btn"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Alerts */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div className="space-y-2">
              <span className="font-extrabold text-slate-900 block text-sm border-b border-slate-200 pb-1">
                بيانات العميل والاتصال
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">اسم العميل:</span>
                <span className="font-bold text-slate-900">{order.customer_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">رقم هاتف الشحن:</span>
                <span className="font-mono font-black text-emerald-700 text-sm" dir="ltr">
                  {order.phone_number}
                </span>
              </div>
              {order.contact_phone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">رقم التواصل:</span>
                  <span className="font-mono font-bold text-slate-800" dir="ltr">
                    {order.contact_phone}
                  </span>
                </div>
              )}
              {order.notes && (
                <div className="pt-1 border-t border-slate-200">
                  <span className="text-slate-500 block font-bold">ملاحظات العميل:</span>
                  <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200 mt-1">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="font-extrabold text-slate-900 block text-sm border-b border-slate-200 pb-1">
                بيانات الباقة والمبلغ
              </span>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">الشركة:</span>
                <CompanyBadge companyId={order.company_id} companyName={order.company_name} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">الباقة:</span>
                <span className="font-bold text-slate-900">{order.package_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">طريقة الدفع:</span>
                <span className="font-bold text-slate-900">
                  {order.payment_method === 'vodafone_cash'
                    ? 'فودافون كاش'
                    : order.payment_method === 'instapay'
                    ? 'إنستاباي'
                    : 'تحويل يدوي'}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-bold">المبلغ المحول:</span>
                <span className="font-black text-emerald-700 text-base">
                  {order.amount} {settings?.currency || 'جنيه'}
                </span>
              </div>
              {order.package_profit !== undefined && (
                <div className="flex justify-between text-[11px] bg-emerald-50/70 p-1.5 rounded-lg border border-emerald-100">
                  <span className="text-emerald-800 font-bold">
                    التكلفة: {order.package_cost ?? Math.round(order.amount * 0.85)} ج
                  </span>
                  <span className="text-emerald-900 font-black">
                    صافي الربح: +{order.package_profit} ج
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Core Manual Recharge Action: Change Order Status */}
          <div className="bg-white border-2 border-emerald-100 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>تغيير حالة الطلب (تنفيذ الشحن اليدوي):</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اختر الحالة الجديدة:
                </label>
                <select
                  id="order-status-select"
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value as OrderStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {statuses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ملاحظة الحالة تظهر للعميل في التتبع (اختياري):
                </label>
                <input
                  id="status-note-input"
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="مثال: تم استلام تحويل 200 ج وشحن باقة 40 جيجا بنجاح"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  id="save-status-btn"
                  onClick={handleUpdateStatus}
                  disabled={loadingStatus}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {loadingStatus ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>حفظ الحالة وتحديث العميل</span>
                </button>

                {/* Direct WhatsApp chat with customer */}
                <a
                  id="whatsapp-customer-direct-btn"
                  href={`https://wa.me/${internationalPhone}?text=${generateCustomerWhatsAppMessage()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                  <span>إرسال تحديث للعميل بالواتساب</span>
                </a>
              </div>
            </div>
          </div>

          {/* Internal Admin Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              ملاحظات داخلية للمدير فقط (لا تظهر للعميل):
            </label>
            <textarea
              id="admin-internal-notes-input"
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="اكتب أي تفاصيل داخلية، مثل: كود الشحن، رقم الشريحة المحول منها، إلخ..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            <button
              id="save-admin-notes-btn"
              onClick={handleSaveAdminNotes}
              disabled={loadingNotes}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              {loadingNotes && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>حفظ الملاحظات الداخلية</span>
            </button>
          </div>

          {/* Status Timeline History */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block">سجل التغييرات الكامل:</span>
            <div className="space-y-2">
              {order.status_history?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="font-bold text-slate-800">
                      {statuses.find((s) => s.id === item.status)?.label || item.status}
                    </span>
                    {item.note && <p className="text-slate-600 mt-0.5 text-[11px]">{item.note}</p>}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(item.timestamp).toLocaleString('ar-EG', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          {showDeleteConfirm ? (
            <div
              id="order-delete-confirm-box"
              className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in"
            >
              <div className="flex items-center gap-2 text-rose-800 text-xs font-bold text-center sm:text-right">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>هل أنت متأكد من حذف الطلب ({order.order_number}) نهائياً؟</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  id="cancel-delete-order-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loadingDelete}
                  className="flex-1 sm:flex-initial px-4 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer transition-colors"
                >
                  تراجع
                </button>
                <button
                  id="confirm-delete-order-btn"
                  onClick={handleExecuteDelete}
                  disabled={loadingDelete}
                  className="flex-1 sm:flex-initial px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs disabled:opacity-50"
                >
                  {loadingDelete ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>نعم، احذف الطلب</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                id="delete-order-btn"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-bold p-2 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف هذا الطلب</span>
              </button>

              <button
                id="close-modal-bottom-btn"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
              >
                إغلاق
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
