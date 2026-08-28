import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { db, hashPassword, verifyPassword } from './server/db.ts';
import type { OrderStatus } from './src/types.ts';

const app = express();
const PORT = 3000;
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Security & Parsing Middlewares
app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/api/admin', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// Security Headers Middleware (compatible with AI Studio iframe live preview)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'");
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Input Sanitization Helper to prevent XSS & script injection
function sanitizeText(str: any, maxLen = 500): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // remove direct angle brackets
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, maxLen);
}

// ----------------------------------------------------
// IN-MEMORY RATE LIMITING & BRUTE-FORCE PROTECTION
// ----------------------------------------------------
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const ipLimits = new Map<string, RateLimitRecord>();
const loginFailedAttempts = new Map<string, { attempts: number; lockUntil: number }>();

function rateLimiter(maxRequests: number, windowMs: number, customMessage: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || 'unknown-ip';
    const now = Date.now();
    const record = ipLimits.get(`${ip}:${req.path}`) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    ipLimits.set(`${ip}:${req.path}`, record);

    if (record.count > maxRequests) {
      return res.status(429).json({ error: customMessage });
    }

    next();
  };
}

// Clean up stale rate-limiting records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipLimits.entries()) {
    if (now > record.resetTime) ipLimits.delete(key);
  }
  for (const [key, record] of loginFailedAttempts.entries()) {
    if (now > record.lockUntil) loginFailedAttempts.delete(key);
  }
}, 10 * 60 * 1000);

// ----------------------------------------------------
// Strict Admin Authentication Middleware (No backdoors or fallbacks)
async function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح بالدخول. يرجى تسجيل الدخول كمدير' });
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return res.status(401).json({ error: 'جلسة تسجيل الدخول مفقودة' });
  }

  const session = await db.getAdminSession(token);
  if (!session) {
    return res.status(401).json({ error: 'جلسة تسجيل الدخول منتهية أو غير صحيحة' });
  }

  const admin = await db.getAdminById(session.adminId);
  if (!admin) {
    return res.status(401).json({ error: 'حساب المدير غير موجود أو تم تعديله' });
  }

  (req as any).admin = admin;
  next();
}

// ==========================================
// PUBLIC API ROUTES
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Site Settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: 'فشل جلب الإعدادات' });
  }
});

// Companies
app.get('/api/companies', async (req, res) => {
  try {
    const companies = await db.getCompanies(true);
    res.json(companies);
  } catch (error: any) {
    res.status(500).json({ error: 'فشل جلب الشركات' });
  }
});

// Categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.getCategories(true);
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: 'فشل جلب الأقسام' });
  }
});

// Packages (public only active)
app.get('/api/packages', async (req, res) => {
  try {
    const { company_id, category_id } = req.query;
    const packages = await db.getPackages({
      company_id: company_id ? String(company_id) : undefined,
      category_id: category_id ? String(category_id) : undefined,
      onlyActive: true,
    });
    res.json(packages);
  } catch (error: any) {
    res.status(500).json({ error: 'فشل جلب الباقات' });
  }
});

// Single Package
app.get('/api/packages/:id', async (req, res) => {
  try {
    const pkg = await db.getPackage(req.params.id);
    if (!pkg || !pkg.active) {
      return res.status(404).json({ error: 'الباقة غير متوفرة أو تم إيقافها' });
    }
    res.json(pkg);
  } catch (error: any) {
    res.status(500).json({ error: 'حدث خطأ في النظام' });
  }
});

