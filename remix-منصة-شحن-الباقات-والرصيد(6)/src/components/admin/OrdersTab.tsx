import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Company, SiteSettings } from '../../types';
import { api } from '../../services/api';
import { CompanyBadge } from '../CompanyBadge';
import { OrderDetailsModal } from './OrderDetailsModal';
import {
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  ExternalLink,
  Loader2,
  Trash2,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  ArrowUpDown,
  Zap,
  ShoppingBag,
} from 'lucide-react';

interface OrdersTabProps {
  companies: Company[];
  settings: SiteSettings | null;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ companies, settings }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminOrders({
        status: statusFilter,
        company_id: companyFilter,
        search: searchQuery,
      });
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, companyFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleDirectDelete = async (orderId: string) => {
    try {
      setDeletingOrderId(orderId);
      await api.deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId && o.order_number !== orderId));
      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.order_number === orderId)) {
        setSelectedOrder(null);
      }
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Failed to delete order:', err);
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleQuickStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, nextStatus);
      if (statusFilter !== 'all' && nextStatus !== statusFilter) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } else {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      }
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(res.order);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return { label: 'جديد', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'pending_payment':
        return { label: 'في انتظار الدفع', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'payment_confirmed':
        return { label: 'تم تأكيد الدفع', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'processing':
        return { label: 'جاري التنفيذ', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'recharged':
        return { label: 'تم الشحن', bg: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'completed':
        return { label: 'مكتمل', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'cancelled':
        return { label: 'ملغي', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const filterTabs = [
    { id: 'all', label: 'كافة الطلبات' },
    { id: 'new', label: 'جديد' },
    { id: 'pending_payment', label: 'في انتظار الدفع' },
    { id: 'payment_confirmed', label: 'تم تأكيد الدفع' },
    { id: 'processing', label: 'جاري التنفيذ' },
    { id: 'recharged', label: 'تم الشحن' },
    { id: 'completed', label: 'مكتمل' },
    { id: 'cancelled', label: 'ملغي' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Search */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">إدارة ومتابعة طلبات الشحن</h2>
            <p className="text-xs text-slate-500">
              استقبل الطلبات، راجع التحويلات اليدوية، وقم بتنفيذ الشحن وتحديث الحالة
            </p>
          </div>

          <button
            id="refresh-admin-orders-btn"
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث القائمة</span>
          </button>
        </div>

        {/* Search & Company Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          {/* Search input */}
          <form onSubmit={handleSearchSubmit} className="sm:col-span-2 relative">
            <input
              id="admin-search-orders-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم الطلب (ORD-...)، اسم العميل، أو رقم الهاتف..."
              className="w-full pl-20 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <button
              type="submit"
              className="absolute left-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              بحث
            </button>
          </form>

          {/* Company select */}
          <div>
            <select
              id="admin-company-filter-select"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">جميع الشركات</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {filterTabs.map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                id={`orders-status-tab-${tab.id}`}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List / Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-xs text-slate-500 font-bold">جاري تحميل الطلبات...</span>
        </div>
      ) : orders.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-4">رقم الطلب</th>
                  <th className="p-4">العميل</th>
                  <th className="p-4">رقم الشحن</th>
                  <th className="p-4">الشركة والباقة</th>
                  <th className="p-4">المبلغ</th>
                  <th className="p-4">طريقة الدفع</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">التاريخ</th>
                  <th className="p-4 text-center">إجراءات سريعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => {
                  const badge = getStatusBadge(ord.status);
                  const cleanPhone = (ord.contact_phone || ord.phone_number).replace(/\D/g, '');
                  const intlPhone = cleanPhone.startsWith('01') ? `2${cleanPhone}` : cleanPhone;

                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedOrder(ord)}
                    >
                      {/* Order Number */}
                      <td className="p-4 font-mono font-black text-slate-900">
                        <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-800">
                          {ord.order_number}
                        </span>
                      </td>

                      {/* Customer Name */}
                      <td className="p-4 font-bold text-slate-900">
                        <span>{ord.customer_name}</span>
                      </td>

                      {/* Phone Number */}
                      <td className="p-4 font-mono font-bold text-emerald-700" dir="ltr">
                        <span>{ord.phone_number}</span>
                      </td>

                      {/* Package & Company */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <CompanyBadge
                            companyId={ord.company_id}
                            companyName={ord.company_name}
                            size="sm"
                          />
                          <span className="block font-bold text-slate-800 text-[11px]">
                            {ord.package_name}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="p-4 font-black text-slate-900">
                        {ord.amount} {settings?.currency || 'جنيه'}
                      </td>

                      {/* Payment Method */}
                      <td className="p-4 text-slate-600 font-medium">
                        {ord.payment_method === 'vodafone_cash'
                          ? 'فودافون كاش'
                          : ord.payment_method === 'instapay'
                          ? 'إنستاباي'
                          : 'تحويل يدوي'}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-black border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-slate-400 font-mono text-[11px]">
                        {new Date(ord.created_at).toLocaleString('ar-EG', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Quick Actions */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Quick next step button */}
                          {ord.status === 'new' && (
                            <button
                              id={`quick-confirm-pay-${ord.id}`}
                              onClick={() => handleQuickStatus(ord.id, 'payment_confirmed')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] border border-emerald-200 transition-colors"
                              title="تأكيد استلام الدفع"
                            >
                              تأكيد الدفع
                            </button>
                          )}

                          {ord.status === 'payment_confirmed' && (
                            <button
                              id={`quick-start-process-${ord.id}`}
                              onClick={() => handleQuickStatus(ord.id, 'processing')}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px] border border-indigo-200 transition-colors"
                              title="بدء الشحن اليدوي"
                            >
                              بدء الشحن
                            </button>
                          )}

                          {ord.status === 'processing' && (
                            <button
                              id={`quick-mark-recharged-${ord.id}`}
                              onClick={() => handleQuickStatus(ord.id, 'recharged')}
                              className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold text-[11px] border border-teal-200 transition-colors"
                              title="تأكيد الشحن"
                            >
                              تم الشحن
                            </button>
                          )}

                          {ord.status === 'recharged' && (
                            <button
                              id={`quick-mark-completed-${ord.id}`}
                              onClick={() => handleQuickStatus(ord.id, 'completed')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 font-bold text-[11px] transition-colors"
                              title="إتمام الطلب"
                            >
                              إتمام
                            </button>
                          )}

                          {/* WhatsApp Chat button */}
                          <a
                            id={`quick-whatsapp-${ord.id}`}
                            href={`https://wa.me/${intlPhone}?text=${encodeURIComponent(
                              `مرحباً أستاذ ${ord.customer_name}، بخصوص طلبك برقم ${ord.order_number} لرقم ${ord.phone_number}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                            title="محادثة واتساب"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                          </a>

                          {/* Details button */}
                          <button
                            id={`view-order-details-${ord.id}`}
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                            title="عرض التفاصيل وتغيير الحالة"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Delete button */}
                          {confirmDeleteId === ord.id ? (
                            <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 p-0.5 rounded-lg">
                              <button
                                id={`confirm-del-row-${ord.id}`}
                                onClick={() => handleDirectDelete(ord.id)}
                                disabled={deletingOrderId === ord.id}
                                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] transition-colors flex items-center gap-1"
                                title="تأكيد الحذف"
                              >
                                {deletingOrderId === ord.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <span>تأكيد الحذف</span>
                                )}
                              </button>
                              <button
                                id={`cancel-del-row-${ord.id}`}
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px]"
                                title="إلغاء"
                              >
                                إلغاء
                              </button>
                            </div>
                          ) : (
                            <button
                              id={`quick-delete-${ord.id}`}
                              onClick={() => setConfirmDeleteId(ord.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="حذف الطلب"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="block lg:hidden divide-y divide-slate-100">
            {orders.map((ord) => {
              const badge = getStatusBadge(ord.status);
              const cleanPhone = (ord.contact_phone || ord.phone_number).replace(/\D/g, '');
              const intlPhone = cleanPhone.startsWith('01') ? `2${cleanPhone}` : cleanPhone;

              return (
                <div
                  key={ord.id}
                  className="p-4 space-y-3 hover:bg-slate-50 transition-colors"
                  onClick={() => setSelectedOrder(ord)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-sm bg-slate-100 px-2 py-0.5 rounded text-slate-900">
                      {ord.order_number}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{ord.customer_name}</h4>
                      <p className="font-mono text-emerald-700 font-bold" dir="ltr">
                        {ord.phone_number}
                      </p>
                    </div>
                    <div className="text-left">
                      <CompanyBadge
                        companyId={ord.company_id}
                        companyName={ord.company_name}
                        size="sm"
                      />
                      <span className="block font-black text-slate-900 mt-1">
                        {ord.amount} {settings?.currency || 'جنيه'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 font-mono text-[10px]">
                      {new Date(ord.created_at).toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`https://wa.me/${intlPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                        <span>واتساب</span>
                      </a>

                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold"
                      >
                        إدارة
                      </button>

                      {confirmDeleteId === ord.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 p-0.5 rounded-lg">
                          <button
                            onClick={() => handleDirectDelete(ord.id)}
                            disabled={deletingOrderId === ord.id}
                            className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px]"
                          >
                            {deletingOrderId === ord.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              'تأكيد'
                            )}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px]"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(ord.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="حذف الطلب"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">سجل الطلبات فارغ تماماً</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            تم تفريغ كافة الطلبات بنجاح. ستبدأ أرقام الطلبات الجديدة تلقائياً من رقم 1 بمجرد إرسال أي عميل لطلب شحن جديد.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">لا توجد طلبات مطابقة</h3>
          <p className="text-xs text-slate-500">
            لم نجد طلبات تطابق الفلتر أو كلمة البحث الحالية.
          </p>
          <button
            onClick={() => {
              setStatusFilter('all');
              setCompanyFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
          >
            عرض كافة الطلبات
          </button>
        </div>
      )}

      {/* Selected Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          settings={settings}
          onClose={() => setSelectedOrder(null)}
          onOrderUpdated={(updated) => {
            if (statusFilter !== 'all' && updated.status !== statusFilter) {
              setOrders((prev) => prev.filter((o) => o.id !== updated.id));
            } else {
              setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
            }
            setSelectedOrder(updated);
          }}
          onOrderDeleted={(orderId) => {
            setOrders((prev) => prev.filter((o) => o.id !== orderId && o.order_number !== orderId));
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};
