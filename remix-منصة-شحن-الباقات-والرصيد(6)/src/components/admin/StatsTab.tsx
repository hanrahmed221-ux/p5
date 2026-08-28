import React, { useState, useEffect } from 'react';
import { DashboardStats, SiteSettings, Order } from '../../types';
import { api } from '../../services/api';
import { CompanyBadge } from '../CompanyBadge';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  DollarSign,
  Loader2,
  Calendar,
  Layers,
  ArrowLeft,
  RefreshCw,
  Coins,
  Percent,
  Award,
  ArrowUpRight,
} from 'lucide-react';

interface StatsTabProps {
  settings: SiteSettings | null;
  onViewAllOrders: () => void;
  onSelectOrder: (order: Order) => void;
}

export const StatsTab: React.FC<StatsTabProps> = ({
  settings,
  onViewAllOrders,
  onSelectOrder,
}) => {
  const [period, setPeriod] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminStats(period);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  const periods = [
    { id: 'all', label: 'كافة الأوقات' },
    { id: 'today', label: 'اليوم فقط' },
    { id: '7days', label: 'آخر 7 أيام' },
    { id: '30days', label: 'آخر 30 يوم' },
  ];

  if (loading && !stats) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs text-slate-500 font-bold">جاري تحميل تقارير وإحصائيات المنصة والأرباح...</span>
      </div>
    );
  }

  const currency = settings?.currency || 'جنيه';

  return (
    <div className="space-y-8">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900">تقارير المبيعات والأرباح الفعلية</h2>
            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full">
              للطلبات المنفذة فقط
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            إحصائيات مالية دقيقة للطلبات التي تم شحنها واكتمالها فعلياً (بدون الطلبات المعلقة أو غير المنفذة)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {periods.map((p) => (
            <button
              key={p.id}
              id={`stat-period-${p.id}`}
              onClick={() => setPeriod(p.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === p.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}

          <button
            onClick={fetchStats}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary Financial Cards: Sales, Cost, Profit & Margin */}
      {stats && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Sales */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-100 font-bold">المبيعات المحصلة (المنفذة فعلياً)</span>
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-emerald-100" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black">{(stats.totalSales || 0).toLocaleString()}</span>
                <span className="text-xs text-emerald-200 font-bold">{currency}</span>
              </div>
              <p className="text-[10px] text-emerald-100 font-medium">
                مبيعات اليوم المنفذة: {(stats.todaySales || 0).toLocaleString()} {currency}
              </p>
            </div>

            {/* Total Cost */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">التكلفة الفعلية (رأس المال المستهلك)</span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-800">
                  {(stats.totalCost || 0).toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-bold">{currency}</span>
              </div>
              <p className="text-[10px] text-slate-400">
                تكلفة اليوم المنفذة: {(stats.todayCost || 0).toLocaleString()} {currency}
              </p>
            </div>

            {/* Total Net Profit */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-5 rounded-2xl shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-100 font-bold">صافي الأرباح المحققة الفعلية</span>
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black">
                  +{(stats.totalProfit || 0).toLocaleString()}
                </span>
                <span className="text-xs text-emerald-200 font-bold">{currency}</span>
              </div>
              <p className="text-[10px] text-emerald-100 font-medium">
                أرباح اليوم المنفذة: +{(stats.todayProfit || 0).toLocaleString()} {currency}
              </p>
            </div>

            {/* Profit Margin % */}
            <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-800 font-bold">متوسط نسبة الربحية</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                  {stats.profitMargin || 0}%
                </span>
                <span className="text-xs text-emerald-600 font-bold">هامش ربح</span>
              </div>
              <p className="text-[10px] text-emerald-700">
                من إجمالي مبيعات الطلبات المشحونة
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
            <span className="text-emerald-600 font-black">✓ تنبيه النظام:</span>
            <span>
              يتم تسجيل وحساب المبيعات والأرباح والتكاليف <strong>فقط للطلبات التي تم شحنها واكتمالها فعلياً</strong> (حالة: مكتمل / تم الشحن / تم تأكيد الدفع). الطلبات الجديدة وقيد الانتظار لا تدخل في الحسابات حتى يتم تنفيذها.
            </span>
          </div>
        </div>
      )}

      {/* Operational KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Orders */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold">إجمالي الطلبات</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {stats.totalOrders ?? 0}
            </div>
            <p className="text-[10px] text-slate-400">
              طلبات اليوم: {stats.todayOrders ?? 0} طلب
            </p>
          </div>

          {/* New Orders */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold">طلبات جديدة بالانتظار</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-600">
              {(stats.newOrders || 0) + (stats.pendingPaymentOrders || 0)}
            </div>
            <p className="text-[10px] text-slate-400">
              {stats.newOrders ?? 0} جديدة • {stats.pendingPaymentOrders ?? 0} بانتظار الدفع
            </p>
          </div>

          {/* Completed Orders */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold">تم الشحن والاكتمال</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600">
              {(stats.completedOrders || 0) + (stats.rechargedOrders || 0)}
            </div>
            <p className="text-[10px] text-slate-400">
              الطلبات الملغاة: {stats.cancelledOrders ?? 0}
            </p>
          </div>

          {/* Unique Customers */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold">أرقام العملاء</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-900">
              {stats.uniqueCustomers ?? 0}
            </div>
            <p className="text-[10px] text-slate-400">عميل قام بالشحن</p>
          </div>
        </div>
      )}

      {/* Secondary Stats & Carrier Breakdown */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carrier Distribution with Sales, Cost & Profit */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 lg:col-span-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>أرباح ومبيعات شركات الاتصالات</span>
              </h3>
            </div>

            <div className="space-y-4">
              {(stats.companyBreakdown || []).map((comp) => {
                const totalSalesNum = stats.totalSales || 0;
                const percentage =
                  totalSalesNum > 0 ? Math.round(((comp.sales || 0) / totalSalesNum) * 100) : 0;
                return (
                  <div key={comp.companyId} className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <CompanyBadge companyId={comp.companyId} companyName={comp.companyName} size="sm" />
                      <span className="text-[11px] text-slate-500 font-normal">
                        {comp.count || 0} طلب
                      </span>
                    </div>

                    {/* Sales / Cost / Profit Row */}
                    <div className="grid grid-cols-3 gap-1 text-[10px] pt-1">
                      <div>
                        <span className="text-slate-400 block">المبيعات:</span>
                        <span className="font-bold text-slate-900">{(comp.sales || 0).toLocaleString()} {currency}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">التكلفة:</span>
                        <span className="font-bold text-slate-600">{(comp.cost || 0).toLocaleString()} {currency}</span>
                      </div>
                      <div>
                        <span className="text-emerald-600 block font-bold">الربح:</span>
                        <span className="font-black text-emerald-700">+{((comp.profit || 0)).toLocaleString()} {currency}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Best-Selling & Profitable Packages */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>الباقات الأكثر مبيعاً وتحقيقاً للأرباح</span>
                </h3>
                <button
                  id="stat-view-orders-link"
                  onClick={onViewAllOrders}
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>إدارة كافة الطلبات</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              {stats.topPackages && stats.topPackages.length > 0 ? (
                <div className="space-y-2">
                  {stats.topPackages.slice(0, 5).map((tp, idx) => (
                    <div
                      key={tp.packageId || idx}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 flex items-center justify-between gap-3 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-black text-[11px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-extrabold text-slate-900 block text-xs">
                            {tp.packageName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {tp.count} عملية شحن
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <span className="text-[10px] text-slate-400 block">إجمالي المبيعات:</span>
                          <span className="font-bold text-slate-800">
                            {(tp.totalSales || 0).toLocaleString()} {currency}
                          </span>
                        </div>

                        <div className="bg-emerald-100/80 px-2.5 py-1 rounded-xl border border-emerald-200 text-center">
                          <span className="text-[9px] text-emerald-800 font-bold block">صافي الربح</span>
                          <span className="font-black text-emerald-900 text-xs">
                            +{((tp.totalProfit || 0)).toLocaleString()} {currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs font-bold">
                  لا توجد بيانات كافية للباقات في هذه الفترة
                </div>
              )}
            </div>

            {/* Quick link banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              <div>
                <span className="font-black text-sm block">هل وصلت طلبات جديدة؟</span>
                <span className="text-xs text-slate-300">
                  لديك {stats.newOrders} طلبات جديدة بانتظار المراجعة والشحن اليدوي
                </span>
              </div>
              <button
                onClick={onViewAllOrders}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors cursor-pointer shrink-0"
              >
                افتح الطلبات الآن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