// Create Order (Customer) - Rate Limited: 10 per minute per IP to prevent spam & denial-of-service
app.post(
  '/api/orders',
  rateLimiter(10, 60 * 1000, 'تم تجاوز الحد المسموح للطلبات. يرجى الانتظار دقيقة والمحاولة مجدداً.'),
  async (req, res) => {
    try {
      const { customer_name, phone_number, contact_phone, package_id, payment_method, notes, payment_proof } = req.body;

      // Sanitization
      const cleanCustomerName = sanitizeText(customer_name, 80);
      const cleanPhone = String(phone_number || '').replace(/\s+/g, '').replace(/[^0-9+]/g, '');
      const cleanContactPhone = contact_phone ? sanitizeText(contact_phone, 20) : undefined;
      const cleanNotes = notes ? sanitizeText(notes, 400) : undefined;
      const cleanPaymentProof = typeof payment_proof === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(payment_proof)
        ? payment_proof
        : undefined;

      if (payment_proof && (!cleanPaymentProof || payment_proof.length > 2_000_000)) {
        return res.status(400).json({ error: 'صورة التحويل غير صالحة أو حجمها أكبر من الحد المسموح' });
      }

      // Validations
      if (!cleanCustomerName || cleanCustomerName.length < 2) {
        return res.status(400).json({ error: 'يرجى إدخال اسم العميل بشكل صحيح (حرفين على الأقل)' });
      }

      if (!cleanPhone || cleanPhone.length < 10) {
        return res.status(400).json({ error: 'يرجى إدخال رقم هاتف الشحن بشكل صحيح (مثال: 01012345678)' });
      }

      // Validate Egyptian phone number pattern
      const phoneRegex = /^(010|011|012|015|\+2010|\+2011|\+2012|\+2015|2010|2011|2012|2015)\d{8}$/;
      if (!phoneRegex.test(cleanPhone)) {
        return res.status(400).json({
          error: 'رقم الهاتف يجب أن يكون رقم مصري صالح مكون من 11 رقماً يبدأ بـ 010 أو 011 أو 012 أو 015',
        });
      }

      if (!package_id) {
        return res.status(400).json({ error: 'يرجى اختيار الباقة المراد شحنها' });
      }

      const pkg = await db.getPackage(package_id);
      if (!pkg || !pkg.active) {
        return res.status(400).json({ error: 'الباقة المحددة غير صالحة أو غير متوفرة حالياً' });
      }

      const validPaymentMethods = ['vodafone_cash', 'instapay', 'manual_transfer'];
      const selectedMethod = validPaymentMethods.includes(payment_method) ? payment_method : 'vodafone_cash';

      const order = await db.createOrder({
        customer_name: cleanCustomerName,
        phone_number: cleanPhone,
        contact_phone: cleanContactPhone,
        package_id,
        payment_method: selectedMethod as any,
        notes: cleanNotes,
        payment_proof: cleanPaymentProof,
      });

      res.status(201).json({
        success: true,
        message: 'تم استلام طلبك بنجاح، وسيتم مراجعة الدفع وتنفيذ الشحن يدويًا.',
        order,
      });
    } catch (error: any) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: error.message || 'حدث خطأ أثناء معالجة الطلب، يرجى المحاولة لاحقاً' });
    }
  }
);

// Track Order (Customer) - Rate Limited & Masked to prevent enumeration & privacy leaks
app.get(
  '/api/orders/track/:orderNumber',
  rateLimiter(30, 60 * 1000, 'تم تجاوز حد الاستعلام عن الطلبات. يرجى الانتظار قليلاً.'),
  async (req, res) => {
    const rawOrderNumber = sanitizeText(req.params.orderNumber, 30);
    if (!rawOrderNumber) {
      return res.status(400).json({ error: 'يرجى إدخال رقم الطلب للبحث' });
    }

    try {
      const order = await db.getOrderByNumber(rawOrderNumber);
      if (!order) {
        return res.status(404).json({
          error: `لم يتم العثور على طلب برقم "${rawOrderNumber}". يرجى التأكد من الرقم والمحاولة مرة أخرى.`,
        });
      }

      // Privacy: Mask customer phone and name for public tracking
      const maskedPhone =
        order.phone_number.length >= 7
          ? order.phone_number.slice(0, 3) + '****' + order.phone_number.slice(-4)
          : '***';

      const nameParts = order.customer_name.trim().split(' ');
      const maskedName =
        nameParts.length > 1
          ? `${nameParts[0]} ${nameParts[1].charAt(0)}***`
          : `${nameParts[0].charAt(0)}***`;

      res.json({
        id: order.id,
        order_number: order.order_number,
        customer_name: maskedName,
        phone_number: maskedPhone,
        package_name: order.package_name,
        package_quota: order.package_quota,
        package_duration: order.package_duration,
        company_name: order.company_name,
        category_name: order.category_name,
        amount: order.amount,
        payment_method: order.payment_method,
        status: order.status,
        status_history: order.status_history,
        created_at: order.created_at,
        updated_at: order.updated_at,
      });
    } catch (error) {
      res.status(500).json({ error: 'حدث خطأ أثناء البحث عن الطلب' });
    }
  }
);

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

