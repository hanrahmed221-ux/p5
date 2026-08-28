import React, { useState } from 'react';
import {
  Zap,
  Search,
  Phone,
  Shield,
  Menu,
  X,
  MessageCircle,
  Package as PackageIcon,
  Home,
  CheckCircle2,
  ArrowLeft,
  ChevronLeft,
} from 'lucide-react';
import { SiteSettings } from '../types';

interface HeaderProps {
  settings: SiteSettings | null;
  currentView?: 'storefront' | 'tracking' | 'admin_login' | 'admin_dashboard';
  onNavigate?: (view: 'storefront' | 'tracking' | 'admin_login' | 'admin_dashboard') => void;
  onOpenAdmin?: () => void;
  activeTab?: 'home' | 'packages' | 'track' | 'contact' | 'admin';
  setActiveTab?: (tab: 'home' | 'packages' | 'track' | 'contact' | 'admin') => void;
  isAdminLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  currentView = 'storefront',
  onNavigate,
  onOpenAdmin,
  activeTab,
  setActiveTab,
  isAdminLoggedIn = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'packages', label: 'الباقات والأسعار', icon: PackageIcon },
    { id: 'track', label: 'تتبع الطلب', icon: Search },
    { id: 'contact', label: 'تواصل معنا', icon: Phone },
  ];

  // Determine current active item
  const getActiveState = (id: string) => {
    if (activeTab) return activeTab === id;
    if (id === 'track' && currentView === 'tracking') return true;
    if (id === 'home' && currentView === 'storefront') return true;
    return false;
  };

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    window.sessionStorage.removeItem('recharge_scroll_position');
    const section = id === 'track' ? 'tracking' : id;
    window.localStorage.setItem('recharge_current_section', section);
    window.history.replaceState(null, '', `#${section}`);

    if (typeof setActiveTab === 'function') {
      setActiveTab(id as any);
    }

    if (id === 'home') {
      if (onNavigate) onNavigate('storefront');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (id === 'packages') {
      if (onNavigate) onNavigate('storefront');
      setTimeout(() => {
        const el = document.getElementById('packages-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    } else if (id === 'track') {
      if (onNavigate) onNavigate('tracking');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (id === 'contact') {
      if (onNavigate) onNavigate('storefront');
      setTimeout(() => {
        const el = document.getElementById('contact-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    } else if (id === 'admin') {
      if (onOpenAdmin) {
        onOpenAdmin();
      } else if (onNavigate) {
        onNavigate('admin_login');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="w-full max-w-[1720px] 2xl:max-w-[1840px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-12">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Right (RTL): Brand Logo & Status */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div
              id="brand-logo"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
                <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                    {settings?.site_name || 'شحن تك'}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>متاح للشحن</span>
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium hidden xs:block">
                  {settings?.site_tagline || 'شحن باقات ورصيد فوري'}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/70">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = getActiveState(item.id);
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-slate-900/5'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Left (RTL): Actions (WhatsApp & Admin Portal) */}
          <div className="hidden sm:flex items-center gap-2.5">
            {settings?.whatsapp_number && (
              <a
                id="header-whatsapp-btn"
                href={`https://wa.me/${settings.whatsapp_number.replace(/\+/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200/80 transition-colors shadow-xs"
                title="تواصل مباشر عبر واتساب"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600 shrink-0" />
                <span>دعم واتساب</span>
              </a>
            )}

            <button
              id="admin-dashboard-btn"
              onClick={() => handleNavClick('admin')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                currentView === 'admin_dashboard' || currentView === 'admin_login' || isAdminLoggedIn
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>{currentView === 'admin_dashboard' || isAdminLoggedIn ? 'لوحة المشرف' : 'دخول الإدارة'}</span>
            </button>
          </div>

          {/* Mobile Actions: Quick Track & Hamburger Menu */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              id="mobile-track-quick-btn"
              onClick={() => handleNavClick('track')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              title="تتبع الطلب"
            >
              <Search className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden xs:inline">تتبع الطلب</span>
            </button>

            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
              aria-label="القائمة الرئيسية"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full border-t border-slate-200/80 bg-white/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = getActiveState(item.id);
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-extrabold text-right transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/60'
                      : 'text-slate-700 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {settings?.whatsapp_number && (
              <a
                id="mobile-whatsapp-btn"
                href={`https://wa.me/${settings.whatsapp_number.replace(/\+/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-black text-emerald-900 bg-emerald-50 border border-emerald-200/80 shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                <span>محادثة فورية مع المشرف عبر واتساب</span>
              </a>
            )}

            <button
              id="mobile-admin-btn"
              onClick={() => handleNavClick('admin')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-extrabold bg-slate-950 text-white cursor-pointer shadow-xs"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>{currentView === 'admin_dashboard' || isAdminLoggedIn ? 'لوحة تحكم الإدارة' : 'تسجيل دخول المشرف'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
