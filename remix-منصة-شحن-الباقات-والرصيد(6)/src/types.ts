export type CompanyId = 'vodafone' | 'orange' | 'etisalat' | 'we';

export interface Company {
  id: CompanyId | string;
  name: string;
  nameEn: string;
  logo: string;
  color: string;
  accentColor: string;
  bgLight: string;
  borderLight: string;
  active: boolean;
  order: number;
  created_at: string;
}

export interface Category {
  id: string;
  company_id: string; // 'all' or specific company id
  name: string;
  nameEn?: string;
  icon: string;
  active: boolean;
  order: number;
}

export interface Package {
  id: string;
  company_id: string;
  category_id: string;
  name: string;
  price: number;
  cost?: number; // سعر التكلفة
  profit?: number; // صافي الربح
  quota?: string;
  description: string;
  duration: string;
  badge?: string;
  features?: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'new'
  | 'pending_payment'
  | 'payment_confirmed'
  | 'processing'
  | 'recharged'
  | 'completed'
  | 'cancelled';

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone_number: string;
  contact_phone?: string;
  package_id: string;
  package_name: string;
  package_price: number;
  package_cost?: number;
  package_profit?: number;
  package_quota?: string;
  package_duration?: string;
  company_id: string;
  company_name: string;
  category_id?: string;
  category_name?: string;
  payment_method: 'vodafone_cash' | 'instapay' | 'manual_transfer';
  amount: number;
  notes?: string;
  status: OrderStatus;
  status_history: StatusHistoryItem[];
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface SiteSettings {
  site_name: string;
  site_tagline: string;
  logo_text: string;
  vodafone_cash_number: string;
  instapay_address: string;
  contact_phone: string;
  whatsapp_number: string;
  payment_instructions: string;
  currency: string;
  working_hours: string;
  notice_banner: string;
  enable_notice: boolean;
  show_notice_banner?: boolean;
}

export interface MonthlySubscriber {
  id: string;
  customer_name: string;
  phone_number: string;
  contact_phone?: string;
  company_id: string;
  company_name?: string;
  package_id?: string;
  package_name: string;
  package_price: number;
  package_cost?: number;
  package_profit?: number;
  renewal_day: number; // Day of the month (1-31)
  last_recharge_date?: string; // ISO string
  next_renewal_date: string; // YYYY-MM-DD
  active: boolean;
  notes?: string;
  auto_notify_whatsapp?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalOrders: number;
  newOrders: number;
  pendingPaymentOrders: number;
  processingOrders: number;
  rechargedOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number; // Percentage %
  uniqueCustomers: number;
  todayOrders: number;
  todaySales: number;
  todayCost: number;
  todayProfit: number;
  dueRenewalsCount?: number; // subscribers due today or overdue
  recentOrders: Order[];
  companyBreakdown: {
    companyId: string;
    companyName: string;
    count: number;
    sales: number;
    cost: number;
    profit: number;
  }[];
  topPackages?: {
    packageId: string;
    packageName: string;
    companyId: string;
    count: number;
    totalSales: number;
    totalCost: number;
    totalProfit: number;
  }[];
}