// Login with Brute Force Protection (max 5 failed attempts per IP within 15 min)
app.post(
  '/api/admin/login',
  rateLimiter(10, 15 * 60 * 1000, 'تم تجاوز عدد محاولات تسجيل الدخول. يرجى المحاولة لاحقاً.'),
  async (req, res) => {
  const ip = req.ip || 'unknown-ip';
  const now = Date.now();
  const attemptRecord = loginFailedAttempts.get(ip) || { attempts: 0, lockUntil: 0 };

  if (now < attemptRecord.lockUntil) {
    const minutesLeft = Math.ceil((attemptRecord.lockUntil - now) / 60000);
    return res.status(429).json({
      error: `تم قفل تسجيل الدخول مؤقتاً بسبب تكرار المحاولات الخاطئة. يرجى المحاولة بعد ${minutesLeft} دقيقة.`,
    });
  }

  const { email, password } = req.body;
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const admin = await db.getAdminByEmail(cleanEmail);

  if (!admin || !verifyPassword(password, admin.password_hash)) {
    attemptRecord.attempts += 1;
    if (attemptRecord.attempts >= 5) {
      attemptRecord.lockUntil = now + 15 * 60 * 1000; // 15 minutes lockout
    }
    loginFailedAttempts.set(ip, attemptRecord);
    return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
  }

  // Reset failed attempts upon successful login
  loginFailedAttempts.delete(ip);

  if (!admin.password_hash.startsWith('scrypt$')) {
    await db.updateAdminPassword(admin.id, hashPassword(password));
  }

  const token = crypto.randomBytes(32).toString('base64url');
  const nowIso = new Date().toISOString();
  await db.createAdminSession(token, admin.id, new Date(Date.now() + 30 * 60 * 1000).toISOString(), nowIso);

  res.json({
    success: true,
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    },
  });
  }
);

app.post('/api/admin/logout', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) await db.deleteAdminSession(token);
  }
  res.status(204).end();
});

app.get('/api/admin/me', requireAdmin, (req, res) => {
  const admin = (req as any).admin;
  res.json({
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    },
  });
});

app.post('/api/admin/change-password', requireAdmin, async (req, res) => {
  const admin = (req as any).admin;
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'يرجى كتابة كلمة المرور الحالية والجديدة' });
  }

  if (!verifyPassword(current_password, admin.password_hash)) {
    return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
  }

  if (typeof new_password !== 'string' || new_password.length < 8) {
    return res.status(400).json({ error: 'كلمة المرور الجديدة يجب أن لا تقل عن 8 أحرف وأرقام' });
  }

  const newHash = hashPassword(new_password);
  await db.updateAdminPassword(admin.id, newHash);

  res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
});

// ==========================================
// ADMIN DASHBOARD & ORDERS MANAGEMENT
// ==========================================

// Dashboard Statistics
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  const period = (req.query.period as any) || 'all';
  const stats = await db.getStats(period);
  res.json(stats);
});

// List all orders with filtering & search
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  const { status, company_id, search } = req.query;
  const orders = await db.getOrders({
    status: status ? String(status) : undefined,
    company_id: company_id ? String(company_id) : undefined,
    search: search ? sanitizeText(search, 50) : undefined,
  });
  res.json(orders);
});

// Single order details for admin
app.get('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  const order = (await db.getOrderById(req.params.id)) || (await db.getOrderByNumber(req.params.id));
  if (!order) {
    return res.status(404).json({ error: 'الطلب غير موجود' });
  }
  res.json(order);
});

// Update Order Status (Manual recharge fulfillment)
app.patch('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
  const { status, note } = req.body;
  const validStatuses: OrderStatus[] = [
    'new',
    'pending_payment',
    'payment_confirmed',
    'processing',
    'recharged',
    'completed',
    'cancelled',
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'حالة الطلب غير صالحة' });
  }

  const cleanNote = note ? sanitizeText(note, 300) : undefined;
  const updatedOrder = await db.updateOrderStatus(req.params.id, status, cleanNote);
  if (!updatedOrder) {
    return res.status(404).json({ error: 'لم يتم العثور على الطلب' });
  }

  res.json({
    success: true,
    message: 'تم تحديث حالة الطلب بنجاح',
    order: updatedOrder,
  });
});

