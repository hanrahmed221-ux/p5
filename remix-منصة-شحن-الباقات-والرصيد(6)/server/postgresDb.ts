import crypto from 'crypto';
import { eq, desc, asc, like, and, or, sql } from 'drizzle-orm';
import { db } from '../src/db/index.ts';
import * as schema from '../src/db/schema.ts';
import { Company, Category, Package, Order, MonthlySubscriber, SiteSettings, Admin, OrderStatus } from '../src/types.ts';

const DEFAULT_SALT = process.env.PASSWORD_SALT || 'shahn_secure_salt_prod_2026_9837a';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + DEFAULT_SALT).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  try {
    const computed = hashPassword(password);
    const bufA = Buffer.from(computed, 'utf-8');
    const bufB = Buffer.from(hash, 'utf-8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// Default Seed Data
const DEFAULT_ADMIN = {
  id: 'admin_1',
  name: 'مدير المنصة',
  email: 'admin@recharge.com',
  password_hash: hashPassword('admin123'),
  created_at: new Date('2026-01-01T00:00:00.000Z').toISOString(),
};

const DEFAULT_SETTINGS: SiteSettings = {
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
  show_notice_banner: true,
};

const DEFAULT_COMPANIES: Company[] = [
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
];

const DEFAULT_CATEGORIES: Category[] = [
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
];

const DEFAULT_PACKAGES: Package[] = [
  // Vodafone
  {
    id: 'vf-net-15',
    company_id: 'vodafone',
    category_id: 'internet',
    name: 'فودافون إكستريم نت 15 جيجا',
    price: 75,
    cost: 60,
    profit: 15,
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
    cost: 120,
    profit: 30,
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
    cost: 160,
    profit: 40,
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
    cost: 240,
    profit: 60,
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
    cost: 80,
    profit: 20,
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
    id: 'vf-flex-100',
    company_id: 'vodafone',
    category_id: 'calls',
    name: 'فودافون فليكس 100',
    price: 145,
    cost: 116,
    profit: 29,
    quota: '5,500 فليكس',
    description: '5500 فليكس للمكالمات والإنترنت مع باقة مميزة',
    duration: '30 يوم',
    badge: 'الأكثر شعبية',
    features: ['5500 فليكس شهرياً', 'دخول لتطبيقات ترفيهية', 'ترحيل الفليكسات المتبقية'],
    active: true,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'vf-bal-50',
    company_id: 'vodafone',
    category_id: 'balance',
    name: 'شحن رصيد صافي 50 جنيه',
    price: 72,
    cost: 58,
    profit: 14,
    quota: '50 ج.م رصيد صافي',
    description: 'شحن رصيد صافي يصل لمحفظتك أو خطك بقيمة 50 جنيه مصري',
    duration: 'دائم',
    features: ['50 جنيه رصيد صافي بالخط', 'شحن فوري بالتحويل', 'يصلح لكافة الخدمات'],
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
    cost: 116,
    profit: 29,
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
    id: 'vf-bal-200',
    company_id: 'vodafone',
    category_id: 'balance',
    name: 'شحن رصيد صافي 200 جنيه',
    price: 290,
    cost: 232,
    profit: 58,
    quota: '200 ج.م رصيد صافي',
    description: '200 جنيه رصيد صافي على خط فودافون',
    duration: 'دائم',
    features: ['200 جنيه رصيد صافي', 'تحويل رصيد رسمي', 'تأكيد بالرسائل النصية'],
    active: true,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },

  // Orange
  {
    id: 'or-go-10',
    company_id: 'orange',
    category_id: 'internet',
    name: 'أورنج GO نت 10 جيجا',
    price: 60,
    cost: 48,
    profit: 12,
    quota: '10 GB',
    description: 'باقة أورنج جو سوبر إنترنت للموبايل والسوشيال ميديا',
    duration: '30 يوم',
    features: ['10,000 سوبر ميجابايتس', 'صالحة 30 يوم', 'تصفح سريع'],
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
    cost: 96,
    profit: 24,
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
    cost: 160,
    profit: 40,
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
    id: 'or-bal-100',
    company_id: 'orange',
    category_id: 'balance',
    name: 'شحن رصيد صافي أورنج 100 جنيه',
    price: 145,
    cost: 116,
    profit: 29,
    quota: '100 ج.م رصيد صافي',
    description: '100 جنيه رصيد صافي يصل خط أورنج فوراً',
    duration: 'دائم',
    features: ['100 جنيه رصيد صافي', 'تحويل رسمي', 'تنفيذ يدوي موثوق'],
    active: true,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },

  // Etisalat
  {
    id: 'et-con-12',
    company_id: 'etisalat',
    category_id: 'internet',
    name: 'اتصالات سوبر كونكت 12 جيجا',
    price: 70,
    cost: 56,
    profit: 14,
    quota: '12 GB',
    description: 'باقة سوبر كونكت للإنترنت عالي السرعة من اتصالات مصر',
    duration: '30 يوم',
    features: ['12,000 ميجابايت', 'صالحة 30 يوم', 'شحن مباشر على الخط'],
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
    cost: 112,
    profit: 28,
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
    id: 'et-con-45',
    company_id: 'etisalat',
    category_id: 'internet',
    name: 'اتصالات سوبر كونكت 45 جيجا',
    price: 220,
    cost: 176,
    profit: 44,
    quota: '45 GB',
    description: 'باقة التصفح والتحميل العالي والالعاب أونلاين 45 جيجا',
    duration: '30 يوم',
    badge: 'مميز',
    features: ['45 جيجا سوبر ميجابايتس', 'أعلى سرعة على شبكة اتصالات', 'شحن يدوي مؤكد'],
    active: true,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'et-hek-65',
    company_id: 'etisalat',
    category_id: 'calls',
    name: 'اتصالات حكاية 65',
    price: 95,
    cost: 76,
    profit: 19,
    quota: '2,500 ميكس',
    description: '2500 ميكس دقائق وميجابايتس شهرياً',
    duration: '30 يوم',
    features: ['2500 ميكس', 'واتساب مجاني حتى نهاية الباقة', 'شحن خلال دقائق'],
    active: true,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'et-bal-100',
    company_id: 'etisalat',
    category_id: 'balance',
    name: 'شحن رصيد صافي اتصالات 100 جنيه',
    price: 145,
    cost: 116,
    profit: 29,
    quota: '100 ج.م رصيد صافي',
    description: '100 جنيه رصيد صافي حقيقي على خط اتصالات',
    duration: 'دائم',
    features: ['100 جنيه رصيد صافي', 'تحويل رصيد رسمي', 'تأكيد فوري'],
    active: true,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },

  // WE
  {
    id: 'we-nit-15',
    company_id: 'we',
    category_id: 'internet',
    name: 'وي Nitro نت 15 جيجا',
    price: 75,
    cost: 60,
    profit: 15,
    quota: '15 GB',
    description: 'باقة نايترو من المصرية للاتصالات WE للإنترنت السريع',
    duration: '30 يوم',
    features: ['15,000 ميجابايت', 'صالحة 30 يوم', 'تصفح بدون تقطيع'],
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
    cost: 132,
    profit: 33,
    quota: '35 GB',
    description: 'باقة نايترو 35 جيجا من وي بأفضل سعر للميجابايت',
    duration: '30 يوم',
    badge: 'الأكثر طلباً',
    features: ['35,000 ميجا بايت', 'إنترنت 4G عالي الكفاءة', 'شحن يدوي مباشر'],
    active: true,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'we-nit-50',
    company_id: 'we',
    category_id: 'internet',
    name: 'وي Nitro نت 50 جيجا',
    price: 240,
    cost: 192,
    profit: 48,
    quota: '50 GB',
    description: '50 جيجابايت من وي تناسب كافة أفراد العائلة والاستخدام الثقيل',
    duration: '30 يوم',
    badge: 'توفير مضاعف',
    features: ['50 جيجا بايت كاملة', 'تجديد شهري وسرعة ممتازة', 'تنفيذ مباشر'],
    active: true,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'we-bal-100',
    company_id: 'we',
    category_id: 'balance',
    name: 'شحن رصيد صافي WE بقيمة 100 جنيه',
    price: 145,
    cost: 116,
    profit: 29,
    quota: '100 ج.م رصيد صافي',
    description: '100 جنيه رصيد صافي على شبكة وي المصرية للاتصالات',
    duration: 'دائم',
    features: ['100 جنيه رصيد صافي', 'تحويل رسمي آمن', 'تنفيذ سريع'],
    active: true,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
];

class PostgresDatabase {
  private initialized = false;

  async initDatabase() {
    if (this.initialized) return;
    try {
      // 1. Ensure counter exists
      const existingCounter = await db.select().from(schema.counters).where(eq(schema.counters.id, 'main'));
      if (existingCounter.length === 0) {
        await db.insert(schema.counters).values({ id: 'main', counter: 1 });
      }

      // 2. Ensure Admin exists
      const existingAdmins = await db.select().from(schema.admins);
      if (existingAdmins.length === 0) {
        await db.insert(schema.admins).values({
          id: DEFAULT_ADMIN.id,
          name: DEFAULT_ADMIN.name,
          email: DEFAULT_ADMIN.email,
          passwordHash: DEFAULT_ADMIN.password_hash,
          createdAt: DEFAULT_ADMIN.created_at,
        });
      }

      // 3. Ensure Settings exist
      const existingSettings = await db.select().from(schema.settings).where(eq(schema.settings.id, 'default'));
      if (existingSettings.length === 0) {
        const now = new Date().toISOString();
        await db.insert(schema.settings).values({
          id: 'default',
          siteName: DEFAULT_SETTINGS.site_name,
          siteTagline: DEFAULT_SETTINGS.site_tagline,
          logoText: DEFAULT_SETTINGS.logo_text,
          vodafoneCashNumber: DEFAULT_SETTINGS.vodafone_cash_number,
          instapayAddress: DEFAULT_SETTINGS.instapay_address,
          contactPhone: DEFAULT_SETTINGS.contact_phone,
          whatsappNumber: DEFAULT_SETTINGS.whatsapp_number,
          paymentInstructions: DEFAULT_SETTINGS.payment_instructions,
          currency: DEFAULT_SETTINGS.currency,
          workingHours: DEFAULT_SETTINGS.working_hours,
          noticeBanner: DEFAULT_SETTINGS.notice_banner,
          enableNotice: DEFAULT_SETTINGS.enable_notice,
          showNoticeBanner: DEFAULT_SETTINGS.show_notice_banner,
          data: DEFAULT_SETTINGS,
          createdAt: now,
          updatedAt: now,
        });
      }

      // 4. Ensure Companies exist
      const existingCompanies = await db.select().from(schema.companies);
      if (existingCompanies.length === 0) {
        for (const comp of DEFAULT_COMPANIES) {
          await db.insert(schema.companies).values({
            id: comp.id,
            name: comp.name,
            nameEn: comp.nameEn,
            color: comp.color,
            accentColor: comp.accentColor,
            bgLight: comp.bgLight,
            borderLight: comp.borderLight,
            active: comp.active,
            logo: comp.logo,
            order: comp.order,
            createdAt: comp.created_at,
          });
        }
      }

      // 5. Ensure Categories exist
      const existingCats = await db.select().from(schema.categories);
      if (existingCats.length === 0) {
        for (const cat of DEFAULT_CATEGORIES) {
          await db.insert(schema.categories).values({
            id: cat.id,
            companyId: cat.company_id,
            name: cat.name,
            nameEn: cat.nameEn,
            icon: cat.icon,
            active: cat.active,
            order: cat.order,
          });
        }
      }

      // 6. Ensure Packages exist
      const existingPkgs = await db.select().from(schema.packages);
      if (existingPkgs.length === 0) {
        for (const pkg of DEFAULT_PACKAGES) {
          await db.insert(schema.packages).values({
            id: pkg.id,
            name: pkg.name,
            companyId: pkg.company_id,
            categoryId: pkg.category_id,
            price: pkg.price,
            cost: pkg.cost,
            profit: pkg.profit,
            quota: pkg.quota || '',
            description: pkg.description,
            duration: pkg.duration,
            badge: pkg.badge,
            features: pkg.features || [],
            active: pkg.active,
            order: 0,
            createdAt: pkg.created_at,
            updatedAt: pkg.updated_at,
          });
        }
      }

      this.initialized = true;
    } catch (err) {
      console.error('Database initialization error:', err);
    }
  }

  // --- SETTINGS ---
  async getSettings(): Promise<SiteSettings> {
    await this.initDatabase();
    try {
      const rows = await db.select().from(schema.settings).where(eq(schema.settings.id, 'default'));
      if (rows.length === 0) return DEFAULT_SETTINGS;
      const s = rows[0];
      const customData = s.data || {};
      return {
        site_name: s.siteName || customData.site_name || DEFAULT_SETTINGS.site_name,
        site_tagline: s.siteTagline || customData.site_tagline || DEFAULT_SETTINGS.site_tagline,
        logo_text: s.logoText || customData.logo_text || DEFAULT_SETTINGS.logo_text,
        vodafone_cash_number: s.vodafoneCashNumber || customData.vodafone_cash_number || DEFAULT_SETTINGS.vodafone_cash_number,
        instapay_address: s.instapayAddress || customData.instapay_address || DEFAULT_SETTINGS.instapay_address,
        contact_phone: s.contactPhone || customData.contact_phone || DEFAULT_SETTINGS.contact_phone,
        whatsapp_number: s.whatsappNumber || customData.whatsapp_number || DEFAULT_SETTINGS.whatsapp_number,
        payment_instructions: s.paymentInstructions || customData.payment_instructions || DEFAULT_SETTINGS.payment_instructions,
        currency: s.currency || customData.currency || DEFAULT_SETTINGS.currency,
        working_hours: s.workingHours || customData.working_hours || DEFAULT_SETTINGS.working_hours,
        notice_banner: s.noticeBanner || customData.notice_banner || DEFAULT_SETTINGS.notice_banner,
        enable_notice: s.enableNotice !== null ? Boolean(s.enableNotice) : true,
        show_notice_banner: s.showNoticeBanner !== null ? Boolean(s.showNoticeBanner) : true,
        ...customData,
      };
    } catch (error) {
      console.error('getSettings error:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    await this.initDatabase();
    try {
      const current = await this.getSettings();
      const merged: SiteSettings = { ...current, ...updates };
      const now = new Date().toISOString();

      await db.update(schema.settings)
        .set({
          siteName: merged.site_name,
          siteTagline: merged.site_tagline,
          logoText: merged.logo_text,
          vodafoneCashNumber: merged.vodafone_cash_number,
          instapayAddress: merged.instapay_address,
          contactPhone: merged.contact_phone,
          whatsappNumber: merged.whatsapp_number,
          paymentInstructions: merged.payment_instructions,
          currency: merged.currency,
          workingHours: merged.working_hours,
          noticeBanner: merged.notice_banner,
          enableNotice: merged.enable_notice,
          showNoticeBanner: merged.show_notice_banner,
          data: merged,
          updatedAt: now,
        })
        .where(eq(schema.settings.id, 'default'));

      return merged;
    } catch (error) {
      console.error('updateSettings error:', error);
      throw new Error('فشل تحديث الإعدادات');
    }
  }

  // --- COMPANIES ---
  async getCompanies(onlyActive = true): Promise<Company[]> {
    await this.initDatabase();
    try {
      const rows = onlyActive
        ? await db.select().from(schema.companies).where(eq(schema.companies.active, true)).orderBy(asc(schema.companies.order))
        : await db.select().from(schema.companies).orderBy(asc(schema.companies.order));

      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        nameEn: r.nameEn,
        color: r.color,
        accentColor: r.accentColor || r.color,
        bgLight: r.bgLight || '#F9FAFB',
        borderLight: r.borderLight || '#E5E7EB',
        active: r.active,
        logo: r.logo || r.id,
        order: r.order,
        created_at: r.createdAt || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('getCompanies error:', error);
      return DEFAULT_COMPANIES;
    }
  }

  async getCompany(id: string): Promise<Company | undefined> {
    await this.initDatabase();
    try {
      const rows = await db.select().from(schema.companies).where(eq(schema.companies.id, id));
      if (rows.length === 0) return undefined;
      const r = rows[0];
      return {
        id: r.id,
        name: r.name,
        nameEn: r.nameEn,
        color: r.color,
        accentColor: r.accentColor || r.color,
        bgLight: r.bgLight || '#F9FAFB',
        borderLight: r.borderLight || '#E5E7EB',
        active: r.active,
        logo: r.logo || r.id,
        order: r.order,
        created_at: r.createdAt || new Date().toISOString(),
      };
    } catch {
      return undefined;
    }
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company | null> {
    await this.initDatabase();
    try {
      const existing = await this.getCompany(id);
      if (!existing) return null;

      const setValues: any = {};
      if (updates.name !== undefined) setValues.name = updates.name;
      if (updates.nameEn !== undefined) setValues.nameEn = updates.nameEn;
      if (updates.color !== undefined) setValues.color = updates.color;
      if (updates.active !== undefined) setValues.active = updates.active;

      await db.update(schema.companies).set(setValues).where(eq(schema.companies.id, id));
      return await this.getCompany(id) || null;
    } catch (error) {
      console.error('updateCompany error:', error);
      return null;
    }
  }

  // --- CATEGORIES ---
  async getCategories(onlyActive = true): Promise<Category[]> {
    await this.initDatabase();
    try {
      const rows = onlyActive
        ? await db.select().from(schema.categories).where(eq(schema.categories.active, true)).orderBy(asc(schema.categories.order))
        : await db.select().from(schema.categories).orderBy(asc(schema.categories.order));

      return rows.map((r) => ({
        id: r.id,
        company_id: r.companyId,
        name: r.name,
        nameEn: r.nameEn || undefined,
        icon: r.icon,
        active: r.active,
        order: r.order,
      }));
    } catch (error) {
      console.error('getCategories error:', error);
      return DEFAULT_CATEGORIES;
    }
  }

  async addCategory(cat: Omit<Category, 'id'> & { id?: string }): Promise<Category> {
    await this.initDatabase();
    const id = cat.id || `cat-${Date.now()}`;
    await db.insert(schema.categories).values({
      id,
      companyId: cat.company_id || 'all',
      name: cat.name,
      nameEn: cat.nameEn || undefined,
      icon: cat.icon || 'tag',
      active: cat.active !== undefined ? cat.active : true,
      order: cat.order || 0,
    });
    return {
      id,
      company_id: cat.company_id || 'all',
      name: cat.name,
      nameEn: cat.nameEn,
      icon: cat.icon || 'tag',
      active: cat.active !== undefined ? cat.active : true,
      order: cat.order || 0,
    };
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    await this.initDatabase();
    try {
      const setValues: any = {};
      if (updates.name !== undefined) setValues.name = updates.name;
      if (updates.icon !== undefined) setValues.icon = updates.icon;
      if (updates.active !== undefined) setValues.active = updates.active;
      if (updates.order !== undefined) setValues.order = updates.order;

      await db.update(schema.categories).set(setValues).where(eq(schema.categories.id, id));
      const rows = await db.select().from(schema.categories).where(eq(schema.categories.id, id));
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        company_id: r.companyId,
        name: r.name,
        nameEn: r.nameEn || undefined,
        icon: r.icon,
        active: r.active,
        order: r.order,
      };
    } catch {
      return null;
    }
  }

  // --- PACKAGES ---
  async getPackages(filters?: { company_id?: string; category_id?: string; onlyActive?: boolean }): Promise<Package[]> {
    await this.initDatabase();
    try {
      const conditions = [];
      if (filters?.onlyActive) {
        conditions.push(eq(schema.packages.active, true));
      }
      if (filters?.company_id && filters.company_id !== 'all') {
        conditions.push(eq(schema.packages.companyId, filters.company_id));
      }
      if (filters?.category_id && filters.category_id !== 'all') {
        conditions.push(eq(schema.packages.categoryId, filters.category_id));
      }

      const query = conditions.length > 0
        ? db.select().from(schema.packages).where(and(...conditions)).orderBy(asc(schema.packages.price))
        : db.select().from(schema.packages).orderBy(asc(schema.packages.price));

      const rows = await query;
      return rows.map((r) => ({
        id: r.id,
        company_id: r.companyId,
        category_id: r.categoryId,
        name: r.name,
        price: r.price,
        cost: r.cost ?? Math.round(r.price * 0.85),
        profit: r.profit ?? (r.price - (r.cost ?? Math.round(r.price * 0.85))),
        quota: r.quota,
        description: r.description,
        duration: r.duration,
        badge: r.badge || undefined,
        features: r.features || [],
        active: r.active,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      }));
    } catch (error) {
      console.error('getPackages error:', error);
      return [];
    }
  }

  async getPackage(id: string): Promise<Package | undefined> {
    await this.initDatabase();
    try {
      const rows = await db.select().from(schema.packages).where(eq(schema.packages.id, id));
      if (rows.length === 0) return undefined;
      const r = rows[0];
      return {
        id: r.id,
        company_id: r.companyId,
        category_id: r.categoryId,
        name: r.name,
        price: r.price,
        cost: r.cost ?? Math.round(r.price * 0.85),
        profit: r.profit ?? (r.price - (r.cost ?? Math.round(r.price * 0.85))),
        quota: r.quota,
        description: r.description,
        duration: r.duration,
        badge: r.badge || undefined,
        features: r.features || [],
        active: r.active,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      };
    } catch {
      return undefined;
    }
  }

  async createPackage(pkg: Omit<Package, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Package> {
    await this.initDatabase();
    const id = pkg.id || `pkg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const cost = pkg.cost !== undefined ? pkg.cost : Math.round(pkg.price * 0.85);
    const profit = pkg.profit !== undefined ? pkg.profit : (pkg.price - cost);

    await db.insert(schema.packages).values({
      id,
      name: pkg.name,
      companyId: pkg.company_id,
      categoryId: pkg.category_id,
      price: pkg.price,
      cost,
      profit,
      quota: pkg.quota || '',
      description: pkg.description || '',
      duration: pkg.duration || '30 يوم',
      badge: pkg.badge || null,
      features: pkg.features || [],
      active: pkg.active !== undefined ? pkg.active : true,
      order: 0,
      createdAt: now,
      updatedAt: now,
    });

    return (await this.getPackage(id))!;
  }

  async updatePackage(id: string, updates: Partial<Package>): Promise<Package | null> {
    await this.initDatabase();
    try {
      const existing = await this.getPackage(id);
      if (!existing) return null;

      const now = new Date().toISOString();
      const setValues: any = { updatedAt: now };

      if (updates.name !== undefined) setValues.name = updates.name;
      if (updates.company_id !== undefined) setValues.companyId = updates.company_id;
      if (updates.category_id !== undefined) setValues.categoryId = updates.category_id;
      if (updates.price !== undefined) setValues.price = updates.price;
      if (updates.cost !== undefined) setValues.cost = updates.cost;
      if (updates.profit !== undefined) setValues.profit = updates.profit;
      if (updates.quota !== undefined) setValues.quota = updates.quota;
      if (updates.description !== undefined) setValues.description = updates.description;
      if (updates.duration !== undefined) setValues.duration = updates.duration;
      if (updates.badge !== undefined) setValues.badge = updates.badge;
      if (updates.features !== undefined) setValues.features = updates.features;
      if (updates.active !== undefined) setValues.active = updates.active;

      await db.update(schema.packages).set(setValues).where(eq(schema.packages.id, id));
      return await this.getPackage(id) || null;
    } catch {
      return null;
    }
  }

  async deletePackage(id: string): Promise<boolean> {
    await this.initDatabase();
    try {
      const res = await db.delete(schema.packages).where(eq(schema.packages.id, id));
      return (res.rowCount ?? 1) > 0;
    } catch {
      return false;
    }
  }

  // --- ORDERS ---
  async getNextOrderNumber(): Promise<string> {
    await this.initDatabase();
    const rows = await db.select().from(schema.counters).where(eq(schema.counters.id, 'main'));
    let current = 1;
    if (rows.length > 0) {
      current = rows[0].counter;
    }
    const nextVal = current + 1;
    await db.insert(schema.counters)
      .values({ id: 'main', counter: nextVal })
      .onConflictDoUpdate({ target: schema.counters.id, set: { counter: nextVal } });

    return `#${String(current).padStart(3, '0')}`;
  }

  async createOrder(data: {
    customer_name: string;
    phone_number: string;
    contact_phone?: string;
    package_id: string;
    payment_method: 'vodafone_cash' | 'instapay' | 'manual_transfer';
    notes?: string;
  }): Promise<Order> {
    await this.initDatabase();
    const pkg = await this.getPackage(data.package_id);
    if (!pkg) throw new Error('الباقة المحددة غير موجودة');

    const company = await this.getCompany(pkg.company_id);
    const category = (await this.getCategories(false)).find((c) => c.id === pkg.category_id);

    const orderNumber = await this.getNextOrderNumber();
    const id = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const cost = pkg.cost !== undefined ? pkg.cost : Math.round(pkg.price * 0.85);
    const profit = pkg.profit !== undefined ? pkg.profit : (pkg.price - cost);

    const initialHistory = [
      {
        status: 'new' as OrderStatus,
        timestamp: now,
        note: 'تم إنشاء الطلب بنجاح وهو قيد مراجعة الدفع والتنفيذ اليدوي',
      },
    ];

    await db.insert(schema.orders).values({
      id,
      orderNumber,
      customerName: data.customer_name,
      phoneNumber: data.phone_number,
      contactPhone: data.contact_phone || null,
      packageId: pkg.id,
      packageName: pkg.name,
      packagePrice: pkg.price,
      packageCost: cost,
      packageProfit: profit,
      packageQuota: pkg.quota || '',
      packageDuration: pkg.duration || '',
      companyId: pkg.company_id,
      companyName: company?.name || pkg.company_id,
      categoryId: pkg.category_id,
      categoryName: category?.name || '',
      paymentMethod: data.payment_method,
      amount: pkg.price,
      notes: data.notes || null,
      adminNotes: null,
      status: 'new',
      statusHistory: initialHistory,
      createdAt: now,
      updatedAt: now,
    });

    return (await this.getOrderById(id))!;
  }

  async getOrders(filters?: { status?: string; company_id?: string; search?: string }): Promise<Order[]> {
    await this.initDatabase();
    try {
      const conditions = [];
      if (filters?.status && filters.status !== 'all') {
        conditions.push(eq(schema.orders.status, filters.status));
      }
      if (filters?.company_id && filters.company_id !== 'all') {
        conditions.push(eq(schema.orders.companyId, filters.company_id));
      }
      if (filters?.search) {
        const term = `%${filters.search.trim()}%`;
        conditions.push(
          or(
            like(schema.orders.customerName, term),
            like(schema.orders.phoneNumber, term),
            like(schema.orders.orderNumber, term),
            like(schema.orders.packageName, term)
          )
        );
      }

      const query = conditions.length > 0
        ? db.select().from(schema.orders).where(and(...conditions)).orderBy(desc(schema.orders.createdAt))
        : db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt));

      const rows = await query;
      return rows.map((r) => ({
        id: r.id,
        order_number: r.orderNumber,
        customer_name: r.customerName,
        phone_number: r.phoneNumber,
        contact_phone: r.contactPhone || undefined,
        package_id: r.packageId,
        package_name: r.packageName,
        package_price: r.packagePrice,
        package_cost: r.packageCost ?? Math.round(r.packagePrice * 0.85),
        package_profit: r.packageProfit ?? (r.amount - (r.packageCost ?? Math.round(r.packagePrice * 0.85))),
        package_quota: r.packageQuota || undefined,
        package_duration: r.packageDuration || undefined,
        company_id: r.companyId,
        company_name: r.companyName,
        category_id: r.categoryId,
        category_name: r.categoryName,
        payment_method: r.paymentMethod as any,
        amount: r.amount,
        notes: r.notes || undefined,
        admin_notes: r.adminNotes || undefined,
        status: r.status as OrderStatus,
        status_history: r.statusHistory as any,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      }));
    } catch (error) {
      console.error('getOrders error:', error);
      return [];
    }
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    await this.initDatabase();
    try {
      const rows = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
      if (rows.length === 0) return undefined;
      const r = rows[0];
      return {
        id: r.id,
        order_number: r.orderNumber,
        customer_name: r.customerName,
        phone_number: r.phoneNumber,
        contact_phone: r.contactPhone || undefined,
        package_id: r.packageId,
        package_name: r.packageName,
        package_price: r.packagePrice,
        package_cost: r.packageCost ?? Math.round(r.packagePrice * 0.85),
        package_profit: r.packageProfit ?? (r.amount - (r.packageCost ?? Math.round(r.packagePrice * 0.85))),
        package_quota: r.packageQuota || undefined,
        package_duration: r.packageDuration || undefined,
        company_id: r.companyId,
        company_name: r.companyName,
        category_id: r.categoryId,
        category_name: r.categoryName,
        payment_method: r.paymentMethod as any,
        amount: r.amount,
        notes: r.notes || undefined,
        admin_notes: r.adminNotes || undefined,
        status: r.status as OrderStatus,
        status_history: r.statusHistory as any,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      };
    } catch {
      return undefined;
    }
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    await this.initDatabase();
    try {
      const cleanNum = orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`;
      const rows = await db.select().from(schema.orders).where(
        or(eq(schema.orders.orderNumber, orderNumber), eq(schema.orders.orderNumber, cleanNum))
      );
      if (rows.length === 0) return undefined;
      const r = rows[0];
      return {
        id: r.id,
        order_number: r.orderNumber,
        customer_name: r.customerName,
        phone_number: r.phoneNumber,
        contact_phone: r.contactPhone || undefined,
        package_id: r.packageId,
        package_name: r.packageName,
        package_price: r.packagePrice,
        package_cost: r.packageCost ?? Math.round(r.packagePrice * 0.85),
        package_profit: r.packageProfit ?? (r.amount - (r.packageCost ?? Math.round(r.packagePrice * 0.85))),
        package_quota: r.packageQuota || undefined,
        package_duration: r.packageDuration || undefined,
        company_id: r.companyId,
        company_name: r.companyName,
        category_id: r.categoryId,
        category_name: r.categoryName,
        payment_method: r.paymentMethod as any,
        amount: r.amount,
        notes: r.notes || undefined,
        admin_notes: r.adminNotes || undefined,
        status: r.status as OrderStatus,
        status_history: r.statusHistory as any,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      };
    } catch {
      return undefined;
    }
  }

  async updateOrderStatus(id: string, newStatus: OrderStatus, note?: string): Promise<Order | null> {
    await this.initDatabase();
    const order = await this.getOrderById(id);
    if (!order) return null;

    const now = new Date().toISOString();
    const history = [...order.status_history, { status: newStatus, timestamp: now, note }];

    await db.update(schema.orders)
      .set({
        status: newStatus,
        statusHistory: history,
        updatedAt: now,
      })
      .where(eq(schema.orders.id, id));

    return await this.getOrderById(id) || null;
  }

  async updateOrderNotes(id: string, notes: string): Promise<Order | null> {
    await this.initDatabase();
    const order = await this.getOrderById(id);
    if (!order) return null;

    const now = new Date().toISOString();
    await db.update(schema.orders)
      .set({
        adminNotes: notes,
        updatedAt: now,
      })
      .where(eq(schema.orders.id, id));

    return await this.getOrderById(id) || null;
  }

  async deleteOrder(id: string): Promise<boolean> {
    await this.initDatabase();
    try {
      const res = await db.delete(schema.orders).where(eq(schema.orders.id, id));
      return (res.rowCount ?? 1) > 0;
    } catch {
      return false;
    }
  }

  // --- STATS ---
  async getStats(period: 'all' | 'today' | '7days' | '30days' | 'week' | 'month' = 'all') {
    await this.initDatabase();
    const allOrders = await this.getOrders();
    const now = new Date();

    const filtered = allOrders.filter((order) => {
      if (period === 'all') return true;
      const orderDate = new Date(order.created_at);
      const orderTime = orderDate.getTime();
      if (period === 'today') {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        return orderTime >= todayStart;
      }
      if (period === '7days' || period === 'week') {
        const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
        return orderTime >= weekAgo;
      }
      if (period === '30days' || period === 'month') {
        const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
        return orderTime >= thirtyDaysAgo;
      }
      return true;
    });

    const totalOrders = filtered.length;
    const newOrders = filtered.filter((o) => o.status === 'new').length;
    const pendingPaymentOrders = filtered.filter((o) => o.status === 'pending_payment').length;
    const processingOrders = filtered.filter((o) => o.status === 'processing' || o.status === 'payment_confirmed').length;
    const rechargedOrders = filtered.filter((o) => o.status === 'recharged').length;
    const completedOrders = filtered.filter((o) => o.status === 'completed').length;
    const cancelledOrders = filtered.filter((o) => o.status === 'cancelled').length;

    const isCompleted = (status: string) =>
      status === 'completed' || status === 'recharged' || status === 'payment_confirmed';

    const validSalesOrders = filtered.filter((o) => isCompleted(o.status));

    const totalSales = validSalesOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

    const totalCost = validSalesOrders.reduce((sum, o) => {
      const cost =
        typeof o.package_cost === 'number'
          ? o.package_cost
          : o.package_price
          ? Math.round(o.package_price * 0.85)
          : Math.round((o.amount || 0) * 0.85);
      return sum + cost;
    }, 0);

    const totalProfit = validSalesOrders.reduce((sum, o) => {
      const cost =
        typeof o.package_cost === 'number'
          ? o.package_cost
          : o.package_price
          ? Math.round(o.package_price * 0.85)
          : Math.round((o.amount || 0) * 0.85);
      const profit =
        typeof o.package_profit === 'number'
          ? o.package_profit
          : (o.amount || o.package_price || 0) - cost;
      return sum + profit;
    }, 0);

    const profitMargin =
      totalSales > 0 ? Number(((totalProfit / totalSales) * 100).toFixed(1)) : 0;

    const uniqueCustomers = new Set(
      validSalesOrders.map((o) => o.phone_number).filter(Boolean)
    ).size;

    // Today stats calculation
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayList = allOrders.filter((o) => new Date(o.created_at).getTime() >= todayStart);
    const todayOrders = todayList.length;
    const validTodayList = todayList.filter((o) => isCompleted(o.status));
    const todaySales = validTodayList.reduce((sum, o) => sum + (o.amount || 0), 0);
    const todayCost = validTodayList.reduce((sum, o) => {
      const cost =
        typeof o.package_cost === 'number'
          ? o.package_cost
          : o.package_price
          ? Math.round(o.package_price * 0.85)
          : Math.round((o.amount || 0) * 0.85);
      return sum + cost;
    }, 0);
    const todayProfit = validTodayList.reduce((sum, o) => {
      const cost =
        typeof o.package_cost === 'number'
          ? o.package_cost
          : o.package_price
          ? Math.round(o.package_price * 0.85)
          : Math.round((o.amount || 0) * 0.85);
      const profit =
        typeof o.package_profit === 'number'
          ? o.package_profit
          : (o.amount || o.package_price || 0) - cost;
      return sum + profit;
    }, 0);

    // Due renewals count for subscribers
    let dueRenewalsCount = 0;
    try {
      const subscribers = await this.getSubscribers({ activeOnly: true });
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      dueRenewalsCount = subscribers.filter(
        (s) => s.next_renewal_date && s.next_renewal_date <= todayStr
      ).length;
    } catch (e) {
      console.error('getStats: error getting subscribers due count', e);
    }

    // Company breakdown
    let companyBreakdown: {
      companyId: string;
      companyName: string;
      count: number;
      sales: number;
      cost: number;
      profit: number;
    }[] = [];
    try {
      const companies = await this.getCompanies(false);
      const companyMap: Record<
        string,
        { count: number; sales: number; cost: number; profit: number; name: string }
      > = {};
      for (const comp of companies) {
        companyMap[comp.id] = { count: 0, sales: 0, cost: 0, profit: 0, name: comp.name };
      }
      for (const ord of validSalesOrders) {
        if (!companyMap[ord.company_id]) {
          companyMap[ord.company_id] = {
            count: 0,
            sales: 0,
            cost: 0,
            profit: 0,
            name: ord.company_name || ord.company_id,
          };
        }
        const cost =
          typeof ord.package_cost === 'number'
            ? ord.package_cost
            : ord.package_price
            ? Math.round(ord.package_price * 0.85)
            : Math.round((ord.amount || 0) * 0.85);
        const profit =
          typeof ord.package_profit === 'number'
            ? ord.package_profit
            : (ord.amount || ord.package_price || 0) - cost;

        companyMap[ord.company_id].count += 1;
        companyMap[ord.company_id].sales += ord.amount || 0;
        companyMap[ord.company_id].cost += cost;
        companyMap[ord.company_id].profit += profit;
      }
      companyBreakdown = Object.entries(companyMap).map(([companyId, data]) => ({
        companyId,
        companyName: data.name,
        count: data.count,
        sales: data.sales,
        cost: data.cost,
        profit: data.profit,
      }));
    } catch (e) {
      console.error('getStats: error calculating companyBreakdown', e);
    }

    // Top packages
    const pkgStatsMap: Record<
      string,
      {
        packageId: string;
        packageName: string;
        companyId: string;
        count: number;
        totalSales: number;
        totalCost: number;
        totalProfit: number;
      }
    > = {};
    for (const ord of validSalesOrders) {
      const pid = ord.package_id || ord.package_name || 'unknown';
      if (!pkgStatsMap[pid]) {
        pkgStatsMap[pid] = {
          packageId: ord.package_id || pid,
          packageName: ord.package_name || 'باقة',
          companyId: ord.company_id,
          count: 0,
          totalSales: 0,
          totalCost: 0,
          totalProfit: 0,
        };
      }
      const cost =
        typeof ord.package_cost === 'number'
          ? ord.package_cost
          : ord.package_price
          ? Math.round(ord.package_price * 0.85)
          : Math.round((ord.amount || 0) * 0.85);
      const profit =
        typeof ord.package_profit === 'number'
          ? ord.package_profit
          : (ord.amount || ord.package_price || 0) - cost;

      pkgStatsMap[pid].count += 1;
      pkgStatsMap[pid].totalSales += ord.amount || 0;
      pkgStatsMap[pid].totalCost += cost;
      pkgStatsMap[pid].totalProfit += profit;
    }
    const topPackages = Object.values(pkgStatsMap)
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, 5);

    const recentOrders = [...allOrders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    return {
      totalOrders,
      newOrders,
      pendingPaymentOrders,
      processingOrders,
      rechargedOrders,
      completedOrders,
      cancelledOrders,
      totalSales,
      totalRevenue: totalSales,
      totalCost,
      totalProfit,
      netProfit: totalProfit,
      profitMargin,
      uniqueCustomers,
      todayOrders,
      todaySales,
      todayCost,
      todayProfit,
      dueRenewalsCount,
      recentOrders,
      companyBreakdown,
      topPackages,
    };
  }

  // --- SUBSCRIBERS ---
  async getSubscribers(filters?: { company_id?: string; onlyDue?: boolean; activeOnly?: boolean; search?: string }): Promise<MonthlySubscriber[]> {
    await this.initDatabase();
    try {
      const conditions = [];
      if (filters?.activeOnly) {
        conditions.push(eq(schema.subscribers.active, true));
      }
      if (filters?.company_id && filters.company_id !== 'all') {
        conditions.push(eq(schema.subscribers.companyId, filters.company_id));
      }
      if (filters?.search) {
        const term = `%${filters.search.trim()}%`;
        conditions.push(
          or(
            like(schema.subscribers.customerName, term),
            like(schema.subscribers.phoneNumber, term),
            like(schema.subscribers.packageName, term)
          )
        );
      }

      const rows = conditions.length > 0
        ? await db.select().from(schema.subscribers).where(and(...conditions)).orderBy(asc(schema.subscribers.renewalDay))
        : await db.select().from(schema.subscribers).orderBy(asc(schema.subscribers.renewalDay));

      let list = rows.map((r) => ({
        id: r.id,
        customer_name: r.customerName,
        phone_number: r.phoneNumber,
        contact_phone: r.contactPhone || undefined,
        company_id: r.companyId,
        company_name: r.companyName || undefined,
        package_id: r.packageId || undefined,
        package_name: r.packageName,
        package_price: r.packagePrice,
        package_cost: r.packageCost ?? Math.round(r.packagePrice * 0.85),
        package_profit: r.packageProfit ?? (r.packagePrice - (r.packageCost ?? Math.round(r.packagePrice * 0.85))),
        renewal_day: r.renewalDay,
        next_renewal_date: r.nextRenewalDate,
        last_recharge_date: r.lastRechargeDate || undefined,
        notes: r.notes || undefined,
        auto_notify_whatsapp: r.autoNotifyWhatsapp,
        active: r.active,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      }));

      if (filters?.onlyDue) {
        const today = new Date().toISOString().split('T')[0];
        list = list.filter((sub) => sub.next_renewal_date <= today);
      }

      return list;
    } catch (error) {
      console.error('getSubscribers error:', error);
      return [];
    }
  }

  async getSubscriber(id: string): Promise<MonthlySubscriber | undefined> {
    await this.initDatabase();
    try {
      const rows = await db.select().from(schema.subscribers).where(eq(schema.subscribers.id, id));
      if (rows.length === 0) return undefined;
      const r = rows[0];
      return {
        id: r.id,
        customer_name: r.customerName,
        phone_number: r.phoneNumber,
        contact_phone: r.contactPhone || undefined,
        company_id: r.companyId,
        company_name: r.companyName || undefined,
        package_id: r.packageId || undefined,
        package_name: r.packageName,
        package_price: r.packagePrice,
        package_cost: r.packageCost ?? Math.round(r.packagePrice * 0.85),
        package_profit: r.packageProfit ?? (r.packagePrice - (r.packageCost ?? Math.round(r.packagePrice * 0.85))),
        renewal_day: r.renewalDay,
        next_renewal_date: r.nextRenewalDate,
        last_recharge_date: r.lastRechargeDate || undefined,
        notes: r.notes || undefined,
        auto_notify_whatsapp: r.autoNotifyWhatsapp,
        active: r.active,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      };
    } catch {
      return undefined;
    }
  }

  async createSubscriber(data: Omit<MonthlySubscriber, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<MonthlySubscriber> {
    await this.initDatabase();
    const id = data.id || `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const cost = data.package_cost !== undefined ? data.package_cost : Math.round(data.package_price * 0.85);
    const profit = data.package_profit !== undefined ? data.package_profit : (data.package_price - cost);

    let nextDate = data.next_renewal_date;
    if (!nextDate) {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      d.setDate(data.renewal_day || 1);
      nextDate = d.toISOString().split('T')[0];
    }

    await db.insert(schema.subscribers).values({
      id,
      customerName: data.customer_name,
      phoneNumber: data.phone_number,
      contactPhone: data.contact_phone || null,
      companyId: data.company_id,
      companyName: data.company_name || null,
      packageId: data.package_id || null,
      packageName: data.package_name,
      packagePrice: data.package_price,
      packageCost: cost,
      packageProfit: profit,
      renewalDay: data.renewal_day,
      nextRenewalDate: nextDate,
      lastRechargeDate: data.last_recharge_date || null,
      notes: data.notes || null,
      autoNotifyWhatsapp: data.auto_notify_whatsapp !== undefined ? data.auto_notify_whatsapp : true,
      active: data.active !== undefined ? data.active : true,
      createdAt: now,
      updatedAt: now,
    });

    return (await this.getSubscriber(id))!;
  }

  async updateSubscriber(id: string, updates: Partial<MonthlySubscriber>): Promise<MonthlySubscriber | null> {
    await this.initDatabase();
    const existing = await this.getSubscriber(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const setValues: any = { updatedAt: now };

    if (updates.customer_name !== undefined) setValues.customerName = updates.customer_name;
    if (updates.phone_number !== undefined) setValues.phoneNumber = updates.phone_number;
    if (updates.contact_phone !== undefined) setValues.contactPhone = updates.contact_phone;
    if (updates.company_id !== undefined) setValues.companyId = updates.company_id;
    if (updates.company_name !== undefined) setValues.companyName = updates.company_name;
    if (updates.package_id !== undefined) setValues.packageId = updates.package_id;
    if (updates.package_name !== undefined) setValues.packageName = updates.package_name;
    if (updates.package_price !== undefined) setValues.packagePrice = updates.package_price;
    if (updates.package_cost !== undefined) setValues.packageCost = updates.package_cost;
    if (updates.package_profit !== undefined) setValues.packageProfit = updates.package_profit;
    if (updates.renewal_day !== undefined) setValues.renewalDay = updates.renewal_day;
    if (updates.next_renewal_date !== undefined) setValues.nextRenewalDate = updates.next_renewal_date;
    if (updates.last_recharge_date !== undefined) setValues.lastRechargeDate = updates.last_recharge_date;
    if (updates.notes !== undefined) setValues.notes = updates.notes;
    if (updates.auto_notify_whatsapp !== undefined) setValues.autoNotifyWhatsapp = updates.auto_notify_whatsapp;
    if (updates.active !== undefined) setValues.active = updates.active;

    await db.update(schema.subscribers).set(setValues).where(eq(schema.subscribers.id, id));
    return await this.getSubscriber(id) || null;
  }

  async deleteSubscriber(id: string): Promise<boolean> {
    await this.initDatabase();
    try {
      const res = await db.delete(schema.subscribers).where(eq(schema.subscribers.id, id));
      return (res.rowCount ?? 1) > 0;
    } catch {
      return false;
    }
  }

  async renewSubscriberRecharge(id: string, options?: { payment_method?: any; admin_notes?: string }): Promise<{ subscriber: MonthlySubscriber; order: Order } | null> {
    await this.initDatabase();
    const sub = await this.getSubscriber(id);
    if (!sub) return null;

    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(sub.renewal_day);
    const nextRenewalDate = nextMonth.toISOString().split('T')[0];

    const updatedSub = await this.updateSubscriber(id, {
      last_recharge_date: now.toISOString(),
      next_renewal_date: nextRenewalDate,
    });

    const orderNumber = await this.getNextOrderNumber();
    const orderId = `ord-ren-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const cost = sub.package_cost !== undefined ? sub.package_cost : Math.round(sub.package_price * 0.85);
    const profit = sub.package_profit !== undefined ? sub.package_profit : (sub.package_price - cost);

    const history = [
      {
        status: 'completed' as OrderStatus,
        timestamp: now.toISOString(),
        note: `شحن تجديد شهري تلقائي للمشترك: ${sub.customer_name}`,
      },
    ];

    await db.insert(schema.orders).values({
      id: orderId,
      orderNumber,
      customerName: sub.customer_name,
      phoneNumber: sub.phone_number,
      contactPhone: sub.contact_phone || null,
      packageId: sub.package_id || 'manual-sub',
      packageName: sub.package_name,
      packagePrice: sub.package_price,
      packageCost: cost,
      packageProfit: profit,
      packageQuota: 'تجديد شهري',
      packageDuration: 'شهر',
      companyId: sub.company_id,
      companyName: sub.company_name || sub.company_id,
      categoryId: 'internet',
      categoryName: 'اشتراك شهري',
      paymentMethod: options?.payment_method || 'vodafone_cash',
      amount: sub.package_price,
      notes: `شحن شهري مجدول - يوم ${sub.renewal_day} في الشهر`,
      adminNotes: options?.admin_notes || null,
      status: 'completed',
      statusHistory: history,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    const order = (await this.getOrderById(orderId))!;
    return { subscriber: updatedSub!, order };
  }

  // --- ADMINS ---
  async getAdmins(): Promise<Admin[]> {
    await this.initDatabase();
    try {
      const rows = await db.select().from(schema.admins);
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        password_hash: r.passwordHash,
        created_at: r.createdAt,
      }));
    } catch {
      return [DEFAULT_ADMIN];
    }
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    await this.initDatabase();
    try {
      const rows = await db.select().from(schema.admins).where(eq(schema.admins.email, email.trim().toLowerCase()));
      if (rows.length === 0) return undefined;
      const r = rows[0];
      return {
        id: r.id,
        name: r.name,
        email: r.email,
        password_hash: r.passwordHash,
        created_at: r.createdAt,
      };
    } catch {
      return undefined;
    }
  }

  async getAdminById(id: string): Promise<Admin | undefined> {
    await this.initDatabase();
    try {
      const rows = await db.select().from(schema.admins).where(eq(schema.admins.id, id));
      if (rows.length === 0) return undefined;
      const r = rows[0];
      return {
        id: r.id,
        name: r.name,
        email: r.email,
        password_hash: r.passwordHash,
        created_at: r.createdAt,
      };
    } catch {
      return undefined;
    }
  }

  async updateAdminPassword(id: string, newHash: string): Promise<boolean> {
    await this.initDatabase();
    try {
      await db.update(schema.admins).set({ passwordHash: newHash }).where(eq(schema.admins.id, id));
      return true;
    } catch {
      return false;
    }
  }

  // --- DATA MANAGEMENT & CLEANING ---
  async getDataCounts() {
    await this.initDatabase();
    const [ordersCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.orders);
    const [subsCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.subscribers);
    const [pkgsCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.packages);
    const [compsCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.companies);

    return {
      orders: Number(ordersCount?.count || 0),
      subscribers: Number(subsCount?.count || 0),
      packages: Number(pkgsCount?.count || 0),
      companies: Number(compsCount?.count || 0),
    };
  }

  async clearAllOrders() {
    await this.initDatabase();
    const count = (await this.getDataCounts()).orders;
    await db.delete(schema.orders);
    await db.update(schema.counters).set({ counter: 1 }).where(eq(schema.counters.id, 'main'));
    return { count };
  }

  async clearAllSubscribers() {
    await this.initDatabase();
    const count = (await this.getDataCounts()).subscribers;
    await db.delete(schema.subscribers);
    return { count };
  }

  async clearAllPackages() {
    await this.initDatabase();
    const count = (await this.getDataCounts()).packages;
    await db.delete(schema.packages);
    return { count };
  }

  async restoreDefaultPackages() {
    await this.initDatabase();
    await db.delete(schema.packages);
    for (const pkg of DEFAULT_PACKAGES) {
      await db.insert(schema.packages).values({
        id: pkg.id,
        name: pkg.name,
        companyId: pkg.company_id,
        categoryId: pkg.category_id,
        price: pkg.price,
        cost: pkg.cost,
        profit: pkg.profit,
        quota: pkg.quota || '',
        description: pkg.description,
        duration: pkg.duration,
        badge: pkg.badge,
        features: pkg.features || [],
        active: pkg.active,
        order: 0,
        createdAt: pkg.created_at,
        updatedAt: pkg.updated_at,
      });
    }
    return { count: DEFAULT_PACKAGES.length };
  }

  async clearAllData(includePackages = false) {
    await this.initDatabase();
    const counts = await this.getDataCounts();
    await db.delete(schema.orders);
    await db.delete(schema.subscribers);
    await db.update(schema.counters).set({ counter: 1 }).where(eq(schema.counters.id, 'main'));

    let deletedPackages = 0;
    if (includePackages) {
      await db.delete(schema.packages);
      deletedPackages = counts.packages;
    }

    return {
      deletedOrders: counts.orders,
      deletedSubscribers: counts.subscribers,
      deletedPackages,
    };
  }
}

export const postgresDb = new PostgresDatabase();
