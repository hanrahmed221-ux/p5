import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../../types';
import { api } from '../../services/api';
import {
  Settings,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageCircle,
  CreditCard,
  Clock,
  Shield,
  KeyRound,
  Globe,
  BellRing,
  Trash2,
  RotateCcw,
  Database,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

interface SettingsTabProps {
  settings: SiteSettings | null;
  onSettingsUpdated: (newSettings: SiteSettings) => void;
  onDataChanged?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onSettingsUpdated,
  onDataChanged,
}) => {
  const [siteName, setSiteName] = useState(settings?.site_name || 'شحن تك');
  const [siteTagline, setSiteTagline] = useState(
    settings?.site_tagline || 'شحن باقات ورصيد فوري لجميع الشبكات المصرية'
  );
  const [vodafoneCashNumber, setVodafoneCashNumber] = useState(
    settings?.vodafone_cash_number || '01012345678'
  );
  const [instapayAddress, setInstapayAddress] = useState(
    settings?.instapay_address || 'recharge@instapay'
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    settings?.whatsapp_number || '+201012345678'
  );
  const [contactPhone, setContactPhone] = useState(settings?.contact_phone || '01012345678');
  const [workingHours, setWorkingHours] = useState(
    settings?.working_hours || 'يومياً من 9:00 صباحاً حتى 1:00 بعد منتصف الليل'
  );
  const [currency, setCurrency] = useState(settings?.currency || 'جنيه');
  const [noticeBanner, setNoticeBanner] = useState(settings?.notice_banner || '');
  const [showNoticeBanner, setShowNoticeBanner] = useState(settings?.show_notice_banner || false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingSettings, setSavingSettings] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Data Management states
  const [dataCounts, setDataCounts] = useState<{
    ordersCount: number;
    subscribersCount: number;
    packagesCount: number;
    companiesCount: number;
  }>({ ordersCount: 0, subscribersCount: 0, packagesCount: 0, companiesCount: 0 });
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dataMessage, setDataMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    action: 'clear_orders' | 'clear_subscribers' | 'clear_all' | 'restore_packages';
    title: string;
    description: string;
    includePackages?: boolean;
  } | null>(null);
  const [includePackagesInWipe, setIncludePackagesInWipe] = useState(false);

  const fetchCounts = async () => {
    try {
      setLoadingCounts(true);
      const counts = await api.getDataCounts();
      setDataCounts(counts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCounts(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const handleExecuteAction = async () => {
    if (!confirmModal) return;
    const { action, includePackages } = confirmModal;
    setConfirmModal(null);
    setDataMessage(null);
    setActionLoading(action);

    try {
      if (action === 'clear_orders') {
        const res = await api.clearAllOrders();
        setDataMessage({ type: 'success', text: `تم مسح جميع الطلبات بنجاح (${res.count} طلب)` });
      } else if (action === 'clear_subscribers') {
        const res = await api.clearAllSubscribers();
        setDataMessage({ type: 'success', text: `تم مسح جميع المشتركين بنجاح (${res.count} مشترك)` });
      } else if (action === 'clear_all') {
        const res = await api.clearAllData(Boolean(includePackages));
        setDataMessage({
          type: 'success',
          text: `تم تفريغ كافة البيانات بنجاح: تم حذف ${res.ordersDeleted} طلب و ${res.subscribersDeleted} مشترك${res.packagesDeleted ? ` و ${res.packagesDeleted} باقة` : ''}`,
        });
      } else if (action === 'restore_packages') {
        const res = await api.restoreDefaultPackages();
        setDataMessage({ type: 'success', text: `تمت استعادة باقات الشركات الافتراضية بنجاح (${res.count} باقة)` });
      }

      await fetchCounts();
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      setDataMessage({ type: 'error', text: err.message || 'حدث خطأ أثناء تنفيذ العملية' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setDataMessage(null), 5000);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess('');
    setSettingsError('');

    try {
      setSavingSettings(true);
      const updated = await api.updateSettings({
        site_name: siteName.trim(),
        site_tagline: siteTagline.trim(),
        vodafone_cash_number: vodafoneCashNumber.trim(),
        instapay_address: instapayAddress.trim(),
        whatsapp_number: whatsappNumber.trim(),
        contact_phone: contactPhone.trim(),
        working_hours: workingHours.trim(),
        currency: currency.trim() || 'جنيه',
        notice_banner: noticeBanner.trim(),
        enable_notice: showNoticeBanner,
        show_notice_banner: showNoticeBanner,
      });

      onSettingsUpdated(updated);
      setSettingsSuccess('تم حفظ إعدادات المنصة بنجاح!');
      setTimeout(() => setSettingsSuccess(''), 3500);
    } catch (err: any) {
      setSettingsError(err.message || 'فشل حفظ الإعدادات');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('كلمتا المرور غير متطابقتين');
      return;
    }

    try {
      setChangingPassword(true);
      await api.changeAdminPassword(currentPassword, newPassword);
      setPasswordSuccess('تم تغيير كلمة المرور بنجاح! احتفظ بها في مكان آمن.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'فشل تغيير كلمة المرور');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Settings Form */}
      <form
        onSubmit={handleSaveSettings}
        className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">إعدادات الموقع والمحافظ</h3>
            <p className="text-xs text-slate-500">
              تحديد أرقام فودافون كاش، إنستاباي، والواتساب التي تظهر للعملاء في واجهة الشحن
            </p>
          </div>
        </div>

        {/* Alerts */}
        {settingsSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{settingsSuccess}</span>
          </div>
        )}

        {settingsError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{settingsError}</span>
          </div>
        )}

        {/* General Info */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>معلومات وهوية المنصة</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الموقع:</label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">العملة:</label>
              <input
                type="text"
                required
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">وصف المنصة / الشعار:</label>
            <input
              type="text"
              value={siteTagline}
              onChange={(e) => setSiteTagline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Payment Transfer Credentials */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>بيانات استلام التحويلات المالية من العملاء</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <span>رقم فودافون كاش الرسمي:</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                dir="ltr"
                required
                value={vodafoneCashNumber}
                onChange={(e) => setVodafoneCashNumber(e.target.value)}
                placeholder="01012345678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-left"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                يظهر للعميل في نافذة الدفع مع زر نسخ مباشر
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                عنوان أو رقم إنستاباي InstaPay:
              </label>
              <input
                type="text"
                dir="ltr"
                value={instapayAddress}
                onChange={(e) => setInstapayAddress(e.target.value)}
                placeholder="username@instapay"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-left"
              />
            </div>
          </div>
        </div>

        {/* Contact & Support */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>بيانات التواصل وخدمة العملاء</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم واتساب الرسمي للدعم:
              </label>
              <input
                type="text"
                dir="ltr"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+201012345678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">مواعيد وساعات العمل:</label>
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                placeholder="يومياً من 9 صباحاً حتى 1 بعد منتصف الليل"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Notice Banner */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5 text-amber-500" />
              <span>شريط الإعلانات والتنبيهات أعلى الموقع</span>
            </h4>

            <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={showNoticeBanner}
                onChange={(e) => setShowNoticeBanner(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>تفعيل الشريط</span>
            </label>
          </div>

          {showNoticeBanner && (
            <input
              type="text"
              value={noticeBanner}
              onChange={(e) => setNoticeBanner(e.target.value)}
              placeholder="مثال: خصم خاص 10% اليوم على كافة باقات فودافون إنترنت!"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-amber-50/50 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          )}
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            id="save-site-settings-btn"
            disabled={savingSettings}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>حفظ كافة الإعدادات</span>
          </button>
        </div>
      </form>

      {/* Admin Password Change Form */}
      <form
        onSubmit={handleChangePassword}
        className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">تغيير كلمة مرور الإدارة</h3>
            <p className="text-xs text-slate-500">قم بتحديث كلمة المرور لحماية حساب المسؤول</p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              كلمة المرور الحالية:
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              كلمة المرور الجديدة:
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              تأكيد كلمة المرور الجديدة:
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            id="change-password-submit-btn"
            disabled={changingPassword}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {changingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
            <span>تحديث كلمة المرور</span>
          </button>
        </div>
      </form>

      {/* Data Management & Cleaning Section */}
      <div id="admin-data-management-card" className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                إدارة وتفريغ بيانات الموقع
              </h3>
              <p className="text-xs text-slate-500">
                التحكم المباشر في تفريغ قاعدة البيانات، مسح الطلبات والمشتركين، وإعادة ضبط النظام
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchCounts}
            disabled={loadingCounts}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all self-start sm:self-auto cursor-pointer"
            title="تحديث عدد السجلات"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingCounts ? 'animate-spin' : ''}`} />
            <span>تحديث العداد</span>
          </button>
        </div>

        {/* Status Message */}
        {dataMessage && (
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold ${
              dataMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {dataMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{dataMessage.text}</span>
          </div>
        )}

        {/* Current Database Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 text-center">
            <span className="text-[11px] text-slate-500 block mb-1">عدد الطلبات</span>
            <span className="text-xl font-black text-slate-900 font-mono">
              {loadingCounts ? '...' : dataCounts.ordersCount}
            </span>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 text-center">
            <span className="text-[11px] text-slate-500 block mb-1">المشتركين الشهريين</span>
            <span className="text-xl font-black text-slate-900 font-mono">
              {loadingCounts ? '...' : dataCounts.subscribersCount}
            </span>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 text-center">
            <span className="text-[11px] text-slate-500 block mb-1">باقات الخدمات</span>
            <span className="text-xl font-black text-slate-900 font-mono">
              {loadingCounts ? '...' : dataCounts.packagesCount}
            </span>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 text-center">
            <span className="text-[11px] text-slate-500 block mb-1">الشركات والشبكات</span>
            <span className="text-xl font-black text-slate-900 font-mono">
              {loadingCounts ? '...' : dataCounts.companiesCount}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Clear Orders */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>مسح وتفريغ سجل الطلبات</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                حذف جميع طلبات الشحن المسجلة وإعادة عداد أرقام الطلبات إلى البداية (#1).
              </p>
            </div>
            <button
              type="button"
              id="btn-clear-orders"
              onClick={() =>
                setConfirmModal({
                  action: 'clear_orders',
                  title: 'هل أنت متأكد من مسح جميع الطلبات؟',
                  description: `سيتم حذف ${dataCounts.ordersCount} طلب نهائياً وإعادة ترقيم الطلبات الجديدة من رقم 1. لن يمكن التراجع عن هذا الإجراء.`,
                })
              }
              disabled={actionLoading !== null || dataCounts.ordersCount === 0}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200/80 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              {actionLoading === 'clear_orders' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>مسح الطلبات ({dataCounts.ordersCount})</span>
            </button>
          </div>

          {/* Clear Subscribers */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>مسح المشتركين الشهريين</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                حذف قائمة عملاء التجديد الشهري وإلغاء تنبيهات التجديد المستحقة.
              </p>
            </div>
            <button
              type="button"
              id="btn-clear-subscribers"
              onClick={() =>
                setConfirmModal({
                  action: 'clear_subscribers',
                  title: 'هل أنت متأكد من مسح جميع المشتركين؟',
                  description: `سيتم حذف ${dataCounts.subscribersCount} مشترك شهري نهائياً من قاعدة البيانات.`,
                })
              }
              disabled={actionLoading !== null || dataCounts.subscribersCount === 0}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200/80 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              {actionLoading === 'clear_subscribers' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>مسح المشتركين ({dataCounts.subscribersCount})</span>
            </button>
          </div>

          {/* Restore Packages */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
                <span>استعادة باقات الاتصالات الافتراضية</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                إعادة تعيين باقات فودافون وأورنج واتصالات وWE الرسمية (15 باقة مجهزة بهوامش الربح).
              </p>
            </div>
            <button
              type="button"
              id="btn-restore-packages"
              onClick={() =>
                setConfirmModal({
                  action: 'restore_packages',
                  title: 'استعادة الباقات الافتراضية للشركات؟',
                  description: 'سيتم تحديث قائمة الباقات بالباقات الافتراضية المعتمدة لشركات المحمول الأربعة بأسعار وتكاليف محسوبة.',
                })
              }
              disabled={actionLoading !== null}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-teal-50 text-teal-700 font-bold text-xs border border-teal-200/80 transition-all cursor-pointer disabled:opacity-40 shadow-2xs"
            >
              {actionLoading === 'restore_packages' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              <span>استعادة الباقات الافتراضية</span>
            </button>
          </div>

          {/* Full Wipe */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>تفريغ شامل لكافة بيانات الموقع</span>
              </h4>
              <p className="text-[11px] text-rose-700/80 mt-1 leading-relaxed">
                تصفير فوري لجميع الطلبات والمشتركين وجعل الموقع خالياً تماماً وجاهزاً لاستقبال طلبات حقيقية جديدة.
              </p>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-semibold text-rose-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePackagesInWipe}
                  onChange={(e) => setIncludePackagesInWipe(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
                />
                <span>حذف باقات المتجر أيضاً وتفريغها</span>
              </label>

              <button
                type="button"
                id="btn-clear-all-data"
                onClick={() =>
                  setConfirmModal({
                    action: 'clear_all',
                    includePackages: includePackagesInWipe,
                    title: 'تأكيد التفريغ الشامل لكافة بيانات الموقع؟',
                    description: `سيتم حذف جميع الطلبات والمشتركين${
                      includePackagesInWipe ? ' وباقات المتجر' : ''
                    }، وتصفير عداد الطلبات. هذا الإجراء نهائي ولا يمكن التراجع عنه.`,
                  })
                }
                disabled={actionLoading !== null}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {actionLoading === 'clear_all' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>تنفيذ التفريغ الشامل الآن</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-right space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto sm:mr-0 sm:ml-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">
                {confirmModal.title}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {confirmModal.description}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer"
              >
                نعم، تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Database & Deployment Info */}
      <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                حالة قاعدة البيانات السحابية والنشر
              </h3>
              <p className="text-xs text-emerald-300/80">
                Google Cloud Firestore متصل بنجاح وجاهز للنشر المباشر
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            سحابي متصل
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 bg-white/5 rounded-xl p-4 border border-white/10">
          <div>
            <span className="text-slate-400 block mb-0.5">معرف المشروع السحابي:</span>
            <span className="font-mono text-emerald-300 font-semibold">intricate-router-lxctm</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">نوع قاعدة البيانات:</span>
            <span className="font-semibold text-white">Firestore Cloud NoSQL</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">حالة الحفظ:</span>
            <span className="text-emerald-300 font-semibold">حفظ دائم ومباشر (Real-time)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