// Update Order Notes
app.patch('/api/admin/orders/:id/notes', requireAdmin, async (req, res) => {
  const { notes } = req.body;
  const cleanNotes = sanitizeText(notes, 500);
  const updatedOrder = await db.updateOrderNotes(req.params.id, cleanNotes);
  if (!updatedOrder) {
    return res.status(404).json({ error: 'الطلب غير موجود' });
  }
  res.json({ success: true, order: updatedOrder });
});

// Delete Order
app.delete('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  const success = await db.deleteOrder(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'الطلب غير موجود' });
  }
  res.json({ success: true, message: 'تم حذف الطلب بنجاح' });
});

// ==========================================
// ADMIN PACKAGES MANAGEMENT
// ==========================================

app.get('/api/admin/packages', requireAdmin, async (req, res) => {
  const { company_id, category_id } = req.query;
  const packages = await db.getPackages({
    company_id: company_id ? String(company_id) : undefined,
    category_id: category_id ? String(category_id) : undefined,
    onlyActive: false,
  });
  res.json(packages);
});

app.post('/api/admin/packages', requireAdmin, async (req, res) => {
  const { name, company_id, category_id, price, cost, profit, quota, description, duration, badge, features, active } =
    req.body;

  if (!name || !company_id || !category_id || price === undefined) {
    return res.status(400).json({ error: 'يرجى إدخال اسم الباقة، والشركة، ونوع الباقة، والسعر' });
  }

  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ error: 'السعر غير صحيح' });
  }

  const parsedCost = cost !== undefined && !isNaN(parseFloat(cost)) ? parseFloat(cost) : undefined;
  const parsedProfit = profit !== undefined && !isNaN(parseFloat(profit)) ? parseFloat(profit) : undefined;

  const newPkg = await db.createPackage({
    name: sanitizeText(name, 100),
    company_id: sanitizeText(company_id, 30),
    category_id: sanitizeText(category_id, 30),
    price: parsedPrice,
    cost: parsedCost,
    profit: parsedProfit,
    quota: sanitizeText(quota, 50),
    description: sanitizeText(description, 300),
    duration: sanitizeText(duration, 50) || '30 يوم',
    badge: badge ? sanitizeText(badge, 40) : undefined,
    features: Array.isArray(features) ? features.map((f) => sanitizeText(f, 100)).filter(Boolean) : [],
    active: active !== undefined ? Boolean(active) : true,
  });

  res.status(201).json({ success: true, package: newPkg });
});

app.put('/api/admin/packages/:id', requireAdmin, async (req, res) => {
  const { name, company_id, category_id, price, cost, profit, quota, description, duration, badge, features, active } =
    req.body;

  const updates: any = {};
  if (name !== undefined) updates.name = sanitizeText(name, 100);
  if (company_id !== undefined) updates.company_id = sanitizeText(company_id, 30);
  if (category_id !== undefined) updates.category_id = sanitizeText(category_id, 30);
  if (price !== undefined) updates.price = parseFloat(price);
  if (cost !== undefined) updates.cost = parseFloat(cost);
  if (profit !== undefined) updates.profit = parseFloat(profit);
  if (quota !== undefined) updates.quota = sanitizeText(quota, 50);
  if (description !== undefined) updates.description = sanitizeText(description, 300);
  if (duration !== undefined) updates.duration = sanitizeText(duration, 50);
  if (badge !== undefined) updates.badge = sanitizeText(badge, 40);
  if (features !== undefined) {
    updates.features = Array.isArray(features) ? features.map((f) => sanitizeText(f, 100)).filter(Boolean) : [];
  }
  if (active !== undefined) updates.active = Boolean(active);

  const updated = await db.updatePackage(req.params.id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'الباقة غير موجودة' });
  }

  res.json({ success: true, package: updated });
});

app.patch('/api/admin/packages/:id/toggle', requireAdmin, async (req, res) => {
  const pkg = await db.getPackage(req.params.id);
  if (!pkg) {
    return res.status(404).json({ error: 'الباقة غير موجودة' });
  }

  const updated = await db.updatePackage(req.params.id, { active: !pkg.active });
  res.json({ success: true, package: updated });
});

app.delete('/api/admin/packages/:id', requireAdmin, async (req, res) => {
  const targetId = req.params.id;
  const success = await db.deletePackage(String(targetId));
  if (!success) {
    return res.status(404).json({ error: 'الباقة غير موجودة أو تم حذفها مسبقاً' });
  }
  res.json({ success: true, message: 'تم حذف الباقة بنجاح' });
});

