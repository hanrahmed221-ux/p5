import React, { useState, useEffect } from 'react';
import { MonthlySubscriber, Company, Package, SiteSettings } from '../../types';
import { api } from '../../services/api';
import { SubscriberModal } from './SubscriberModal';
import { CompanyBadge } from '../CompanyBadge';
import {
  Calendar,
  Plus,
  Search,
  RefreshCw,
  Phone,
  MessageCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Trash2,
  Edit2,
  Zap,
  Sparkles,
  DollarSign,
  Layers,
  ChevronDown,
  Loader2,
  Check,
  CalendarCheck,
  TrendingUp,
} from 'lucide-react';

interface SubscribersTabProps {
  companies: Company[];
  settings: SiteSettings | null;
  onDataChanged?: () => void;
}

export const SubscribersTab: React.FC<SubscribersTabProps> = ({
  companies,
  settings,
  onDataChanged,
}) => {
  const [subscribers, setSubscribers] = useState<MonthlySubscriber[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'upcoming'>('all');

  // Modals & Action states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<MonthlySubscriber | null>(null);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const currency = settings?.currency || 'جنيه';

  const parseDateOnly = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsData, pkgsData] = await Promise.all([
        api.getSubscribers(),
        api.getAdminPackages(),
      ]);
      setSubscribers(subsData);
      setPackages(pkgsData);
    } catch (err) {
      console.error('Failed to fetch subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Today calculation in YYYY-MM-DD
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Helper to determine status and days diff
  const getRenewalStatus = (sub: MonthlySubscriber) => {
    if (!sub.active) return { label: 'متوقف', color: 'bg-slate-100 text-slate-600 border-slate-200', isDue: false, isOverdue: false, days: 0 };
    if (!sub.next_renewal_date) return { label: 'غير محدد', color: 'bg-slate-100 text-slate-500', isDue: false, isOverdue: false, days: 0 };

    const targetDate = parseDateOnly(sub.next_renewal_date);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `متأخر ${Math.abs(diffDays)} يوم`,
        color: 'bg-rose-50 text-rose-700 border-rose-300 font-black ring-1 ring-rose-300',
        isDue: true,
        isOverdue: true,
        days: diffDays,
      };
    }
    if (diffDays === 0) {
      return {
        label: 'ميعاد التجديد اليوم! ⚡',
        color: 'bg-amber-50 text-amber-900 border-amber-400 font-black animate-pulse ring-1 ring-amber-300',
        isDue: true,
        isOverdue: false,
        days: 0,
      };
    }
    if (diffDays === 1) {
      return {
        label: 'غداً (خلال يوم)',
        color: 'bg-amber-50 text-amber-800 border-amber-200 font-bold',
        isDue: false,
        isOverdue: false,
        days: 1,
      };
    }
    if (diffDays <= 3) {
      return {
        label: `خلال ${diffDays} أيام`,
        color: 'bg-blue-50 text-blue-800 border-blue-200 font-bold',
        isDue: false,
        isOverdue: false,
        days: diffDays,
      };
    }
    return {
      label: `بعد ${diffDays} يوم`,
      color: 'bg-slate-50 text-slate-700 border-slate-200',
      isDue: false,
      isOverdue: false,
      days: diffDays,
    };
  };

  // WhatsApp reminder message generator
  const getWhatsAppMessage = (sub: MonthlySubscriber) => {
    const siteName = settings?.site_name || 'خدمة شحن الرصيد والباقات';
    const contact = settings?.vodafone_cash_number || settings?.contact_phone || '';
    const instapay = settings?.instapay_address ? `\nأو انستاباي: ${settings.instapay_address}` : '';

    return `أهلاً بك يا ${sub.customer_name} 🌹
من ${siteName}.
نود تذكيرك بحلول ميعاد تجديد باقتك الشهرية:
📦 *${sub.package_name}*
📱 رقم الشحن: *${sub.phone_number}*
💵 القيمة المطلوبة: *${sub.package_price} ${currency}*

للتأكيد والشحن الفوري، يرجى التحويل على:
فودافون كاش: ${contact}${instapay}
وارسال إشعار التحويل ليتم الشحن فوراً. شكراً لثقتك بنا! ✨`;
  };

  const handleOpenWhatsApp = (sub: MonthlySubscriber) => {
    const targetPhone = sub.contact_phone || sub.phone_number;
    let clean = targetPhone.replace(/\D/g, '');
    if (clean.startsWith('01') && clean.length === 11) {
      clean = '2' + clean;
    }
    const text = encodeURIComponent(getWhatsAppMessage(sub));
    const url = `https://wa.me/${clean}?text=${text}`;
    window.open(url, '_blank');
  };

  const handleOpenCall = (sub: MonthlySubscriber) => {
    const targetPhone = sub.contact_phone || sub.phone_number;
    window.open(`tel:${targetPhone}`, '_self');
  };

  // Perform Quick Renewal Action
  const handleQuickRenew = async (sub: MonthlySubscriber) => {
    try {
      setRenewingId(sub.id);
      const res = await api.renewSubscriber(sub.id);
      setActionSuccessMsg(`تم تسجيل شحن باقة (${sub.customer_name}) بنجاح وتم ترحيل موعد التجديد للشهر القادم!`);
      setTimeout(() => setActionSuccessMsg(null), 5000);
      fetchData();
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      alert(err.message || 'فشل تجديد الشحن');
    } finally {
      setRenewingId(null);
    }
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    try {
      await api.deleteSubscriber(id);
      setConfirmDeleteId(null);
      fetchData();
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      alert(err.message || 'فشل حذف المشترك');
    }
  };

  // Save Modal
  const handleSaveModal = async (data: any) => {
    if (editingSubscriber) {
      await api.updateSubscriber(editingSubscriber.id, data);
    } else {
      await api.createSubscriber(data);
    }
    fetchData();
    if (onDataChanged) onDataChanged();
  };

  // Filter subscribers list
  const dueList = subscribers.filter((s) => {
    const status = getRenewalStatus(s);
    return status.isDue;
  });

  const filteredSubscribers = subscribers.filter((sub) => {
    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchName = sub.customer_name.toLowerCase().includes(q);
      const matchPhone = sub.phone_number.includes(q) || (sub.contact_phone && sub.contact_phone.includes(q));
      const matchPkg = sub.package_name.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchPkg) return false;
    }
    // Company
    if (companyFilter !== 'all' && sub.company_id !== companyFilter) {
      return false;
    }
    // Status
    if (statusFilter === 'due') {
      const status = getRenewalStatus(sub);
      return status.isDue;
    }
    if (statusFilter === 'upcoming') {
      const status = getRenewalStatus(sub);
      return !status.isDue && sub.active;
    }
    return true;
  });

  // Calculate monthly stats
  const totalMonthlySales = subscribers.filter((s) => s.active).reduce((sum, s) => sum + (s.package_price || 0), 0);
  const totalMonthlyCost = subscribers.filter((s) => s.active).reduce((sum, s) => sum + (s.package_cost || Math.round((s.package_price || 0) * 0.85)), 0);
  const totalMonthlyProfit = subscribers.filter((s) => s.active).reduce((sum, s) => sum + (s.package_profit || ((s.package_price || 0) - (s.package_cost || Math.round((s.package_price || 0) * 0.85)))), 0);

  return (
    <div className="space-y-8 text-right">
      {/* Top Banner with Due Renewals Highlight */}
      {dueList.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 p-5 sm:p-6 rounded-3xl shadow-lg shadow-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-2 border-amber-300">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-black shrink-0 shadow-md">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-950">
                  تنبيه هام: لديك {dueList.length} عميل حان موعد تجديد باقته الشهرية أو تأخر عن التجديد!
                </h3>
              </div>
              <p className="text-xs text-slate-900 font-bold mt-0.5">
                تواصل معهم الآن عبر الواتساب أو الاتصال لتأكيد الشحن وتسجيل العملية فوراً بضغطة واحدة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setStatusFilter(statusFilter === 'due' ? 'all' : 'due')}
              className="px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{statusFilter === 'due' ? 'عرض كافة العملاء' : 'إظهار عملاء اليوم فقط'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Stats Cards for Monthly Subscribers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Subscribers */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">إجمالي العملاء الشهريين</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {subscribers.filter((sub) => sub.active).length} <span className="text-xs text-slate-400 font-normal">عميل نشط</span>
          </div>
          <p className="text-[10px] text-slate-400">مشتركون في التجديد الشهري التلقائي</p>
        </div>

        {/* Due Today / Overdue */}
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs space-y-1 ${dueList.length > 0 ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">حان موعدهم أو تأخروا</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-950">
            {dueList.length} <span className="text-xs font-bold text-amber-800">عميل يحتاج شحن</span>
          </div>
          <p className="text-[10px] text-amber-800 font-medium">بانتظار التأكيد والشحن</p>
        </div>

        {/* Expected Monthly Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">إجمالي الاشتراكات الشهرية</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {totalMonthlySales.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{currency}</span>
          </div>
          <p className="text-[10px] text-slate-400">إيراد شهري متكرر متوقع</p>
        </div>

        {/* Expected Monthly Net Profit */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-100 font-bold">صافي أرباح الاشتراكات</span>
            <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black">
            +{totalMonthlyProfit.toLocaleString()} <span className="text-xs text-emerald-200 font-bold">{currency}</span>
          </div>
          <p className="text-[10px] text-emerald-100">صافي ربح شهري ثابت من العملاء الدائمين</p>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Add Button */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="sub-search-filter"
            placeholder="ابحث باسم العميل، رقم الهاتف، أو اسم الباقة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-bold"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل ({subscribers.length})
            </button>
            <button
              onClick={() => setStatusFilter('due')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === 'due' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              <span>حان موعدهم</span>
              {dueList.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-slate-950 text-amber-300 text-[10px] flex items-center justify-center font-black">
                  {dueList.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setStatusFilter('upcoming')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'upcoming' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              قادمة لاحقاً
            </button>
          </div>

          {/* Company Filter */}
          <select
            id="sub-company-filter"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">جميع الشركات</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchData}
            className="p-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Add New Subscriber Button */}
          <button
            id="sub-add-new-btn"
            onClick={() => {
              setEditingSubscriber(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عميل شهري جديد</span>
          </button>
        </div>
      </div>

      {/* Subscribers Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading && subscribers.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-xs text-slate-500 font-bold">جاري تحميل جدول المشتركين ومواعيد التجديد...</span>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-slate-800">قائمة المشتركين الشهريين فارغة تماماً</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              تم تفريغ المشتركين بنجاح. يمكنك إضافة أي عميل جديد للمتابعة وتذكيرك بموعد تجديد باقته شهرياً.
            </p>
            <button
              onClick={() => {
                setEditingSubscriber(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 mt-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة أول مشترك الآن</span>
            </button>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-slate-800">لا يوجد عملاء مطابقين للبحث أو الفلتر</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              يمكنك إضافة عملائك الذين تقوم بالشحن لهم شهرياً لتلقي تذكيرات فورية في ميعاد التجديد والتواصل معهم بضغطة واحدة.
            </p>
            <button
              onClick={() => {
                setEditingSubscriber(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 mt-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عميل الآن</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-black">
                  <th className="py-4 px-4 sm:px-5">العميل ورقم الشحن</th>
                  <th className="py-4 px-3">الشركة والباقة</th>
                  <th className="py-4 px-3">السعر والتكلفة والربح</th>
                  <th className="py-4 px-3">يوم التجديد وموعده القادم</th>
                  <th className="py-4 px-3">الحالة والتنبيه</th>
                  <th className="py-4 px-4 text-center">التواصل والتأكيد السريع</th>
                  <th className="py-4 px-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredSubscribers.map((sub) => {
                  const status = getRenewalStatus(sub);
                  const isRenewing = renewingId === sub.id;

                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        status.isDue ? 'bg-amber-50/40 font-semibold' : ''
                      }`}
                    >
                      {/* Customer Info */}
                      <td className="py-4 px-4 sm:px-5">
                        <div className="space-y-1">
                          <span className="font-extrabold text-slate-900 block text-xs sm:text-sm">
                            {sub.customer_name}
                          </span>
                          <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{sub.phone_number}</span>
                          </div>
                          {sub.notes && (
                            <span className="text-[10px] text-slate-400 block truncate max-w-xs" title={sub.notes}>
                              ملاحظة: {sub.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Company & Package */}
                      <td className="py-4 px-3">
                        <div className="space-y-1.5">
                          <CompanyBadge companyId={sub.company_id} companyName={sub.company_name} size="sm" />
                          <span className="font-bold text-slate-800 block text-xs">
                            {sub.package_name}
                          </span>
                        </div>
                      </td>

                      {/* Pricing & Profit */}
                      <td className="py-4 px-3">
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-1">
                            <span className="font-black text-slate-900 text-xs sm:text-sm">
                              {sub.package_price}
                            </span>
                            <span className="text-[10px] text-slate-500">{currency}</span>
                          </div>
                          {sub.package_profit !== undefined && (
                            <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 inline-block">
                              ربح: +{sub.package_profit} {currency}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Renewal Day & Next Date */}
                      <td className="py-4 px-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-black text-slate-900 text-xs">
                              يوم {sub.renewal_day} من كل شهر
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block font-mono">
                            الموعد القادم: {sub.next_renewal_date || 'غير محدد'}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] border ${status.color}`}
                        >
                          {status.isOverdue && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                          {status.isDue && !status.isOverdue && <Zap className="w-3 h-3 text-amber-600" />}
                          <span>{status.label}</span>
                        </span>
                      </td>

                      {/* Direct Actions: WhatsApp & Call & Direct Renew */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* WhatsApp Reminder Button */}
                          <button
                            onClick={() => handleOpenWhatsApp(sub)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] transition-all shadow-xs cursor-pointer"
                            title="إرسال رسالة تذكير على الواتساب مجهزة بالبيانات"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">واتساب</span>
                          </button>

                          {/* Phone Call */}
                          <button
                            onClick={() => handleOpenCall(sub)}
                            className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                            title="اتصال هاتفي بالعميل"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick One-Click Renew (تسجيل الشحن وترحيل الموعد للشهر القادم) */}
                          <button
                            onClick={() => handleQuickRenew(sub)}
                            disabled={isRenewing}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                              status.isDue
                                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs animate-pulse'
                                : 'bg-slate-900 hover:bg-slate-800 text-white'
                            } disabled:opacity-50`}
                            title="تسجيل أنك قمت بالشحن للعميل، وترحيل الموعد القادم للشهر التالي تلقائياً"
                          >
                            {isRenewing ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>تم الشحن والتجديد</span>
                          </button>
                        </div>
                      </td>

                      {/* Edit / Delete */}
                      <td className="py-4 px-4 text-left">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingSubscriber(sub);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="تعديل بيانات العميل"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {confirmDeleteId === sub.id ? (
                            <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                              <button
                                onClick={() => handleDelete(sub.id)}
                                className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded hover:bg-rose-700"
                              >
                                تأكيد
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-1 text-[10px] text-slate-500 hover:text-slate-700"
                              >
                                إلغاء
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(sub.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="حذف من جدول الاشتراكات"
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
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <SubscriberModal
          subscriber={editingSubscriber}
          companies={companies}
          packages={packages}
          currency={currency}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSubscriber(null);
          }}
          onSave={handleSaveModal}
        />
      )}
    </div>
  );
};
