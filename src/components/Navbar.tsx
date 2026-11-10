import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Maximize2, 
  Minimize2, 
  BookOpen, 
  Sparkles, 
  Settings 
} from 'lucide-react';
import { MAIN_NAV_ITEMS } from '../utils/navigationConfig';

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
  const navScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [isAppFullscreen, setIsAppFullscreen] = useState<boolean>(false);

  // Mouse drag states for desktop horizontal scrolling
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartScrollLeft, setDragStartScrollLeft] = useState<number>(0);
  const [hasMoved, setHasMoved] = useState<boolean>(false);

  // Check scroll boundary state to show/hide indicators
  const updateScrollIndicators = useCallback(() => {
    const el = navScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 4) {
      setCanScrollRight(false);
      setCanScrollLeft(false);
      return;
    }

    const absScroll = Math.abs(scrollLeft);
    // In RTL:
    // When absScroll is near 0, we are at the right edge (start) -> can scroll left
    // When absScroll is near maxScroll, we are at the left edge (end) -> can scroll right
    setCanScrollRight(absScroll > 8);
    setCanScrollLeft(absScroll < maxScroll - 8);
  }, []);

  useEffect(() => {
    const el = navScrollRef.current;
    if (!el) return;
    updateScrollIndicators();

    el.addEventListener('scroll', updateScrollIndicators, { passive: true });
    window.addEventListener('resize', updateScrollIndicators);

    return () => {
      el.removeEventListener('scroll', updateScrollIndicators);
      window.removeEventListener('resize', updateScrollIndicators);
    };
  }, [updateScrollIndicators]);

  // Auto-scroll active tab into center view
  useEffect(() => {
    const el = navScrollRef.current;
    if (!el) return;
    const activeEl = el.querySelector<HTMLElement>(`[data-nav-id="${activeTab}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeTab]);

  // Fullscreen state listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsAppFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Smooth scroll handler for Right and Left buttons
  const handleScroll = (direction: 'right' | 'left') => {
    const el = navScrollRef.current;
    if (!el) return;
    const distance = 240;
    // In RTL:
    // scrolling "left" (toward later items like منشئ الامتحانات) requires negative delta
    // scrolling "right" (toward earlier items like الصفحة الرئيسية) requires positive delta
    const delta = direction === 'left' ? -distance : distance;

    try {
      el.scrollBy({ left: delta, behavior: 'smooth' });
    } catch {
      el.scrollLeft += delta;
    }
  };

  // Convert mouse wheel vertical scroll into horizontal nav scroll
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = navScrollRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
    }
  };

  // Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = navScrollRef.current;
    if (!el) return;
    setIsDragging(true);
    setHasMoved(false);
    setDragStartX(e.pageX - el.offsetLeft);
    setDragStartScrollLeft(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = navScrollRef.current;
    if (!isDragging || !el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragStartX) * 1.5;
    if (Math.abs(walk) > 4) {
      setHasMoved(true);
    }
    el.scrollLeft = dragStartScrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Toggle App Fullscreen
  const toggleAppFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm select-none" dir="rtl">
      
      {/* ============================================================ */}
      {/* TIER 1: BRAND LOGO & UTILITY TOOLS BAR */}
      {/* ============================================================ */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Right side (RTL): Official Brand Logo & Title */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group transition-transform active:scale-98 shrink-0 min-w-0"
            title="الانتقال إلى الصفحة الرئيسية"
          >
            <div className="relative w-9 h-9 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-sm bg-white flex items-center justify-center p-0.5 shrink-0">
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
              <h1 className="text-xs sm:text-sm lg:text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors truncate max-w-[140px] xs:max-w-[190px] sm:max-w-none">
                منصة التقييمات والأداءات التفاعلية
              </h1>
            </div>
          </div>

          {/* Left side (RTL): Actions, Controls & Student Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Font Size Adjuster Control */}
            {setFontSize && (
              <div 
                className="flex items-center bg-slate-100/90 border border-slate-200/90 rounded-2xl p-0.5 sm:p-1 gap-0.5 shadow-2xs"
                title="التحكم في حجم الخط لكامل المنصة للقراءة المريحة"
              >
                <span className="text-[11px] font-black text-slate-500 px-1 hidden xl:inline">
                  حجم الخط:
                </span>
                <button
                  type="button"
                  onClick={() => setFontSize('normal')}
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer ${
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
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer ${
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
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer ${
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

            {/* Textbook button */}
            {onOpenTextbook && (
              <button
                type="button"
                onClick={onOpenTextbook}
                className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/90 rounded-2xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
                title="تصفح جميع صفحات كتاب التقييمات الـ 68 بدقة عالية"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                <span className="hidden md:inline">الكتاب (68 ص)</span>
                <span className="md:hidden">الكتاب</span>
              </button>
            )}

            {/* Admin Dashboard */}
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="hidden lg:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300/80 rounded-2xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
                title="لوحة المعلم والمشرف لتوليد واعتماد الإنفوجرافيك"
              >
                <Settings className="w-3.5 h-3.5 text-slate-600" />
                <span>لوحة المعلم</span>
              </button>
            )}

            {/* Fullscreen Toggle Button */}
            <button
              type="button"
              onClick={toggleAppFullscreen}
              className="hidden sm:flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-blue-700 border border-slate-300/80 rounded-2xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
              title={isAppFullscreen ? 'إنهاء وضع ملء الشاشة (Esc)' : 'عرض المنصة بملء الشاشة'}
            >
              {isAppFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden xl:inline">تصغير</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden xl:inline">ملء الشاشة</span>
                </>
              )}
            </button>

            {/* Points / Student Profile Button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-900 px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl border border-amber-300/80 shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
              title="ملف الطالب والإنجازات والأوسمة"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center text-xs shadow-inner">
                ⭐
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-0.5">
                  <span>{points}</span>
                  <span className="text-[10px] sm:text-xs text-amber-900 hidden sm:inline">نقطة</span>
                </div>
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* TIER 2: DEDICATED SCROLLABLE NAVIGATION RAIL */}
      {/* Accessible & Smooth on ALL screens: Mobile, Tablet, Laptop, Desktop & Fullscreen */}
      {/* ============================================================ */}
      <div className="bg-slate-100/95 border-t border-slate-200/80 px-1 sm:px-4 py-1.5 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 sm:gap-2 relative">
          
          {/* Scroll Right Button (السهم الأيمن للتمرير لليمين في اللغة العربية) */}
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className={`p-1.5 sm:p-2 rounded-xl bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-300 shadow-sm active:scale-90 transition-all cursor-pointer shrink-0 z-10 flex items-center justify-center ${
              !canScrollRight ? 'opacity-40 hover:opacity-100' : 'opacity-100'
            }`}
            title="تمرير القائمة لليمين (عرض الأقسام السابقة)"
            aria-label="تمرير شريط التنقل إلى اليمين"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
          </button>

          {/* Right edge visual fade mask */}
          <div className="absolute right-8 sm:right-10 top-0 bottom-0 w-6 bg-gradient-to-l from-transparent to-slate-100/90 pointer-events-none z-5 hidden sm:block" />

          {/* Scrollable Navigation Items Container */}
          <nav 
            ref={navScrollRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={`flex-1 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none sm:scrollbar-thin px-1 py-0.5 touch-pan-x transition-all ${
              isDragging ? 'cursor-grabbing select-none' : 'cursor-grab sm:cursor-default'
            }`}
            style={{ overscrollBehaviorX: 'contain' }}
            aria-label="شريط التنقل الرئيسي للدروس والتقييمات"
          >
            {MAIN_NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  data-nav-id={item.id}
                  type="button"
                  onClick={(e) => {
                    if (hasMoved) {
                      e.preventDefault();
                      return;
                    }
                    setActiveTab(item.id);
                  }}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all shrink-0 whitespace-nowrap cursor-pointer active:scale-95 ${
                    isActive 
                      ? 'bg-blue-700 text-white shadow-md shadow-blue-700/30 ring-2 ring-blue-600/30' 
                      : 'bg-white text-slate-700 hover:text-blue-800 hover:bg-blue-50/70 border border-slate-200/90 hover:border-blue-300'
                  }`}
                  title={item.description || item.label}
                >
                  <span className="text-sm sm:text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Left edge visual fade mask */}
          <div className="absolute left-8 sm:left-10 top-0 bottom-0 w-6 bg-gradient-to-r from-transparent to-slate-100/90 pointer-events-none z-5 hidden sm:block" />

          {/* Scroll Left Button (السهم الأيسر للتمرير لليسار في اللغة العربية) */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className={`p-1.5 sm:p-2 rounded-xl bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-300 shadow-sm active:scale-90 transition-all cursor-pointer shrink-0 z-10 flex items-center justify-center ${
              !canScrollLeft ? 'opacity-40 hover:opacity-100' : 'opacity-100'
            }`}
            title="تمرير القائمة لليسار (عرض منشئ الامتحانات والنتائج)"
            aria-label="تمرير شريط التنقل إلى اليسار"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
          </button>

        </div>
      </div>

    </header>
  );
};