// ==========================================
// ADMIN COMPANIES & CATEGORIES
// ==========================================

app.get('/api/admin/companies', requireAdmin, async (req, res) => {
  const companies = await db.getCompanies(false);
  res.json(companies);
});

app.put('/api/admin/companies/:id', requireAdmin, async (req, res) => {
  const { name, nameEn, color, active } = req.body;
  const updates: any = {};
  if (name !== undefined) updates.name = sanitizeText(name, 50);
  if (nameEn !== undefined) updates.nameEn = sanitizeText(nameEn, 50);
  if (color !== undefined) updates.color = sanitizeText(color, 20);
  if (active !== undefined) updates.active = Boolean(active);

  const updated = await db.updateCompany(req.params.id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'الشركة غير موجودة' });
  }
  res.json({ success: true, company: updated });
});

app.get('/api/admin/categories', requireAdmin, async (req, res) => {
  const categories = await db.getCategories(false);
  res.json(categories);
});

app.post('/api/admin/categories', requireAdmin, async (req, res) => {
  const { id, name, icon, active, order } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'يرجى إدخال اسم نوع الخدمة' });
  }
  const catId = id ? sanitizeText(id, 40) : `cat-${Date.now()}`;
  const newCat = await db.addCategory({
    id: catId,
    company_id: 'all',
    name: sanitizeText(name, 60),
    icon: sanitizeText(icon, 30) || 'tag',
    active: active !== undefined ? Boolean(active) : true,
    order: order || 10,
  });
  res.status(201).json({ success: true, category: newCat });
});

app.put('/api/admin/categories/:id', requireAdmin, async (req, res) => {
  const { name, icon, active, order } = req.body;
  const updates: any = {};
  if (name !== undefined) updates.name = sanitizeText(name, 60);
  if (icon !== undefined) updates.icon = sanitizeText(icon, 30);
  if (active !== undefined) updates.active = Boolean(active);
  if (order !== undefined) updates.order = Number(order);

  const updated = await db.updateCategory(req.params.id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'القسم غير موجود' });
  }
  res.json({ success: true, category: updated });
});

// ==========================================
// ADMIN SETTINGS MANAGEMENT
// ==========================================

app.get('/api/admin/settings', requireAdmin, async (req, res) => {
  const settings = await db.getSettings();
  res.json(settings);
});

app.put('/api/admin/settings', requireAdmin, async (req, res) => {
  const updates = req.body;
  const cleanUpdates: any = {};

  if (updates.site_name !== undefined) cleanUpdates.site_name = sanitizeText(updates.site_name, 100);
  if (updates.site_tagline !== undefined) cleanUpdates.site_tagline = sanitizeText(updates.site_tagline, 200);
  if (updates.logo_text !== undefined) cleanUpdates.logo_text = sanitizeText(updates.logo_text, 50);
  if (updates.vodafone_cash_number !== undefined) cleanUpdates.vodafone_cash_number = sanitizeText(updates.vodafone_cash_number, 20);
  if (updates.instapay_address !== undefined) cleanUpdates.instapay_address = sanitizeText(updates.instapay_address, 100);
  if (updates.contact_phone !== undefined) cleanUpdates.contact_phone = sanitizeText(updates.contact_phone, 20);
  if (updates.whatsapp_number !== undefined) cleanUpdates.whatsapp_number = sanitizeText(updates.whatsapp_number, 20);
  if (updates.payment_instructions !== undefined) cleanUpdates.payment_instructions = sanitizeText(updates.payment_instructions, 1000);
  if (updates.currency !== undefined) cleanUpdates.currency = sanitizeText(updates.currency, 20);
  if (updates.working_hours !== undefined) cleanUpdates.working_hours = sanitizeText(updates.working_hours, 100);
  if (updates.notice_banner !== undefined) cleanUpdates.notice_banner = sanitizeText(updates.notice_banner, 300);
  if (updates.enable_notice !== undefined) cleanUpdates.enable_notice = Boolean(updates.enable_notice);
  if (updates.show_notice_banner !== undefined) cleanUpdates.show_notice_banner = Boolean(updates.show_notice_banner);

  const updatedSettings = await db.updateSettings(cleanUpdates);
  res.json({ success: true, message: 'تم حفظ الإعدادات بنجاح', settings: updatedSettings });
});

