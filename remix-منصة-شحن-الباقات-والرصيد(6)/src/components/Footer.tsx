import * as React from 'react';
import { SiteSettings } from '../types';
import { Zap, Shield } from 'lucide-react';

interface FooterProps {
  settings: SiteSettings | null;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenAdmin }) => {
  return (
    <footer className="w-full bg-slate-950 text-slate-400 text-xs border-t border-slate-800/80 mt-16 sm:mt-24">
      <div className="w-full max-w-[1720px] 2xl:max-w-[1840px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-12 py-10 sm:py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <span className="font-black text-white text-base block">
                {settings?.site_name || 'شحن تك'}
              </span>
              <span className="text-xs text-slate-400">
                {settings?.site_tagline || 'شحن باقات ورصيد فوري لجميع الشبكات المصرية'}
              </span>
            </div>
          </div>

          {/* Copyright & Disclaimer */}
          <div className="text-center lg:text-right space-y-1 max-w-xl">
            <p className="text-slate-300 font-medium leading-relaxed">
              جميع عمليات الشحن تتم يدوياً ومراجعتها بعناية وأمان من خلال إدارة المنصة.
            </p>
            <p className="text-slate-500 text-[11px]">
              © {new Date().getFullYear()} كافة الحقوق محفوظة.
            </p>
          </div>

          {/* Admin link button */}
          <div>
            <button
              id="footer-admin-link-btn"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer border border-slate-800 hover:border-slate-700 shadow-xs"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>لوحة الإدارة والمشرفين</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
