import { pgTable, text, integer, doublePrecision, boolean, jsonb } from 'drizzle-orm/pg-core';

// Admins Table
export const admins = pgTable('admins', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
});

// Platform Settings Table
export const settings = pgTable('settings', {
  id: text('id').primaryKey(), // 'default'
  siteName: text('site_name'),
  siteTagline: text('site_tagline'),
  logoText: text('logo_text'),
  vodafoneCashNumber: text('vodafone_cash_number'),
  instapayAddress: text('instapay_address'),
  contactPhone: text('contact_phone'),
  whatsappNumber: text('whatsapp_number'),
  paymentInstructions: text('payment_instructions'),
  currency: text('currency'),
  workingHours: text('working_hours'),
  noticeBanner: text('notice_banner'),
  enableNotice: boolean('enable_notice').default(true),
  showNoticeBanner: boolean('show_notice_banner').default(true),
  data: jsonb('data').$type<Record<string, any>>(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Telecom Companies Table
export const companies = pgTable('companies', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  nameEn: text('name_en').notNull(),
  color: text('color').notNull(),
  accentColor: text('accent_color'),
  bgLight: text('bg_light'),
  borderLight: text('border_light'),
  active: boolean('active').notNull().default(true),
  logo: text('logo'),
  order: integer('order').notNull().default(0),
  createdAt: text('created_at'),
});

// Service Categories Table
export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull().default('all'),
  name: text('name').notNull(),
  nameEn: text('name_en'),
  icon: text('icon').notNull().default('tag'),
  active: boolean('active').notNull().default(true),
  order: integer('order').notNull().default(0),
});

// Packages Table
export const packages = pgTable('packages', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  companyId: text('company_id').notNull(),
  categoryId: text('category_id').notNull(),
  price: doublePrecision('price').notNull(),
  cost: doublePrecision('cost'),
  profit: doublePrecision('profit'),
  quota: text('quota').notNull(),
  description: text('description').notNull(),
  duration: text('duration').notNull().default('30 يوم'),
  badge: text('badge'),
  features: jsonb('features').notNull().$type<string[]>(),
  active: boolean('active').notNull().default(true),
  order: integer('order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Recharge Orders Table
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  customerName: text('customer_name').notNull(),
  phoneNumber: text('phone_number').notNull(),
  contactPhone: text('contact_phone'),
  packageId: text('package_id').notNull(),
  packageName: text('package_name').notNull(),
  packagePrice: doublePrecision('package_price').notNull(),
  packageCost: doublePrecision('package_cost'),
  packageProfit: doublePrecision('package_profit'),
  packageQuota: text('package_quota'),
  packageDuration: text('package_duration'),
  companyId: text('company_id').notNull(),
  companyName: text('company_name').notNull(),
  categoryId: text('category_id').notNull(),
  categoryName: text('category_name').notNull(),
  paymentMethod: text('payment_method').notNull(),
  amount: doublePrecision('amount').notNull(),
  notes: text('notes'),
  adminNotes: text('admin_notes'),
  status: text('status').notNull().default('new'),
  statusHistory: jsonb('status_history').notNull().$type<{ status: string; timestamp: string; note?: string }[]>(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Monthly Subscribers Table
export const subscribers = pgTable('subscribers', {
  id: text('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  phoneNumber: text('phone_number').notNull(),
  contactPhone: text('contact_phone'),
  companyId: text('company_id').notNull(),
  companyName: text('company_name'),
  packageId: text('package_id'),
  packageName: text('package_name').notNull(),
  packagePrice: doublePrecision('package_price').notNull(),
  packageCost: doublePrecision('package_cost'),
  packageProfit: doublePrecision('package_profit'),
  renewalDay: integer('renewal_day').notNull(),
  nextRenewalDate: text('next_renewal_date').notNull(),
  lastRechargeDate: text('last_recharge_date'),
  notes: text('notes'),
  autoNotifyWhatsapp: boolean('auto_notify_whatsapp').notNull().default(true),
  active: boolean('active').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Global Sequence / Counter Table
export const counters = pgTable('counters', {
  id: text('id').primaryKey(),
  counter: integer('counter').notNull().default(1),
});