// ==========================================
// ADMIN MONTHLY SUBSCRIBERS & RENEWALS
// ==========================================

app.get('/api/admin/subscribers', requireAdmin, async (req, res) => {
  const { company_id, onlyDue, activeOnly, search } = req.query;
  const subscribers = await db.getSubscribers({
    company_id: company_id ? String(company_id) : undefined,
    onlyDue: onlyDue === 'true',
    activeOnly: activeOnly === 'true',
    search: search ? sanitizeText(search, 50) : undefined,
  });
  res.json(subscribers);
});

app.get('/api/admin/subscribers/:id', requireAdmin, async (req, res) => {
  const sub = await db.getSubscriber(req.params.id);
  if (!sub) {
    return res.status(404).json({ error: 'العميل غير موجود' });
  }
  res.json(sub);
});

app.post('/api/admin/subscribers', requireAdmin, async (req, res) => {
  const {
    customer_name,
    phone_number,
    contact_phone,
    company_id,
    company_name,
    package_id,
    package_name,
    package_price,
    package_cost,
    package_profit,
    renewal_day,
    next_renewal_date,
    last_recharge_date,
    notes,
    auto_notify_whatsapp,
    active,
  } = req.body;

  if (!customer_name || !phone_number || !company_id || !package_name || package_price === undefined) {
    return res.status(400).json({ error: 'يرجى ملء جميع الحقول الإلزامية: اسم العميل، رقم الهاتف، الشركة، اسم الباقة، والسعر' });
  }

  const cleanPhone = String(phone_number).replace(/\s+/g, '').replace(/[^0-9+]/g, '');
  const parsedPrice = parseFloat(package_price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ error: 'سعر الباقة غير صحيح' });
  }

  const parsedRenewalDay = renewal_day ? parseInt(renewal_day, 10) : new Date().getDate();

  const newSub = await db.createSubscriber({
    customer_name: sanitizeText(customer_name, 80),
    phone_number: cleanPhone,
    contact_phone: contact_phone ? sanitizeText(contact_phone, 20) : undefined,
    company_id: sanitizeText(company_id, 30),
    company_name: company_name ? sanitizeText(company_name, 50) : undefined,
    package_id: package_id ? sanitizeText(package_id, 50) : undefined,
    package_name: sanitizeText(package_name, 100),
    package_price: parsedPrice,
    package_cost: package_cost !== undefined ? parseFloat(package_cost) : undefined,
    package_profit: package_profit !== undefined ? parseFloat(package_profit) : undefined,
    renewal_day: parsedRenewalDay,
    next_renewal_date: next_renewal_date ? sanitizeText(next_renewal_date, 20) : '',
    last_recharge_date: last_recharge_date ? sanitizeText(last_recharge_date, 40) : undefined,
    notes: notes ? sanitizeText(notes, 400) : undefined,
    auto_notify_whatsapp: auto_notify_whatsapp !== undefined ? Boolean(auto_notify_whatsapp) : true,
    active: active !== undefined ? Boolean(active) : true,
  });

  res.status(201).json({ success: true, subscriber: newSub });
});

app.put('/api/admin/subscribers/:id', requireAdmin, async (req, res) => {
  const updates = req.body;
  const cleanUpdates: any = {};

  if (updates.customer_name !== undefined) cleanUpdates.customer_name = sanitizeText(updates.customer_name, 80);
  if (updates.phone_number !== undefined) cleanUpdates.phone_number = String(updates.phone_number).replace(/\s+/g, '').replace(/[^0-9+]/g, '');
  if (updates.contact_phone !== undefined) cleanUpdates.contact_phone = sanitizeText(updates.contact_phone, 20);
  if (updates.company_id !== undefined) cleanUpdates.company_id = sanitizeText(updates.company_id, 30);
  if (updates.company_name !== undefined) cleanUpdates.company_name = sanitizeText(updates.company_name, 50);
  if (updates.package_id !== undefined) cleanUpdates.package_id = sanitizeText(updates.package_id, 50);
  if (updates.package_name !== undefined) cleanUpdates.package_name = sanitizeText(updates.package_name, 100);
  if (updates.package_price !== undefined) cleanUpdates.package_price = parseFloat(updates.package_price);
  if (updates.package_cost !== undefined) cleanUpdates.package_cost = parseFloat(updates.package_cost);
  if (updates.package_profit !== undefined) cleanUpdates.package_profit = parseFloat(updates.package_profit);
  if (updates.renewal_day !== undefined) cleanUpdates.renewal_day = parseInt(updates.renewal_day, 10);
  if (updates.next_renewal_date !== undefined) cleanUpdates.next_renewal_date = sanitizeText(updates.next_renewal_date, 20);
  if (updates.notes !== undefined) cleanUpdates.notes = sanitizeText(updates.notes, 400);
  if (updates.auto_notify_whatsapp !== undefined) cleanUpdates.auto_notify_whatsapp = Boolean(updates.auto_notify_whatsapp);
  if (updates.active !== undefined) cleanUpdates.active = Boolean(updates.active);

  const updated = await db.updateSubscriber(req.params.id, cleanUpdates);
  if (!updated) {
    return res.status(404).json({ error: 'العميل غير موجود' });
  }

  res.json({ success: true, subscriber: updated });
});

