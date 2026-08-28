import React, { useState, useEffect, useRef } from 'react';
import { Company, Category, Package, SiteSettings, Order } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CompanySelector } from './components/CompanySelector';
import { CategorySelector } from './components/CategorySelector';
import { PackagesGrid } from './components/PackagesGrid';
import { OrderModal } from './components/OrderModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTracker } from './components/OrderTracker';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import {
  Loader2,
  ShieldCheck,
  Zap,
  PhoneCall,
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
  Sparkles,
} from 'lucide-react';

const STOREFRONT_VIEW_KEY = 'recharge_current_view';
const STOREFRONT_SECTION_KEY = 'recharge_current_section';
const SCROLL_POSITION_KEY = 'recharge_scroll_position';

const getViewFromHash = () => {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash === 'tracking') return 'tracking' as const;
  if (hash.startsWith('admin')) return 'admin_dashboard' as const;
  return null;
};

export function App() {
  const [view, setView] = useState<'storefront' | 'tracking' | 'admin_login' | 'admin_dashboard'>(() => {
    const hashView = getViewFromHash();
    if (hashView) return hashView;
    const savedView = window.localStorage.getItem(STOREFRONT_VIEW_KEY);
    return savedView === 'tracking' || savedView === 'admin_login' || savedView === 'admin_dashboard'
      ? savedView
      : 'storefront';
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters state for storefront
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  // Checkout modal state
  const [selectedPackageForOrder, setSelectedPackageForOrder] = useState<Package | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Tracking state
  const [trackedOrderNumber, setTrackedOrderNumber] = useState<string>('');

  // Admin Auth state
  const [adminUser, setAdminUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const didRestoreLocation = useRef(false);
  const isPageReload = performance.getEntriesByType('navigation').some(
    (entry) => (entry as PerformanceNavigationTiming).type === 'reload'
  );

  // Fetch initial site data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const data = await api.getSiteData();
      setCompanies(data.companies);
      setCategories(data.categories);
      setPackages(data.packages);
      setSettings(data.settings);
    } catch (err) {
      console.error('Failed to load initial site data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    loadInitialData();

    if (!window.location.hash) {
      const savedSection = window.localStorage.getItem(STOREFRONT_SECTION_KEY);
      if (savedSection) window.history.replaceState(null, '', `#${savedSection}`);
    }

    const saveScrollPosition = () => {
      window.sessionStorage.setItem(SCROLL_POSITION_KEY, String(window.scrollY));
    };
    window.addEventListener('scroll', saveScrollPosition, { passive: true });
    window.addEventListener('pagehide', saveScrollPosition);
    window.addEventListener('beforeunload', saveScrollPosition);

    // Verify existing admin token
    const savedToken = api.getStoredAdminToken();
    if (savedToken) {
      api.getAdminMe()
        .then((res) => {
          if (res && res.admin) setAdminUser(res.admin);
        })
        .catch(() => {
          api.logoutAdmin();
          setAdminUser(null);
        });
    }

    return () => {
      window.removeEventListener('scroll', saveScrollPosition);
      window.removeEventListener('pagehide', saveScrollPosition);
      window.removeEventListener('beforeunload', saveScrollPosition);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  // Restore the requested section only after its content has rendered.
  useEffect(() => {
    if (loading || view !== 'storefront' || didRestoreLocation.current) return;

    const sectionHash = window.location.hash.replace(/^#/, '');
    const sectionId = sectionHash === 'packages' ? 'packages-section' : sectionHash === 'contact' ? 'contact-section' : null;
    const savedScroll = Number(window.sessionStorage.getItem(SCROLL_POSITION_KEY));
    didRestoreLocation.current = true;
    const timer = window.setTimeout(() => {
      if (isPageReload && Number.isFinite(savedScroll)) {
        window.scrollTo({ top: savedScroll, left: 0, behavior: 'auto' });
      } else if (sectionHash === 'home') {
        window.scrollTo(0, 0);
      } else if (sectionId) {
        document.getElementById(sectionId)?.scrollIntoView({ block: 'start' });
      } else if (savedScroll > 0) {
        window.scrollTo(0, savedScroll);
      }
    }, 100);

    return () => window.clearTimeout(timer);
  }, [isPageReload, loading, view]);

  useEffect(() => {
    const hashView = getViewFromHash();
    if (view === 'admin_dashboard') {
      if (!window.location.hash.startsWith('#admin')) window.history.replaceState(null, '', '#admin');
    } else if (view === 'tracking' && hashView !== 'tracking') {
      window.history.replaceState(null, '', '#tracking');
    } else if (view === 'storefront' && (hashView === 'tracking' || hashView === 'admin_dashboard')) {
      window.history.replaceState(null, '', '#home');
    }
    window.localStorage.setItem(STOREFRONT_VIEW_KEY, view);
  }, [view]);

  const handleSelectCompany = (companyId: string) => {
    setSelectedCompanyId(companyId);
    // Smooth scroll to packages section
    const el = document.getElementById('packages-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const handleResetFilters = () => {
    setSelectedCompanyId('all');
    setSelectedCategoryId('all');
  };

  const handleOrderSubmitted = (order: Order) => {
    setSelectedPackageForOrder(null);
    setCreatedOrder(order);
  };

  const handleTrackFromSuccess = (orderNumber: string) => {
    setTrackedOrderNumber(orderNumber);
    setView('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdmin = () => {
    if (api.getStoredAdminToken()) {
      setView('admin_dashboard');
    } else {
      setView('admin_login');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLoginSuccess = (admin: any) => {
    setAdminUser(admin);
    setView('admin_dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = () => {
    api.logoutAdmin();
    setAdminUser(null);
    setView('storefront');
  };

  // If in Admin Dashboard view
  if (view === 'admin_dashboard') {
    return (
      <AdminDashboard
        adminUser={adminUser}
        companies={companies}
        categories={categories}
        settings={settings}
        onLogout={handleAdminLogout}
        onBackToHome={() => {
          setView('storefront');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSettingsUpdated={(newSettings) => setSettings(newSettings)}
        onDataChanged={loadInitialData}
      />
    );
  }

  // If in Admin Login view
  if (view === 'admin_login') {
    return (
      <div className="min-h-screen bg-slate-100/80 flex flex-col justify-between text-right font-sans w-full">
        <Header
          currentView={view}
          onNavigate={(v) => {
            setView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          settings={settings}
          onOpenAdmin={handleOpenAdmin}
          isAdminLoggedIn={!!adminUser}
        />
        <main className="w-full max-w-[1720px] 2xl:max-w-[1840px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-12 py-8 flex-1 flex items-center justify-center">
          <AdminLogin
            onLoginSuccess={handleAdminLoginSuccess}
            onBackToHome={() => {
              setView('storefront');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </main>
        <Footer settings={settings} onOpenAdmin={handleOpenAdmin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between text-right font-sans selection:bg-emerald-500 selection:text-white w-full overflow-x-clip">
      {/* Top Notice Banner if enabled */}
      {settings?.show_notice_banner && settings?.notice_banner && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 font-black text-xs sm:text-sm py-2 px-4 text-center shadow-xs flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-slate-950 shrink-0" />
          <span>{settings.notice_banner}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentView={view}
        onNavigate={(v) => {
          setView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        settings={settings}
        onOpenAdmin={handleOpenAdmin}
        isAdminLoggedIn={!!adminUser}
      />

      {/* Main Content Area: Fully Fluid & Responsive Full-Screen Layout */}
      <main className="w-full max-w-[1720px] 2xl:max-w-[1840px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-12 py-6 sm:py-8 space-y-8 sm:space-y-12">
        {loading ? (
          <div className="py-36 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-base sm:text-lg">جاري تحميل منصة الشحن...</h3>
              <p className="text-xs sm:text-sm text-slate-500">نقوم بتجهيز أحدث باقات وأسعار الشبكات المصرية</p>
            </div>
          </div>
        ) : view === 'tracking' ? (
          /* Order Tracking View */
          <OrderTracker
            initialOrderNumber={trackedOrderNumber}
            settings={settings}
            onGoBackToPackages={() => {
              setView('storefront');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          /* Storefront Main View */
          <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-150">
            {/* Hero Section */}
            <HeroSection
              settings={settings}
              onSelectCompany={handleSelectCompany}
              onTrackOrderClick={() => {
                setView('tracking');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Step 1: Company Selector */}
            <CompanySelector
              companies={companies}
              selectedCompanyId={selectedCompanyId}
              onSelectCompany={setSelectedCompanyId}
            />

            {/* Step 2: Category Selector */}
            <CategorySelector
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={handleSelectCategory}
            />

            {/* Step 3: Packages Grid & Search */}
            <PackagesGrid
              packages={packages}
              companies={companies}
              categories={categories}
              selectedCompanyId={selectedCompanyId}
              selectedCategoryId={selectedCategoryId}
              currency={settings?.currency || 'جنيه'}
              onSelectPackage={(pkg) => setSelectedPackageForOrder(pkg)}
              onResetFilters={handleResetFilters}
            />

            {/* Value Proposition / Guarantee Banner */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-800/80 shadow-2xl space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/20">
                  لماذا تختار منصتنا؟
                </span>
                <h3 className="text-xl sm:text-3xl font-black text-white">
                  شحن يدوي موثوق وسريع 100%
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  نحن نوفر لك باقات الإنترنت والرصيد بأفضل الأسعار وبدون أي تعقيد، مع متابعة لحظية لطلبك
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-800/80">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm sm:text-base text-white">أمان كامل ومراجعة دقيقة</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      تتم مراجعة الحوالة المالية والشحن على خطك بدقة بواسطة مشرفين معتمدين.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm sm:text-base text-white">تنفيذ فوري خلال دقائق</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      خلال أوقات العمل الرسمية يصلك الشحن على الفور وبدون أي تأخير.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm sm:text-base text-white">دعم متواصل عبر واتساب</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      فريق الدعم جاهز للرد على استفساراتك وتأكيد عملياتك لحظة بلحظة.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact & FAQ Section */}
            <ContactSection settings={settings} />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer settings={settings} onOpenAdmin={handleOpenAdmin} />

      {/* Order Creation Modal */}
      {selectedPackageForOrder && (
        <OrderModal
          pkg={selectedPackageForOrder}
          companies={companies}
          settings={settings}
          onClose={() => setSelectedPackageForOrder(null)}
          onOrderSuccess={handleOrderSubmitted}
        />
      )}

      {/* Order Success Modal */}
      {createdOrder && (
        <OrderSuccessModal
          order={createdOrder}
          settings={settings}
          onClose={() => setCreatedOrder(null)}
          onTrackOrder={handleTrackFromSuccess}
        />
      )}
    </div>
  );
}

export default App;
