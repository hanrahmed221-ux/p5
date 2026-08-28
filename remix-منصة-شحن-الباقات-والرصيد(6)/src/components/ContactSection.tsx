import React, { useState } from 'react';
import { SiteSettings } from '../types';
import {
  Phone,
  MessageCircle,
  Clock,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Zap,
  Wallet,
  CheckCircle2,
} from 'lucide-react';

interface ContactSectionProps {
  settings: SiteSettings | null;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'كيف تتم عملية الشحن اليدوي؟',
      a: 'تتم عملية الشحن يدوياً وبأمان تام؛ بعد اختيارك للباقة وإرسال الطلب، تقوم بتحويل القيمة المطلوبة إلى رقم فودافون كاش أو حساب إنستاباي الموضح، ليقوم المشرف بالتحقق من الحوالة وتنفيذ الشحن مباشرة على خطك.',
    },
    {
      q: 'كم يستغرق تنفيذ الشحن؟',
      a: 'في أوقات العمل الرسمية، تتم مراجعة التحويل وشحن الخط في غضون 2 إلى 10 دقائق كحد أقصى مع تحديث حالة الطلب لحظياً.',
    },
    {
      q: 'هل أحتاج لإنشاء حساب أو كلمة مرور على الموقع؟',
      a: 'لا، المنصة مصممة لتكون فورية وبسيطة للجميع دون الحاجة لتسجيل حساب؛ فقط اختر الباقة وأدخل رقمك، وستحصل على رقم طلب (Order Number) لتتبعه في أي وقت.',
    },
    {
      q: 'كيف أؤكد وأثبت أنني قمت بالتحويل؟',
      a: 'يمكنك كتابة رقم المحفظة التي حولت منها في خانة الملاحظات، أو الضغط على زر واتساب بعد إتمام الطلب لإرسال سكرين شوت التحويل مع رقم طلبك.',
    },
    {
      q: 'ماذا لو أدخلت رقم هاتف بالخطأ؟',
      a: 'إذا كان الطلب في حالة "جديد" أو "في انتظار الدفع" ولم يُشحن بعد، تواصل فوراً مع الدعم الفني عبر واتساب لتعديل الرقم قبل التنفيذ.',
    },
  ];

  return (
    <div id="contact-section" className="w-full space-y-8 sm:space-y-12 py-4">
      {/* Contact Cards Grid: 3 columns on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full">
        {/* WhatsApp Direct */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-5 hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 fill-emerald-600 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">دعم واتساب الفوري</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                تواصل معنا مباشرة عبر واتساب لأي استفسار أو إرسال إيصال التحويل المالي
              </p>
            </div>
          </div>

          {settings?.whatsapp_number && (
            <a
              id="contact-whatsapp-link"
              href={`https://wa.me/${settings.whatsapp_number.replace(/\+/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 hover:scale-102 active:scale-98"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>محادثة واتساب سريعة</span>
            </a>
          )}
        </div>

        {/* Vodafone Cash & Payment Info */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-5 hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">محافظ التحويل المعتمدة</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                رقم المحفظة الرسمي المعتمد لاستقبال التحويلات اليدوية:
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-bold">فودافون كاش:</span>
              <span className="font-mono font-black text-slate-900 text-sm sm:text-base" dir="ltr">
                {settings?.vodafone_cash_number || '010XXXXXXXX'}
              </span>
            </div>
            {settings?.instapay_address && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                <span className="text-[11px] text-purple-700 font-bold">إنستاباي:</span>
                <span className="text-xs sm:text-sm text-purple-900 font-mono font-bold" dir="ltr">
                  {settings.instapay_address}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-5 hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">مواعيد العمل والتنفيذ</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                {settings?.working_hours || 'يومياً من 9:00 صباحاً حتى 1:00 بعد منتصف الليل'}
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-xs text-emerald-900 font-extrabold flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>نستقبل الطلبات 24 ساعة وننفذها في ساعات العمل</span>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">الأسئلة الشائعة حول خدمة الشحن</h3>
            <p className="text-xs sm:text-sm text-slate-500">إجابات سريعة وواضحة على أكثر الاستفسارات تكراراً</p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200/80 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  id={`faq-toggle-btn-${idx}`}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 bg-slate-50/60 hover:bg-slate-100/80 text-right font-black text-xs sm:text-sm text-slate-900 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-emerald-600 font-black">•</span>
                    <span>{item.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="p-4 sm:p-5 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-150 font-medium">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