// Record direct recharge renewal & push date 1 month
app.post('/api/admin/subscribers/:id/renew', requireAdmin, async (req, res) => {
  const { payment_method, admin_notes } = req.body;
  const result = await db.renewSubscriberRecharge(req.params.id, {
    payment_method: payment_method ? sanitizeText(payment_method, 30) : undefined,
    admin_notes: admin_notes ? sanitizeText(admin_notes, 300) : undefined,
  });
  if (!result) {
    return res.status(404).json({ error: 'فشل تنفيذ عملية التجديد، العميل غير موجود' });
  }

  res.json({
    success: true,
    message: 'تم تسجيل شحن الباقة وتجديد الموعد للشهر القادم بنجاح',
    subscriber: result.subscriber,
    order: result.order,
  });
});

app.delete('/api/admin/subscribers/:id', requireAdmin, async (req, res) => {
  const success = await db.deleteSubscriber(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'العميل غير موجود' });
  }
  res.json({ success: true, message: 'تم حذف العميل من قائمة الاشتراكات الشهرية بنجاح' });
});

// ------------------------------------------
// DATA MANAGEMENT & CLEANING ENDPOINTS
// ------------------------------------------

app.get('/api/admin/data/counts', requireAdmin, async (req, res) => {
  const counts = await db.getDataCounts();
  res.json(counts);
});

app.post('/api/admin/data/clear-orders', requireAdmin, async (req, res) => {
  const result = await db.clearAllOrders();
  res.json({
    success: true,
    message: `تم مسح جميع الطلبات بنجاح (${result.count} طلب)`,
    deletedCount: result.count,
  });
});

app.post('/api/admin/data/clear-subscribers', requireAdmin, async (req, res) => {
  const result = await db.clearAllSubscribers();
  res.json({
    success: true,
    message: `تم مسح جميع المشتركين بنجاح (${result.count} مشترك)`,
    deletedCount: result.count,
  });
});

app.post('/api/admin/data/clear-packages', requireAdmin, async (req, res) => {
  const result = await db.clearAllPackages();
  res.json({
    success: true,
    message: `تم مسح كافة الباقات من المتجر بنجاح (${result.count} باقة)`,
    deletedCount: result.count,
  });
});

app.post('/api/admin/data/restore-packages', requireAdmin, async (req, res) => {
  const result = await db.restoreDefaultPackages();
  res.json({
    success: true,
    message: `تمت استعادة باقات الشركات الافتراضية بنجاح (${result.count} باقة)`,
    count: result.count,
  });
});

app.post('/api/admin/data/clear-all', requireAdmin, async (req, res) => {
  const includePackages = Boolean(req.body.includePackages);
  const result = await db.clearAllData(includePackages);
  res.json({
    success: true,
    message: 'تم تفريغ وحذف بيانات الموقع بنجاح',
    ...result,
  });
});

// ==========================================
// VITE SPA MIDDLEWARE / STATIC ASSETS
// ==========================================

async function startServer() {
  // Initialize database tables & baseline data
  try {
    await db.getSettings();
    console.log('PostgreSQL database connected and verified.');
  } catch (dbErr) {
    console.error('Database connection warning:', dbErr);
  }

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Manual Recharge Platform running on http://localhost:${PORT}`);
  });
}

// In standard environments (local, Docker, Cloud Run, Render, Railway), start server directly
if (!process.env.VERCEL) {
  startServer();
}

export default app;
export { app };
