import {
  Company,
  Category,
  Package,
  Order,
  OrderStatus,
  SiteSettings,
  DashboardStats,
  MonthlySubscriber,
} from '../types';

const ADMIN_TOKEN_KEY = 'recharge_admin_token';
const CLIENT_STORAGE_KEY = 'recharge_local_clean_v3';

// Rich initial seed dataset for reliable offline/standalone use
const initialFallbackData = {
  settings: {
    site_name: 'شحن تك | منصة شحن الباقات والرصيد',
    site_tagline: 'خدمة شحن باقات الإنترنت والمكالمات والرصيد لجميع الشبكات المصرية',
    logo_text: 'شحن تك ⚡',
    vodafone_cash_number: '01098765432',
    instapay_address: 'shahntech@instapay',
    contact_phone: '01098765432',
    whatsapp_number: '201098765432',
    payment_instructions: `1. قم بتحويل قيمة الطلب إلى رقم فودافون كاش: 01098765432 أو عنوان إنستاباي: shahntech@instapay
2. احتفظ بلقطة شاشة أو إشعار التحويل.
3. اكتب رقم التحويل في الملاحظات أو احتفظ به للضرورة.
4. اضغط على زر "تأكيد وإرسال طلب الشحن".
5. سيتم مراجعة الدفع وتنفيذ الشحن لخطك في دقائق معدودة بإذن الله.`,
    currency: 'جنيه',
    working_hours: 'يومياً من 9:00 صباحاً حتى 1:00 بعد منتصف الليل',
    notice_banner: '⚡ خدمة الشحن اليدوي متاحة الآن - تنفيذ فوري ومتابعة مباشرة!',
    enable_notice: true,
  } as SiteSettings,
  companies: [
    {
      id: 'vodafone',
      name: 'فودافون',
      nameEn: 'Vodafone',
      logo: 'vodafone',
      color: '#E60000',
      accentColor: '#CC0000',
      bgLight: '#FEF2F2',
      borderLight: '#FCA5A5',
      active: true,
      order: 1,
      created_at: new Date('2026-01-01T00:00:00.000Z').toISOString(),
    },
    {
      id: 'orange',
      name: 'أورنج',
      nameEn: 'Orange',
      logo: 'orange',
      color: '#FF7900',
      accentColor: '#E06B00',
      bgLight: '#FFF7ED',
      borderLight: '#FDBA74',
      active: true,
      order: 2,
      created_at: new Date('2026-01-01T00:00:00.000Z').toISOString(),
    },
    {
      id: 'etisalat',
      name: 'اتصالات e&',
      nameEn: 'Etisalat',
      logo: 'etisalat',
      color: '#74AC00',
      accentColor: '#5F8D00',
      bgLight: '#F7FEE7',
      borderLight: '#BEF264',
      active: true,
      order: 3,
      created_at: new Date('2026-01-01T00:00:00.000Z').toISOString(),
    },
    {
      id: 'we',
      name: 'المصرية للاتصالات WE',
      nameEn: 'WE Telecom',
      logo: 'we',
      color: '#562881',
      accentColor: '#451F68',
      bgLight: '#FAF5FF',
      borderLight: '#D8B4FE',
      active: true,
      order: 4,
      created_at: new Date('2026-01-01T00:00:00.000Z').toISOString(),
    },
  ] as Company[],
  categories: [
    {
      id: 'internet',
      company_id: 'all',
      name: 'باقات الإنترنت',
      nameEn: 'Internet Packages',
      icon: 'wifi',
      active: true,
      order: 1,
    },
    {
      id: 'calls',
      company_id: 'all',
      name: 'باقات المكالمات والفليكسات',
      nameEn: 'Calls & Units',
      icon: 'phone-call',
      active: true,
      order: 2,
    },
    {
      id: 'balance',
      company_id: 'all',
      name: 'شحن رصيد مباشر',
      nameEn: 'Direct Balance',
      icon: 'wallet',
      active: true,
      order: 3,
    },
    {
      id: 'special',
      company_id: 'all',
      name: 'باقات إضافية وسوشيال',
      nameEn: 'Add-ons & Social',
      icon: 'sparkles',
      active: true,
      order: 4,
    },
  ] as Category[],
  packages: [
    {
      id: 'vf-net-15',
      company_id: 'vodafone',
      category_id: 'internet',
      name: 'فودافون إكستريم نت 15 جيجا',
      price: 75,
      quota: '15 GB',
      description: 'إنترنت فائق السرعة لجميع المواقع والفيديو وتصفح السوشيال ميديا',
      duration: '30 يوم',
      badge: 'اقتصادي',
      features: ['15,000 ميجابايت إنترنت', 'صالحة لمدة شهر كامل', 'ترحيل المتبقي عند التجديد في الموعد'],
      active: true,
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date('2026-01-01').toISOString(),
    },
    {
      id: 'vf-net-30',
      company_id: 'vodafone',
      category_id: 'internet',
      name: 'فودافون سوبر نت 30 جيجا',
      price: 150,
      quota: '30 GB',
      description: 'باقة ممتازة للاستخدام اليومي ومشاهدة الفيديوهات بجودة عالية',
      duration: '30 يوم',
      badge: 'الأكثر طلباً',
      features: ['30,000 ميجابايت إنترنت 4G', 'صالحة لمدة شهر', 'شحن فوري يدوي'],
      active: true,
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date('2026-01-01').toISOString(),
    },
    {
      id: 'vf-net-40',
      company_id: 'vodafone',
      category_id: 'internet',
      name: 'فودافون بلس 40 جيجا',
      price: 200,
      quota: '40 GB',
      description: '40 جيجابايت لتصفح جميع المواقع ومنصات البث والعمل عن بُعد',
      duration: '30 يوم',
      badge: 'مميز',
      features: ['40 جيجا إنترنت كامل', 'سرعة قصوى بدون تقييد', 'دعم فني ومتابعة للشحن'],
      active: true,
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date('2026-01-01').toISOString(),
    },
    {
      id: 'vf-net-60',
      company_id: 'vodafone',
      category_id: 'internet',
      name: 'فودافون ميجا نت 60 جيجا',
      price: 300,
      quota: '60 GB',
      description: 'باقة المشاهدة والاستخدام الكثيف والتحميل العالي',
      duration: '30 يوم',
      badge: 'أقصى سرعة',
      features: ['60 جيجا صالحة لكل الاستخدامات', 'صالحة 30 يوماً', 'شحن مباشر على الخط'],
      active: true,
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date('2026-01-01').toISOString(),
    },
    {
      id: 'vf-flex-70',
      company_id: 'vodafone',
      category_id: 'calls',
      name: 'فودافون فليكس 70',
      price: 100,
      quota: '3,300 فليكس',
      description: '3300 فليكس للمكالمات والرسائل والإنترنت',
      duration: '30 يوم',
      badge: 'توفير',
      features: ['3300 فليكس شهرياً', 'فليكس = 1 دقيقة لفودافون أو 1 ميجا', 'واتساب مجاني'],
      active: true,
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date('2026-01-01').toISOString(),
    },
    {
      id: 'vf-bal-100',
      company_id: 'vodafone',
      category_id: 'balance',
      name: 'شحن رصيد صافي 100 جنيه',
      price: 145,
      quota: '100 ج.م رصيد صافي',
      description: '100 جنيه رصيد صافي على خط فودافون الخاص بك مباشرة',
      duration: 'دائم',
      badge: 'الأكثر طلباً',
      features: ['100 جنيه رصيد صافي حقيقي', 'بدون أي عمولات خفية', 'تنفيذ يدوي سريع'],
      active: true,
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date('2026-01-01').toISOString(),
    },
    {
      id: 'or-go-25',
      company_id: 'orange',
      category_id: 'internet',
      name: 'أورنج GO نت 25 جيجا',
      price: 120,
      quota: '25 GB',
      description: 'سوبر إنترنت 25 جيجا من أورنج لجميع الاستخدامات',
      duration: '30 يوم',
      badge: 'عرض خاص',
      features: ['25,000 ميجابايت', 'سوشيال وستريمنج', 'صالحة لمدة شهر'],
      active: true,
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date('2026-01-01').toISOString(),
    },
    {
      id: 'or-go-40',
      company_id: 'orange',
      category_id: 'internet',
      name: 'أورنج GO نت 40 جيجا',
      price: 200,
      quota: '40 GB',
      description: '40 جيجابايت للاستخدام القوي والشامل وسرعة 4G+',
      duration: '30 يوم',
      badge: 'الأكثر طلباً',
      features: ['40 جيجا سوبر ميجا', 'بدون أي سرعات مخفضة', 'شحن فوري من لوحة التحكم'],
      active: true,
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date('2026-01-01').toISOString(),
    },
    {
      id: 'et-con-28',
      company_id: 'etisalat',
      category_id: 'internet',
      name: 'اتصالات سوبر كونكت 28 جيجا',
      price: 140,
      quota: '28 GB',
      description: '28 جيجابايت إنترنت سوبر لليوتيوب والسوشيال والتصفح',
      duration: '30 يوم',
      badge: 'الأكثر طلباً',
      features: ['28,000 ميجا إنترنت', 'صالحة شهر كامل', 'ترحيل المتبقي'],
      active: true,
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date('2026-01-01').toISOString(),
    },
    {
      id: 'we-nit-35',
      company_id: 'we',
      category_id: 'internet',
      name: 'وي Nitro نت 35 جيجا',
      price: 165,
      quota: '35 GB',
      description: 'باقة نايترو 35 جيجا من وي بأفضل سعر للميجابايت',
      duration: '30 يوم',
      badge: 'الأكثر طلباً',
      features: ['35,000 ميجا بايت', 'إنترنت 4G عالي الكفاءة', 'شحن يدوي مباشر'],
      active: true,
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date('2026-01-01').toISOString(),
    },
  ] as Package[],
  orders: [] as Order[],
  subscribers: [] as MonthlySubscriber[],
};

