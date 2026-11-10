import React from 'react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  points: number;
  studentName: string;
  onOpenProfile: () => void;
  onOpenTextbook?: () => void;
  onOpenAdmin?: () => void;
  fontSize?: 'normal' | 'large' | 'xlarge';
  setFontSize?: (size: 'normal' | 'large' | 'xlarge') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  points,
  studentName,
  onOpenProfile,
  onOpenTextbook,
  onOpenAdmin,
  fontSize = 'normal',
  setFontSize,
}) => {
  const navItems = [
    { id: 'home', label: 'الصفحة الرئيسية', icon: '🏠' },
    { id: 'zaker_li', label: 'ذاكر لي (إنفوجرافيك)', icon: '💡' },
    { id: 'weekly', label: 'التقييمات الأسبوعية', icon: '📅' },
    { id: 'skills', label: 'التدريب حسب المهارة', icon: '🎯' },
    { id: 'generator', label: 'منشئ الامتحانات الذكي', icon: '⚡' },
    { id: 'progress', label: 'نتائجي وتقدمي', icon: '📊' },
    { id: 'solutions', label: 'دليل الإجابات', icon: '📖' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Official Brand Logo and Title */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group transition-transform active:scale-98 shrink-0 min-w-0"
          >
            <div className="relative w-10 h-10 sm:w-13 sm:h-13 rounded-full overflow-hidden border-2 border-amber-400 shadow-md bg-white flex items-center justify-center p-0.5 shrink-0">
              <img 
                src="/assets/aistudio/WhatsApp_Image_2026-10-28_at_3.07.39_PM_2048e88f.jpeg" 
                alt="International Education Egypt Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="hidden sm:block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-800">
                International Education Egypt
              </span>
              <h1 className="text-xs sm:text-base lg:text-lg font-black text-slate-900 group-hover:text-blue-700 transition-colors truncate max-w-[150px] xs:max-w-[200px] sm:max-w-none">
                منصة التقييمات والأداءات التفاعلية
              </h1>
            </div>
          </div>

          {/* Navigation Links for Desktop */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-blue-700 text-white shadow-sm shadow-blue-700/30' 
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action buttons & Student Profile */}
          <div className="flex items-center gap-2">
            {/* Font Size Adjuster Control */}
            {setFontSize && (
              <div 
                className="flex items-center bg-slate-100/90 border border-slate-200/90 rounded-2xl p-1 gap-0.5 shadow-2xs"
                title="التحكم في حجم الخط لكامل المنصة للقراءة المريحة"
              >
                <span className="text-[11px] font-black text-slate-500 px-1 hidden xl:inline">
                  حجم الخط:
                </span>
                <button
                  type="button"
                  onClick={() => setFontSize('normal')}
                  className={`px-2 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    fontSize === 'normal'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-white/80'
                  }`}
                  title="خط عادي مريح (18px)"
                >
                  أ
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('large')}
                  className={`px-2 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    fontSize === 'large'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-white/80'
                  }`}
                  title="خط كبير وواضح (20px)"
                >
                  أ+
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('xlarge')}
                  className={`px-2 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    fontSize === 'xlarge'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-white/80'
                  }`}
                  title="خط فائق الكبر ومقروء بسهولة (22px)"
                >
                  أ++
                </button>
              </div>
            )}

            {/* USER REQUESTED: الدرس في صورة */}
            <button
              type="button"
              onClick={() => setActiveTab('zaker_li')}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black border border-amber-400/80 rounded-2xl text-xs transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
              title="عرض ملصقات الشرح البصري لجميع الدروس (الدرس في صورة)"
            >
              <span>🖼️</span>
              <span className="hidden sm:inline">الدرس في صورة</span>
            </button>

            {onOpenTextbook && (
              <button
                type="button"
                onClick={onOpenTextbook}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/90 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                title="تصفح جميع صفحات كتاب التقييمات الـ 68 بدقة عالية"
              >
                <span className="text-base">📖</span>
                <span>الكتاب (68 ص)</span>
              </button>
            )}

            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300/80 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                title="لوحة المعلم والمشرف لتوليد واعتماد الإنفوجرافيك"
              >
                <span>⚙️</span>
                <span>لوحة المعلم</span>
              </button>
            )}

            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 sm:gap-2.5 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-900 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-2xl border border-amber-300/80 shadow-sm transition-all cursor-pointer shrink-0"
              title="ملف الطالب والإنجازات"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center text-xs sm:text-sm shadow-inner">
                ⭐
              </div>
              <div className="text-right">
                <div className="text-[10px] sm:text-[11px] text-amber-800 font-bold hidden xs:block">النقاط</div>
                <div className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-0.5 sm:gap-1">
                  <span>{points}</span>
                  <span className="text-[10px] sm:text-xs text-amber-900 hidden sm:inline">نقطة</span>
                </div>
              </div>
            </button>
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center overflow-x-auto py-2 gap-1.5 scrollbar-none border-t border-slate-100 touch-pan-x">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                  isActive 
                    ? 'bg-blue-700 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
