import React, { useState, useEffect } from 'react';
import { Company, Category, SiteSettings, Order } from '../../types';
import { api } from '../../services/api';
import { StatsTab } from './StatsTab';
import { OrdersTab } from './OrdersTab';
import { SubscribersTab } from './SubscribersTab';
import { PackagesTab } from './PackagesTab';
import { CompaniesTab } from './CompaniesTab';
import { SettingsTab } from './SettingsTab';
import {
  LayoutDashboard,
  ShoppingBag,
  Package as PackageIcon,
  Building2,
  Settings,
  LogOut,
  ArrowRight,
  Shield,
  Zap,
  Bell,
  Calendar,
  CalendarCheck,
  AlertTriangle,
} from 'lucide-react';

interface AdminDashboardProps {
  adminUser: { id: string; email: string; name: string } | null;
  companies: Company[];
  categories: Category[];
  settings: SiteSettings | null;
  onLogout: () => void;
  onBackToHome: () => void;
  onSettingsUpdated: (settings: SiteSettings) => void;
  onDataChanged: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  companies,
  categories,
  settings,
  onLogout,
  onBackToHome,
  onSettingsUpdated,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'subscribers' | 'stats' | 'packages' | 'companies' | 'settings'>(() => {
    const hashTab = window.location.hash.match(/^#admin\/(orders|subscribers|stats|packages|companies|settings)$/)?.[1];
    if (hashTab) return hashTab as 'orders' | 'subscribers' | 'stats' | 'packages' | 'companies' | 'settings';
    const savedTab = window.localStorage.getItem('recharge_admin_tab');
    return savedTab === 'subscribers' || savedTab === 'stats' || savedTab === 'packages' || savedTab === 'companies' || savedTab === 'settings'
      ? savedTab
      : 'orders';
  });
  const [dueRenewalsCount, setDueRenewalsCount] = useState<number>(0);

  // Check for due renewals
  const checkDueRenewals = async () => {
    try {
      const stats = await api.getAdminStats('all');
      if (typeof stats.dueRenewalsCount === 'number') {
        setDueRenewalsCount(stats.dueRenewalsCount);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    checkDueRenewals();
  }, [activeTab]);

  useEffect(() => {
    window.localStorage.setItem('recharge_admin_tab', activeTab);
    window.history.replaceState(null, '', `#admin/${activeTab}`);
  }, [activeTab]);

  const navTabs = [
    { id: 'orders', label: 'إدارة الطلبات', icon: ShoppingBag },
    {
      id: 'subscribers',
      label: 'العملاء والاشتراكات الشهرية',
      icon: Calendar,
      badge: dueRenewalsCount > 0 ? dueRenewalsCount : undefined,
    },
    { id: 'stats', label: 'الإحصائيات والأرباح', icon: LayoutDashboard },
    { id: 'packages', label: 'الباقات والأسعار والتكلفة', icon: PackageIcon },
    { id: 'companies', label: 'الشركات والتصنيفات', icon: Building2 },
    { id: 'settings', label: 'إعدادات المنصة', icon: Settings },
  ];

  return (
    <div id="admin-dashboard-root" className="min-h-screen bg-slate-100/70 text-right pb-16 w-full font-sans">
      {/* Top Admin Bar */}
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
        <div className="w-full max-w-[1720px] 2xl:max-w-[1840px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-12">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Brand / Admin badge */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 flex items-center justify-center font-black shadow-md shadow-emerald-500/20">
                <Shield className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm sm:text-base text-white">لوحة تحكم الإدارة</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-500/30">
                    المشرف العام
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {adminUser?.email || 'admin@recharge.com'}
                </span>
              </div>
            </div>

            {/* Actions: Due renewals quick badge, Back to site & Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              {dueRenewalsCount > 0 && activeTab !== 'subscribers' && (
                <button
                  id="admin-due-renewals-quick-btn"
                  onClick={() => setActiveTab('subscribers')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer animate-pulse"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{dueRenewalsCount} عميل حان تجديدهم اليوم!</span>
                </button>
              )}

              <button
                id="admin-to-storefront-btn"
                onClick={onBackToHome}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer border border-slate-700/80 shadow-xs"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>واجهة المتجر</span>
              </button>

              <button
                id="admin-logout-btn"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-bold transition-colors cursor-pointer border border-rose-500/20 shadow-xs"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تسجيل خروج</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="w-full max-w-[1720px] 2xl:max-w-[1840px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-12 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`admin-tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-1 ring-emerald-400/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {typeof tab.badge === 'number' && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area: Responsive Full-Screen Width */}
      <main className="w-full max-w-[1720px] 2xl:max-w-[1840px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-12 pt-6 sm:pt-8">
        {activeTab === 'orders' && (
          <OrdersTab companies={companies} settings={settings} />
        )}

        {activeTab === 'subscribers' && (
          <SubscribersTab
            companies={companies}
            settings={settings}
            onDataChanged={() => {
              checkDueRenewals();
              onDataChanged();
            }}
          />
        )}

        {activeTab === 'stats' && (
          <StatsTab
            settings={settings}
            onViewAllOrders={() => setActiveTab('orders')}
            onSelectOrder={() => setActiveTab('orders')}
          />
        )}

        {activeTab === 'packages' && (
          <PackagesTab
            companies={companies}
            categories={categories}
            settings={settings}
            onDataChanged={onDataChanged}
          />
        )}

        {activeTab === 'companies' && (
          <CompaniesTab
            companies={companies}
            categories={categories}
            onDataChanged={onDataChanged}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            settings={settings}
            onSettingsUpdated={onSettingsUpdated}
            onDataChanged={onDataChanged}
          />
        )}
      </main>
    </div>
  );
};