// Client localStorage Helper
function getLocalFallbackDb() {
  try {
    const raw = localStorage.getItem(CLIENT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.orders)) {
        parsed.packages = (parsed.packages || initialFallbackData.packages).map((p: any) => {
          const cost = typeof p.cost === 'number' ? p.cost : Math.round((p.price || 0) * 0.85);
          const profit = typeof p.profit === 'number' ? p.profit : ((p.price || 0) - cost);
          return { ...p, cost, profit };
        });
        parsed.orders = (parsed.orders || []).map((o: any) => {
          const package_cost = typeof o.package_cost === 'number' ? o.package_cost : (o.package_price ? Math.round(o.package_price * 0.85) : 0);
          const package_profit = typeof o.package_profit === 'number' ? o.package_profit : ((o.amount || o.package_price || 0) - package_cost);
          return { ...o, package_cost, package_profit };
        });
        if (!Array.isArray(parsed.subscribers)) {
          parsed.subscribers = initialFallbackData.subscribers;
        }
        return parsed;
      }
    }
  } catch (e) {}
  saveLocalFallbackDb(initialFallbackData);
  return initialFallbackData;
}

function saveLocalFallbackDb(data: any) {
  try {
    localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

export const api = {
  // Convenience site batch loader
  async getSiteData(): Promise<{
    companies: Company[];
    categories: Category[];
    packages: Package[];
    settings: SiteSettings;
  }> {
    try {
      const [companies, categories, packages, settings] = await Promise.all([
        this.getCompanies(),
        this.getCategories(),
        this.getPackages(),
        this.getSettings(),
      ]);
      return { companies, categories, packages, settings };
    } catch (e) {
      const local = getLocalFallbackDb();
      return {
        companies: local.companies || initialFallbackData.companies,
        categories: local.categories || initialFallbackData.categories,
        packages: local.packages || initialFallbackData.packages,
        settings: local.settings || initialFallbackData.settings,
      };
    }
  },

  // Public APIs
  async getSettings(): Promise<SiteSettings> {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('فشل جلب إعدادات الموقع');
      return await res.json();
    } catch (e) {
      const local = getLocalFallbackDb();
      return local.settings || initialFallbackData.settings;
    }
  },

  async getCompanies(): Promise<Company[]> {
    try {
      const res = await fetch('/api/companies');
      if (!res.ok) throw new Error('فشل جلب قائمة الشركات');
      return await res.json();
    } catch (e) {
      const local = getLocalFallbackDb();
      return local.companies || initialFallbackData.companies;
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('فشل جلب قائمة الأقسام');
      return await res.json();
    } catch (e) {
      const local = getLocalFallbackDb();
      return local.categories || initialFallbackData.categories;
    }
  },

  async getPackages(companyId?: string, categoryId?: string): Promise<Package[]> {
    try {
      const params = new URLSearchParams();
      if (companyId && companyId !== 'all') params.append('company_id', companyId);
      if (categoryId && categoryId !== 'all') params.append('category_id', categoryId);
      const res = await fetch(`/api/packages?${params.toString()}`);
      if (!res.ok) throw new Error('فشل جلب الباقات');
      return await res.json();
    } catch (e) {
      const local = getLocalFallbackDb();
      let pkgs: Package[] = local.packages || initialFallbackData.packages;
      pkgs = pkgs.filter((p) => p.active);
      if (companyId && companyId !== 'all') pkgs = pkgs.filter((p) => p.company_id === companyId);
      if (categoryId && categoryId !== 'all') pkgs = pkgs.filter((p) => p.category_id === categoryId);
      return pkgs;
    }
  },

  async createOrder(data: {
    customer_name: string;
    phone_number: string;
    contact_phone?: string;
    package_id: string;
    payment_method: 'vodafone_cash' | 'instapay' | 'manual_transfer';
    notes?: string;
  }): Promise<{ success: boolean; message: string; order: Order }> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'فشل إرسال الطلب');
      }
      return result;
    } catch (e: any) {
      // Fallback local order creation if backend isn't reached
      const local = getLocalFallbackDb();
      const pkg = (local.packages || initialFallbackData.packages).find(
        (p: any) => p.id === data.package_id
      );
      const comp = (local.companies || initialFallbackData.companies).find(
        (c: any) => c.id === pkg?.company_id
      );
      const cat = (local.categories || initialFallbackData.categories).find(
        (c: any) => c.id === pkg?.category_id
      );

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randNum = Math.floor(100 + Math.random() * 900);
      const orderNumber = `ORD-${dateStr}-${randNum}`;

      const pkgCost = typeof pkg?.cost === 'number' ? pkg.cost : Math.round((pkg?.price || 100) * 0.85);
      const pkgProfit = typeof pkg?.profit === 'number' ? pkg.profit : ((pkg?.price || 100) - pkgCost);

      const newOrder: Order = {
        id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        order_number: orderNumber,
        customer_name: data.customer_name.trim(),
        phone_number: data.phone_number.trim(),
        contact_phone: data.contact_phone ? data.contact_phone.trim() : undefined,
        package_id: data.package_id,
        package_name: pkg?.name || 'باقة مختارة',
        package_price: pkg?.price || 100,
        package_cost: pkgCost,
        package_profit: pkgProfit,
        package_quota: pkg?.quota || '',
        package_duration: pkg?.duration || '30 يوم',
        company_id: pkg?.company_id || 'vodafone',
        company_name: comp?.name || pkg?.company_id || 'فودافون',
        category_id: pkg?.category_id || 'internet',
        category_name: cat?.name || 'باقات الإنترنت',
        payment_method: data.payment_method,
        amount: pkg?.price || 100,
        notes: data.notes?.trim() || undefined,
        status: 'new',
        status_history: [
          {
            status: 'new',
            timestamp: new Date().toISOString(),
            note: 'تم تسجيل طلب الشحن بنجاح في انتظار مراجعة الدفع',
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      local.orders = local.orders || [];
      local.orders.unshift(newOrder);
      saveLocalFallbackDb(local);

      return {
        success: true,
        message: 'تم استلام طلبك بنجاح، وسيتم مراجعة الدفع وتنفيذ الشحن يدويًا.',
        order: newOrder,
      };
    }
  },

  async trackOrder(orderNumber: string): Promise<Order> {
    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(orderNumber.trim())}`);
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'لم يتم العثور على الطلب');
      }
      return result;
    } catch (e: any) {
      const local = getLocalFallbackDb();
      const cleanInput = orderNumber.trim().toUpperCase();
      const found = (local.orders || initialFallbackData.orders).find(
        (o: Order) =>
          o.order_number.toUpperCase() === cleanInput ||
          o.phone_number === orderNumber.trim() ||
          o.id === orderNumber.trim()
      );
      if (!found) {
        throw new Error(
          `لم يتم العثور على طلب برقم "${orderNumber}". يرجى التأكد من الرقم والمحاولة مرة أخرى.`
        );
      }
      return found;
    }
  },

  // Admin Auth APIs
  getAdminToken(): string | null {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },

  getStoredAdminToken(): string | null {
    return this.getAdminToken();
  },

  setAdminToken(token: string) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  },

  removeAdminToken() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },

  logoutAdmin() {
    this.removeAdminToken();
  },

  async adminLogin(email: string, password: string): Promise<{ token: string; admin: any }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'بيانات الدخول غير صحيحة');
    }
    this.setAdminToken(result.token);
    return result;
  },

  async getAdminMe(): Promise<{ admin: any }> {
    const token = this.getAdminToken();
    if (!token) throw new Error('لا يوجد جلسة مسجلة');

    const res = await fetch('/api/admin/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      this.removeAdminToken();
      throw new Error('جلسة منتهية، يرجى إعادة تسجيل الدخول');
    }
    return await res.json();
  },

  async changeAdminPassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const token = this.getAdminToken();
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'فشل تغيير كلمة المرور');
      }
      return result;
    } catch (e: any) {
      return { success: true, message: 'تم تغيير كلمة المرور بنجاح (محلياً)' };
    }
  },

  // Admin Stats
  async getAdminStats(period: 'all' | 'today' | '7days' | '30days' = 'all'): Promise<DashboardStats> {
    const token = this.getAdminToken();
    try {
      const res = await fetch(`/api/admin/stats?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('فشل جلب الإحصائيات');
      const raw = await res.json();
      return {
        totalOrders: Number(raw.totalOrders || 0),
        newOrders: Number(raw.newOrders || 0),
        pendingPaymentOrders: Number(raw.pendingPaymentOrders || 0),
        processingOrders: Number(raw.processingOrders || 0),
        rechargedOrders: Number(raw.rechargedOrders || 0),
        completedOrders: Number(raw.completedOrders || 0),
        cancelledOrders: Number(raw.cancelledOrders || 0),
        totalSales: Number(raw.totalSales ?? raw.totalRevenue ?? 0),
        totalCost: Number(raw.totalCost ?? 0),
        totalProfit: Number(raw.totalProfit ?? raw.netProfit ?? 0),
        profitMargin: Number(raw.profitMargin ?? 0),
        uniqueCustomers: Number(raw.uniqueCustomers ?? 0),
        todayOrders: Number(raw.todayOrders ?? 0),
        todaySales: Number(raw.todaySales ?? 0),
        todayCost: Number(raw.todayCost ?? 0),
        todayProfit: Number(raw.todayProfit ?? 0),
        dueRenewalsCount: Number(raw.dueRenewalsCount ?? 0),
        recentOrders: Array.isArray(raw.recentOrders) ? raw.recentOrders : [],
        companyBreakdown: Array.isArray(raw.companyBreakdown) ? raw.companyBreakdown : [],
        topPackages: Array.isArray(raw.topPackages) ? raw.topPackages : [],
      };
    } catch (e) {
      const local = getLocalFallbackDb();
      const allOrders: Order[] = local.orders || initialFallbackData.orders;
      const companies: Company[] = local.companies || initialFallbackData.companies;
      const now = new Date();

      // Period filtering
      let periodOrders = [...allOrders];
      if (period === 'today') {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        periodOrders = periodOrders.filter((o) => new Date(o.created_at).getTime() >= todayStart);
      } else if (period === '7days') {
        const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
        periodOrders = periodOrders.filter((o) => new Date(o.created_at).getTime() >= sevenDaysAgo);
      } else if (period === '30days') {
        const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
        periodOrders = periodOrders.filter((o) => new Date(o.created_at).getTime() >= thirtyDaysAgo);
      }

      const totalOrders = periodOrders.length;
      const newOrders = periodOrders.filter((o) => o.status === 'new').length;
      const pendingPaymentOrders = periodOrders.filter((o) => o.status === 'pending_payment').length;
      const processingOrders = periodOrders.filter((o) => o.status === 'processing' || o.status === 'payment_confirmed').length;
      const rechargedOrders = periodOrders.filter((o) => o.status === 'recharged').length;
      const completedOrders = periodOrders.filter((o) => o.status === 'completed').length;
      const cancelledOrders = periodOrders.filter((o) => o.status === 'cancelled').length;

      const isCompleted = (status: string) => status === 'completed' || status === 'recharged' || status === 'payment_confirmed';

      const validSalesOrders = periodOrders.filter((o) => isCompleted(o.status));
      const totalSales = validSalesOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
      const totalCost = validSalesOrders.reduce((sum, o) => {
        const cost = typeof o.package_cost === 'number' ? o.package_cost : (o.package_price ? Math.round(o.package_price * 0.85) : 0);
        return sum + cost;
      }, 0);
      const totalProfit = validSalesOrders.reduce((sum, o) => {
        const profit = typeof o.package_profit === 'number' ? o.package_profit : ((o.amount || o.package_price || 0) - (o.package_cost || Math.round((o.package_price || 0) * 0.85)));
        return sum + profit;
      }, 0);
      const profitMargin = totalSales > 0 ? Number(((totalProfit / totalSales) * 100).toFixed(1)) : 0;

      const uniqueCustomers = new Set(validSalesOrders.map((o) => o.phone_number)).size;

      // Today stats calculation
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const todayList = allOrders.filter((o) => new Date(o.created_at).getTime() >= todayStart);
      const todayOrders = todayList.length;
      const validTodayList = todayList.filter((o) => isCompleted(o.status));
      const todaySales = validTodayList.reduce((sum, o) => sum + (o.amount || 0), 0);
      const todayCost = validTodayList.reduce((sum, o) => {
        const cost = typeof o.package_cost === 'number' ? o.package_cost : (o.package_price ? Math.round(o.package_price * 0.85) : 0);
        return sum + cost;
      }, 0);
      const todayProfit = validTodayList.reduce((sum, o) => {
        const profit = typeof o.package_profit === 'number' ? o.package_profit : ((o.amount || o.package_price || 0) - (o.package_cost || Math.round((o.package_price || 0) * 0.85)));
        return sum + profit;
      }, 0);

      // Company Breakdown
      const companyMap: Record<string, { count: number; sales: number; cost: number; profit: number; name: string }> = {};
      for (const comp of companies) {
        companyMap[comp.id] = { count: 0, sales: 0, cost: 0, profit: 0, name: comp.name };
      }
      for (const ord of validSalesOrders) {
        if (!companyMap[ord.company_id]) {
          companyMap[ord.company_id] = { count: 0, sales: 0, cost: 0, profit: 0, name: ord.company_name || ord.company_id };
        }
        const cost = typeof ord.package_cost === 'number' ? ord.package_cost : (ord.package_price ? Math.round(ord.package_price * 0.85) : 0);
        const profit = typeof ord.package_profit === 'number' ? ord.package_profit : ((ord.amount || ord.package_price || 0) - cost);

        companyMap[ord.company_id].count += 1;
        companyMap[ord.company_id].sales += ord.amount || 0;
        companyMap[ord.company_id].cost += cost;
        companyMap[ord.company_id].profit += profit;
      }

      const companyBreakdown = Object.entries(companyMap).map(([companyId, data]) => ({
        companyId,
        companyName: data.name,
        count: data.count,
        sales: data.sales,
        cost: data.cost,
        profit: data.profit,
      }));

      // Top Packages Breakdown
      const pkgStatsMap: Record<string, { packageId: string; packageName: string; companyId: string; count: number; totalSales: number; totalCost: number; totalProfit: number }> = {};
      for (const ord of validSalesOrders) {
        const pid = ord.package_id || ord.package_name;
        if (!pkgStatsMap[pid]) {
          pkgStatsMap[pid] = {
            packageId: ord.package_id,
            packageName: ord.package_name,
            companyId: ord.company_id,
            count: 0,
            totalSales: 0,
            totalCost: 0,
            totalProfit: 0,
          };
        }
        const cost = typeof ord.package_cost === 'number' ? ord.package_cost : (ord.package_price ? Math.round(ord.package_price * 0.85) : 0);
        const profit = typeof ord.package_profit === 'number' ? ord.package_profit : ((ord.amount || ord.package_price || 0) - cost);

        pkgStatsMap[pid].count += 1;
        pkgStatsMap[pid].totalSales += ord.amount || 0;
        pkgStatsMap[pid].totalCost += cost;
        pkgStatsMap[pid].totalProfit += profit;
      }

      const topPackages = Object.values(pkgStatsMap)
        .sort((a, b) => b.totalProfit - a.totalProfit)
        .slice(0, 5);

      // Sort recent orders newest first
      const sortedRecent = [...allOrders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return {
        totalOrders,
        newOrders,
        pendingPaymentOrders,
        processingOrders,
        rechargedOrders,
        completedOrders,
        cancelledOrders,
        totalSales,
        totalCost,
        totalProfit,
        profitMargin,
        uniqueCustomers,
        todayOrders,
        todaySales,
        todayCost,
        todayProfit,
        recentOrders: sortedRecent.slice(0, 10),
        companyBreakdown,
        topPackages,
      };
    }
  },

  // Admin Orders
  async getAdminOrders(filters?: { status?: string; company_id?: string; search?: string }): Promise<Order[]> {
    const token = this.getAdminToken();
    try {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.company_id && filters.company_id !== 'all') params.append('company_id', filters.company_id);
      if (filters?.search) params.append('search', filters.search);

      const res = await fetch(`/api/admin/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('فشل جلب الطلبات');
      return await res.json();
    } catch (e) {
      const local = getLocalFallbackDb();
      let list: Order[] = [...(local.orders || initialFallbackData.orders)];

      // Status filter
      if (filters?.status && filters.status !== 'all') {
        list = list.filter((o) => o.status === filters.status);
      }

      // Company filter
      if (filters?.company_id && filters.company_id !== 'all') {
        list = list.filter((o) => o.company_id === filters.company_id);
      }

      // Search filter
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        list = list.filter(
          (o) =>
            o.order_number.toLowerCase().includes(q) ||
            o.customer_name.toLowerCase().includes(q) ||
            o.phone_number.includes(q) ||
            (o.contact_phone && o.contact_phone.includes(q)) ||
            (o.package_name && o.package_name.toLowerCase().includes(q))
        );
      }

      // Sort newest first
      return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    note?: string
  ): Promise<{ success: boolean; order: Order }> {
    const token = this.getAdminToken();
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, note }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'فشل تحديث حالة الطلب');
      return result;
    } catch (e) {
      const local = getLocalFallbackDb();
      const order = (local.orders || []).find((o: Order) => o.id === orderId || o.order_number === orderId);
      if (order) {
        const now = new Date().toISOString();
        order.status = status;
        order.updated_at = now;
        order.status_history = order.status_history || [];

        const statusNoteMap: Record<OrderStatus, string> = {
          new: 'تم إنشاء الطلب وبانتظار المراجعة',
          pending_payment: 'في انتظار استلام وتحقق تحويل المبلغ',
          payment_confirmed: 'تم تأكيد استلام الدفع بنجاح',
          processing: 'جاري تنفيذ الشحن اليدوي على خطك الآن',
          recharged: 'تم تنفيذ الشحن بنجاح على الشريحة',
          completed: 'تم اكتمال طلب الشحن بنجاح',
          cancelled: 'تم إلغاء الطلب',
        };

        order.status_history.push({
          status,
          timestamp: now,
          note: note || statusNoteMap[status] || `تم تغيير الحالة إلى ${status}`,
        });

        saveLocalFallbackDb(local);
        return { success: true, order };
      }
      throw new Error('الطلب غير موجود');
    }
  },

  async updateOrderNotes(orderId: string, notes: string): Promise<{ success: boolean; order: Order }> {
    const token = this.getAdminToken();
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/notes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'فشل تحديث الملاحظات');
      return result;
    } catch (e) {
      const local = getLocalFallbackDb();
      const order = (local.orders || []).find((o: Order) => o.id === orderId);
      if (order) {
        order.admin_notes = notes;
        order.updated_at = new Date().toISOString();
        saveLocalFallbackDb(local);
        return { success: true, order };
      }
      throw new Error('الطلب غير موجود');
    }
  },

  async deleteOrder(orderId: string): Promise<boolean> {
    const token = this.getAdminToken();
    const cleanId = String(orderId).trim();
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(cleanId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      // Also update local fallback store
      const local = getLocalFallbackDb();
      local.orders = (local.orders || []).filter(
        (o: Order) => o.id !== cleanId && o.order_number !== cleanId
      );
      saveLocalFallbackDb(local);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'فشل حذف الطلب');
      }
      return true;
    } catch (e: any) {
      const local = getLocalFallbackDb();
      local.orders = (local.orders || []).filter(
        (o: Order) => o.id !== cleanId && o.order_number !== cleanId
      );
      saveLocalFallbackDb(local);
      return true;
    }
  },

  // Admin Packages
  async getAdminPackages(companyId?: string, categoryId?: string): Promise<Package[]> {
    const token = this.getAdminToken();
    try {
      const params = new URLSearchParams();
      if (companyId && companyId !== 'all') params.append('company_id', companyId);
      if (categoryId && categoryId !== 'all') params.append('category_id', categoryId);

      const res = await fetch(`/api/admin/packages?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('فشل جلب الباقات');
      return await res.json();
    } catch (e) {
      const local = getLocalFallbackDb();
      let pkgs: Package[] = [...(local.packages || initialFallbackData.packages)];
      if (companyId && companyId !== 'all') pkgs = pkgs.filter((p) => p.company_id === companyId);
      if (categoryId && categoryId !== 'all') pkgs = pkgs.filter((p) => p.category_id === categoryId);
      return pkgs;
    }
  },

  async createPackage(pkgData: Partial<Package>): Promise<Package> {
    const token = this.getAdminToken();
    try {
      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pkgData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'فشل إضافة الباقة');
      return result.package;
    } catch (e) {
      const local = getLocalFallbackDb();
      const price = pkgData.price || 0;
      const cost = typeof pkgData.cost === 'number' ? pkgData.cost : Math.round(price * 0.85);
      const profit = typeof pkgData.profit === 'number' ? pkgData.profit : (price - cost);

      const newPkg: Package = {
        id: `pkg-${Date.now()}`,
        name: pkgData.name || '',
        company_id: pkgData.company_id || 'vodafone',
        category_id: pkgData.category_id || 'internet',
        price,
        cost,
        profit,
        quota: pkgData.quota || '',
        description: pkgData.description || '',
        duration: pkgData.duration || '30 يوم',
        badge: pkgData.badge,
        features: pkgData.features || [],
        active: pkgData.active !== undefined ? pkgData.active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      local.packages = local.packages || [];
      local.packages.push(newPkg);
      saveLocalFallbackDb(local);
      return newPkg;
    }
  },

  async updatePackage(id: string, pkgData: Partial<Package>): Promise<Package> {
    const token = this.getAdminToken();
    try {
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pkgData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'فشل تعديل الباقة');
      return result.package;
    } catch (e) {
      const local = getLocalFallbackDb();
      const idx = (local.packages || []).findIndex((p: Package) => p.id === id);
      if (idx !== -1) {
        const cur = local.packages[idx];
        const newPrice = pkgData.price !== undefined ? pkgData.price : cur.price;
        let newCost = pkgData.cost !== undefined ? pkgData.cost : (cur.cost !== undefined ? cur.cost : Math.round(newPrice * 0.85));
        let newProfit = pkgData.profit !== undefined ? pkgData.profit : (cur.profit !== undefined ? cur.profit : (newPrice - newCost));
        if (pkgData.cost !== undefined && pkgData.profit === undefined) {
          newProfit = newPrice - newCost;
        } else if (pkgData.profit !== undefined && pkgData.cost === undefined) {
          newCost = newPrice - newProfit;
        }
        local.packages[idx] = {
          ...cur,
          ...pkgData,
          price: newPrice,
          cost: newCost,
          profit: newProfit,
          updated_at: new Date().toISOString(),
        };
        saveLocalFallbackDb(local);
        return local.packages[idx];
      }
      throw new Error('الباقة غير موجودة');
    }
  },

  async togglePackage(id: string): Promise<Package> {
    const token = this.getAdminToken();
    try {
      const res = await fetch(`/api/admin/packages/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'فشل تغيير حالة الباقة');
      return result.package;
    } catch (e) {
      const local = getLocalFallbackDb();
      const pkg = (local.packages || []).find((p: Package) => p.id === id);
      if (pkg) {
        pkg.active = !pkg.active;
        saveLocalFallbackDb(local);
        return pkg;
      }
      throw new Error('الباقة غير موجودة');
    }
  },

  async deletePackage(id: string): Promise<boolean> {
    const token = this.getAdminToken();
    try {
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('فشل حذف الباقة');
      return true;
    } catch (e) {
      const local = getLocalFallbackDb();
      local.packages = (local.packages || []).filter((p: Package) => p.id !== id);
      saveLocalFallbackDb(local);
      return true;
    }
  },

  // Admin Companies & Categories
  async getAdminCompanies(): Promise<Company[]> {
    const token = this.getAdminToken();
    try {
      const res = await fetch('/api/admin/companies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('فشل جلب الشركات');
      return await res.json();
    } catch (e) {
      const local = getLocalFallbackDb();
      return local.companies || initialFallbackData.companies;
    }
  },

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company> {
    const token = this.getAdminToken();
    try {
      const res = await fetch(`/api/admin/companies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'فشل تحديث الشركة');
      return result.company;
    } catch (e) {
      const local = getLocalFallbackDb();
      const idx = (local.companies || []).findIndex((c: Company) => c.id === id);
      if (idx !== -1) {
        local.companies[idx] = { ...local.companies[idx], ...updates };
        saveLocalFallbackDb(local);
        return local.companies[idx];
      }
      throw new Error('الشركة غير موجودة');
    }
  },

  async getAdminCategories(): Promise<Category[]> {
    const token = this.getAdminToken();
    try {
      const res = await fetch('/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('فشل جلب الأقسام');
      return await res.json();
    } catch (e) {
      const local = getLocalFallbackDb();
      return local.categories || initialFallbackData.categories;
    }
  },

  async createCategory(catData: Partial<Category>): Promise<Category> {
    const token = this.getAdminToken();
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(catData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'فشل إضافة القسم');
      return result.category;
    } catch (e) {
      const local = getLocalFallbackDb();
      const newCat: Category = {
        id: catData.id || `cat-${Date.now()}`,
        company_id: 'all',
        name: catData.name || '',
        icon: catData.icon || 'tag',
        active: catData.active !== undefined ? catData.active : true,
        order: catData.order || 10,
      };
      local.categories = local.categories || [];
      local.categories.push(newCat);
      saveLocalFallbackDb(local);
      return newCat;
    }
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const token = this.getAdminToken();
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'فشل تعديل القسم');
      return result.category;
    } catch (e) {
      const local = getLocalFallbackDb();
      const idx = (local.categories || []).findIndex((c: Category) => c.id === id);
      if (idx !== -1) {
        local.categories[idx] = { ...local.categories[idx], ...updates };
        saveLocalFallbackDb(local);
        return local.categories[idx];
      }
      throw new Error('القسم غير موجود');
    }
  },

  async deleteCategory(id: string): Promise<boolean> {
    const token = this.getAdminToken();
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('فشل حذف القسم');
      return true;
    } catch (e) {
      const local = getLocalFallbackDb();
      local.categories = (local.categories || []).filter((c: Category) => c.id !== id);
      saveLocalFallbackDb(local);
      return true;
    }
  },

  // Admin Settings
  async getAdminSettings(): Promise<SiteSettings> {
    const token = this.getAdminToken();
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('فشل جلب الإعدادات');
      return await res.json();
    } catch (e) {
      const local = getLocalFallbackDb();
      return local.settings || initialFallbackData.settings;
    }
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    return this.updateAdminSettings(settings);
  },

  async updateAdminSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const token = this.getAdminToken();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'فشل تحديث الإعدادات');
      return result.settings;
    } catch (e) {
      const local = getLocalFallbackDb();
      local.settings = { ...local.settings, ...settings };
      saveLocalFallbackDb(local);
      return local.settings;
    }
  },

  // ==========================================
  // Monthly Subscribers (عملاء الشحن الشهري)
  // ==========================================
  async getSubscribers(filters?: { company_id?: string; onlyDue?: boolean; activeOnly?: boolean; search?: string }): Promise<MonthlySubscriber[]> {
    const token = this.getAdminToken();
    const query = new URLSearchParams();
    if (filters?.company_id && filters.company_id !== 'all') query.append('company_id', filters.company_id);
    if (filters?.onlyDue) query.append('onlyDue', 'true');
    if (filters?.activeOnly) query.append('activeOnly', 'true');
    if (filters?.search) query.append('search', filters.search);

    try {
      const res = await fetch(`/api/admin/subscribers?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('فشل جلب قائمة المشتركين');
      return await res.json();
    } catch (e) {
      const local = getLocalFallbackDb();
      let list = (local.subscribers || []) as MonthlySubscriber[];
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      if (filters?.company_id && filters.company_id !== 'all') {
        list = list.filter((s) => s.company_id === filters.company_id);
      }
      if (filters?.onlyDue) {
        list = list.filter((s) => s.active && s.next_renewal_date <= todayStr);
      }
      if (filters?.activeOnly) {
        list = list.filter((s) => s.active);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        list = list.filter((s) => s.customer_name.toLowerCase().includes(q) || s.phone_number.includes(q));
      }
      return list;
    }
  },

  async createSubscriber(data: Omit<MonthlySubscriber, 'id' | 'created_at' | 'updated_at'>): Promise<MonthlySubscriber> {
    const token = this.getAdminToken();
    try {
      const res = await fetch('/api/admin/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'فشل إضافة المشترك');
      return result.subscriber;
    } catch (e: any) {
      const local = getLocalFallbackDb();
      const id = `sub_${Date.now()}`;
      const newSub: MonthlySubscriber = {
        id,
        ...data,
        active: data.active !== undefined ? data.active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (!local.subscribers) local.subscribers = [];
      local.subscribers.unshift(newSub);
      saveLocalFallbackDb(local);
      return newSub;
    }
  },

  async updateSubscriber(id: string, updates: Partial<MonthlySubscriber>): Promise<MonthlySubscriber> {
    const token = this.getAdminToken();
    try {
      const res = await fetch(`/api/admin/subscribers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'فشل تعديل بيانات المشترك');
      return result.subscriber;
    } catch (e: any) {
      const local = getLocalFallbackDb();
      const idx = (local.subscribers || []).findIndex((s: MonthlySubscriber) => s.id === id);
      if (idx !== -1) {
        local.subscribers[idx] = { ...local.subscribers[idx], ...updates, updated_at: new Date().toISOString() };
        saveLocalFallbackDb(local);
        return local.subscribers[idx];
      }
      throw new Error('العميل غير موجود');
    }
  },

  async renewSubscriber(id: string, options?: { payment_method?: 'vodafone_cash' | 'instapay' | 'manual_transfer'; admin_notes?: string }): Promise<{ subscriber: MonthlySubscriber; order: Order }> {
    const token = this.getAdminToken();
    try {
      const res = await fetch(`/api/admin/subscribers/${id}/renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(options || {}),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'فشل تنفيذ عملية تجديد الشحن');
      return { subscriber: result.subscriber, order: result.order };
    } catch (e: any) {
      const local = getLocalFallbackDb();
      const subIdx = (local.subscribers || []).findIndex((s: MonthlySubscriber) => s.id === id);
      if (subIdx !== -1) {
        const sub = local.subscribers[subIdx];
        const now = new Date();
        const curNext = new Date(sub.next_renewal_date || now.toISOString());
        let nextMonth = curNext.getMonth() + 1;
        let nextYear = curNext.getFullYear();
        if (nextMonth > 11) {
          nextMonth = 0;
          nextYear += 1;
        }
        const day = sub.renewal_day || curNext.getDate() || 1;
        const maxDaysInNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
        const finalDay = Math.min(day, maxDaysInNextMonth);
        const newNextDateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(finalDay).padStart(2, '0')}`;

        local.subscribers[subIdx] = {
          ...sub,
          last_recharge_date: now.toISOString(),
          next_renewal_date: newNextDateStr,
          updated_at: now.toISOString(),
        };

        const newOrder: Order = {
          id: `ord-${Date.now()}`,
          order_number: `ORD-${Date.now().toString().slice(-6)}`,
          customer_name: sub.customer_name,
          phone_number: sub.phone_number,
          contact_phone: sub.contact_phone || sub.phone_number,
          package_id: sub.package_id || 'custom-monthly',
          package_name: sub.package_name,
          package_price: sub.package_price,
          package_cost: sub.package_cost || Math.round(sub.package_price * 0.85),
          package_profit: sub.package_profit || Math.round(sub.package_price * 0.15),
          company_id: sub.company_id,
          company_name: sub.company_name || sub.company_id,
          payment_method: options?.payment_method || 'vodafone_cash',
          amount: sub.package_price,
          notes: `تجديد شهري دوري للعميل (${sub.customer_name})`,
          admin_notes: options?.admin_notes || 'تم شحن وتجديد الباقة الشهرية بنجاح للعميل',
          status: 'completed',
          status_history: [
            {
              status: 'completed',
              timestamp: now.toISOString(),
              note: options?.admin_notes || 'تم شحن وتجديد الباقة الشهرية بنجاح للعميل',
            },
          ],
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        };
        if (!local.orders) local.orders = [];
        local.orders.unshift(newOrder);
        saveLocalFallbackDb(local);
        return { subscriber: local.subscribers[subIdx], order: newOrder };
      }
      throw e;
    }
  },

  async deleteSubscriber(id: string): Promise<boolean> {
    const token = this.getAdminToken();
    try {
      const res = await fetch(`/api/admin/subscribers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('فشل حذف المشترك');
      return true;
    } catch (e) {
      const local = getLocalFallbackDb();
      local.subscribers = (local.subscribers || []).filter((s: MonthlySubscriber) => s.id !== id);
      saveLocalFallbackDb(local);
      return true;
    }
  },

  // ------------------------------------------
  // Data Management & Clearing
  // ------------------------------------------

  async getDataCounts(): Promise<{
    ordersCount: number;
    subscribersCount: number;
    packagesCount: number;
    companiesCount: number;
  }> {
    const token = this.getAdminToken();
    try {
      const res = await fetch('/api/admin/data/counts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const local = getLocalFallbackDb();
    return {
      ordersCount: (local.orders || []).length,
      subscribersCount: (local.subscribers || []).length,
      packagesCount: (local.packages || []).length,
      companiesCount: (local.companies || []).length,
    };
  },

  async clearAllOrders(): Promise<{ count: number }> {
    const token = this.getAdminToken();
    try {
      const res = await fetch('/api/admin/data/clear-orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Also sync local
        const local = getLocalFallbackDb();
        local.orders = [];
        saveLocalFallbackDb(local);
        return data;
      }
    } catch (e) {}

    const local = getLocalFallbackDb();
    const count = (local.orders || []).length;
    local.orders = [];
    saveLocalFallbackDb(local);
    return { count };
  },

  async clearAllSubscribers(): Promise<{ count: number }> {
    const token = this.getAdminToken();
    try {
      const res = await fetch('/api/admin/data/clear-subscribers', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Also sync local
        const local = getLocalFallbackDb();
        local.subscribers = [];
        saveLocalFallbackDb(local);
        return data;
      }
    } catch (e) {}

    const local = getLocalFallbackDb();
    const count = (local.subscribers || []).length;
    local.subscribers = [];
    saveLocalFallbackDb(local);
    return { count };
  },

  async clearAllPackages(): Promise<{ count: number }> {
    const token = this.getAdminToken();
    try {
      const res = await fetch('/api/admin/data/clear-packages', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const local = getLocalFallbackDb();
        local.packages = [];
        saveLocalFallbackDb(local);
        return data;
      }
    } catch (e) {}

    const local = getLocalFallbackDb();
    const count = (local.packages || []).length;
    local.packages = [];
    saveLocalFallbackDb(local);
    return { count };
  },

  async restoreDefaultPackages(): Promise<{ count: number }> {
    const token = this.getAdminToken();
    try {
      const res = await fetch('/api/admin/data/restore-packages', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const local = getLocalFallbackDb();
        local.packages = initialFallbackData.packages;
        saveLocalFallbackDb(local);
        return data;
      }
    } catch (e) {}

    const local = getLocalFallbackDb();
    local.packages = initialFallbackData.packages;
    saveLocalFallbackDb(local);
    return { count: local.packages.length };
  },

  async clearAllData(includePackages: boolean = false): Promise<{
    ordersDeleted: number;
    subscribersDeleted: number;
    packagesDeleted: number;
  }> {
    const token = this.getAdminToken();
    try {
      const res = await fetch('/api/admin/data/clear-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ includePackages }),
      });
      if (res.ok) {
        const data = await res.json();
        const local = getLocalFallbackDb();
        local.orders = [];
        local.subscribers = [];
        if (includePackages) local.packages = [];
        saveLocalFallbackDb(local);
        return data;
      }
    } catch (e) {}

    const local = getLocalFallbackDb();
    const ordersDeleted = (local.orders || []).length;
    const subscribersDeleted = (local.subscribers || []).length;
    let packagesDeleted = 0;
    local.orders = [];
    local.subscribers = [];
    if (includePackages) {
      packagesDeleted = (local.packages || []).length;
      local.packages = [];
    }
    saveLocalFallbackDb(local);
    return { ordersDeleted, subscribersDeleted, packagesDeleted };
  },
};
