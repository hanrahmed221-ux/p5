import React from 'react';
import { Zap, ShieldCheck, Clock, Smartphone, Search, ArrowDown, Sparkles, CheckCircle2 } from 'lucide-react';
import { SiteSettings } from '../types';

interface HeroSectionProps {
  settings: SiteSettings | null;
  onSelectCompany: (companyId: string) => void;
  onTrackOrderClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  onSelectCompany,
  onTrackOrderClick,
}) => {
  const handleScrollToPackages = () => {
    const el = document.getElementById('packages-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative overflow-hidden w-full rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white border border-slate-800/80 shadow-2xl p-6 sm:p-10 lg:p-14 transition-all">
      {/* Background glow meshes */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32" />

      {/* Grid line background overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      <div className="relative z-10 w-full flex flex-col items-center text-center space-y-6 sm:space-y-8 max-w-5xl mx-auto">
        {/* Top Tagline Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-bold tracking-wide shadow-xs">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>المنصة الأسرع لشحن باقات الإنترنت والرصيد لجميع شبكات مصر</span>
        </div>

        {/* Main Hero Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl 2xl:text-7xl font-black text-white tracking-tight leading-tight sm:leading-none">
          شحن باقات ورصيد فوري <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
            بأسهل وأأمن طريقة
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          اختر باقتك المفضلة لشبكات <strong className="text-white">فودافون</strong>، <strong className="text-white">أورنج</strong>، <strong className="text-white">اتصالات</strong>، أو <strong className="text-white">WE</strong>، وحوّل القيمة عبر فودافون كاش أو إنستاباي، ليتم الشحن اليدوي الفوري على خطك ومتابعة الطلب خطوة بخطوة.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto pt-2">
          <button
            id="hero-explore-packages-btn"
            onClick={handleScrollToPackages}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-emerald-500/25 hover:scale-102 active:scale-98 transition-all duration-150 cursor-pointer"
          >
            <span>اختر باقتك واشحن خطك الآن</span>
            <ArrowDown className="w-4 h-4" />
          </button>

          <button
            id="hero-track-order-btn"
            onClick={onTrackOrderClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer hover:border-slate-600"
          >
            <Search className="w-4 h-4 text-emerald-400" />
            <span>تتبع حالة طلبك بالرقم</span>
          </button>
        </div>

        {/* Network Badges Pill Bar */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs w-full">
          <span className="text-slate-400 font-bold ml-1">الشبكات المدعومة:</span>
          
          <button
            onClick={() => onSelectCompany('vodafone')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/70 border border-red-800/80 text-red-300 font-extrabold hover:bg-red-900/80 transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>فودافون Vodafone</span>
          </button>

          <button
            onClick={() => onSelectCompany('orange')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-950/70 border border-orange-800/80 text-orange-300 font-extrabold hover:bg-orange-900/80 transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>أورنج Orange</span>
          </button>

          <button
            onClick={() => onSelectCompany('etisalat')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-950/70 border border-lime-800/80 text-lime-300 font-extrabold hover:bg-lime-900/80 transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-lime-500" />
            <span>اتصالات Etisalat</span>
          </button>

          <button
            onClick={() => onSelectCompany('we')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-800/80 text-purple-300 font-extrabold hover:bg-purple-900/80 transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>المصرية للاتصالات WE</span>
          </button>
        </div>
      </div>

      {/* 3 Steps Mini Bento Grid */}
      <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 w-full">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex items-start gap-4 backdrop-blur-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-base shrink-0">
            ١
          </div>
          <div className="text-right">
            <h3 className="font-extrabold text-white text-sm sm:text-base">اختر الشركة والباقة</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              تصفح باقات الإنترنت وفليكسات المكالمات أو شحن الرصيد بأفضل الأسعار.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex items-start gap-4 backdrop-blur-xs">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black text-base shrink-0">
            ٢
          </div>
          <div className="text-right">
            <h3 className="font-extrabold text-white text-sm sm:text-base">أدخل الرقم وحوّل القيمة</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              اكتب رقم هاتفك وحول القيمة عبر فودافون كاش أو إنستاباي بنسخ فوري.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex items-start gap-4 backdrop-blur-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-base shrink-0">
            ٣
          </div>
          <div className="text-right">
            <h3 className="font-extrabold text-white text-sm sm:text-base">تنفيذ يدوي فوري ومتابعة</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              يراجع المسؤول الحوالة ويشحن خطك في دقائق مع تتبع لحظي لحالة الطلب.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
