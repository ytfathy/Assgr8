import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Download, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { 
  LESSON_POSTERS_LIST, 
  getPosterForLesson, 
  LessonPoster 
} from '../data/lessonPosters';

interface LessonPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLessonId?: string;
  onSelectLesson?: (lessonId: string) => void;
}

export const LessonPosterModal: React.FC<LessonPosterModalProps> = ({
  isOpen,
  onClose,
  initialLessonId = 'u1_l1',
  onSelectLesson,
}) => {
  const [currentPoster, setCurrentPoster] = useState<LessonPoster>(() => 
    getPosterForLesson(initialLessonId)
  );

  const [scale, setScale] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const currentIndex = LESSON_POSTERS_LIST.findIndex(p => p.lessonId === currentPoster.lessonId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < LESSON_POSTERS_LIST.length - 1;

  const resetTransform = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.3, 3.5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.3, 0.7));
  };

  const handlePrev = () => {
    if (hasPrev) {
      const prevPoster = LESSON_POSTERS_LIST[currentIndex - 1];
      setCurrentPoster(prevPoster);
      resetTransform();
      if (onSelectLesson) onSelectLesson(prevPoster.lessonId);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      const nextPoster = LESSON_POSTERS_LIST[currentIndex + 1];
      setCurrentPoster(nextPoster);
      resetTransform();
      if (onSelectLesson) onSelectLesson(nextPoster.lessonId);
    }
  };

  const handleSelectPoster = (lessonId: string) => {
    const poster = getPosterForLesson(lessonId);
    setCurrentPoster(poster);
    resetTransform();
    if (onSelectLesson) onSelectLesson(poster.lessonId);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Sync when initialLessonId changes
  useEffect(() => {
    if (initialLessonId) {
      setCurrentPoster(getPosterForLesson(initialLessonId));
      resetTransform();
    }
  }, [initialLessonId]);

  // Keyboard navigation & Esc to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handlePrev();
      } else if (e.key === 'ArrowLeft') {
        handleNext();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        resetTransform();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPoster]);

  if (!isOpen) return null;

  // Drag pan handlers (Mouse & Touch)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentPoster.imageSrc;
    link.download = `${currentPoster.posterTitle}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between text-white overflow-hidden select-none animate-in fade-in duration-200"
      dir="rtl"
    >
      {/* Top Header Bar */}
      <header className="px-3 py-2.5 sm:px-6 sm:py-3 bg-slate-900/95 border-b border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 shadow-lg z-20">
        
        {/* Top line on mobile / Left side on desktop: Title + Quick actions */}
        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0 text-base sm:text-xl">
              🖼️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black rounded-md text-[10px] sm:text-xs shrink-0">
                  الدرس في صورة
                </span>
                <span className="text-[11px] sm:text-xs text-amber-200/90 font-bold hidden xs:inline truncate">
                  {currentPoster.unitTitle}
                </span>
              </div>
              <h2 className="text-xs sm:text-base lg:text-lg font-black text-white mt-0.5 leading-snug truncate max-w-[210px] xs:max-w-[280px] sm:max-w-none">
                {currentPoster.posterTitle}
              </h2>
            </div>
          </div>

          {/* Mobile top-right: Download & Close */}
          <div className="flex items-center gap-1.5 sm:hidden shrink-0">
            <button
              onClick={handleDownload}
              className="p-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 rounded-xl transition-all shadow-md cursor-pointer"
              title="تحميل الصورة"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl transition-all cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Lesson Selector Quick Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-between sm:justify-center">
          <button
            onClick={handlePrev}
            disabled={!hasPrev}
            className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white cursor-pointer shrink-0"
            title="الدرس السابق"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <select
            value={currentPoster.lessonId}
            onChange={(e) => handleSelectPoster(e.target.value)}
            className="bg-slate-800 text-white border border-white/20 text-xs sm:text-sm font-black rounded-xl px-2.5 py-1.5 sm:py-2 flex-1 sm:flex-none max-w-[220px] xs:max-w-[270px] sm:max-w-[320px] truncate focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {LESSON_POSTERS_LIST.map((poster, idx) => (
              <option key={poster.lessonId} value={poster.lessonId} className="bg-slate-900 text-white">
                ({idx + 1}/11) {poster.lessonTitle}
              </option>
            ))}
          </select>

          <button
            onClick={handleNext}
            disabled={!hasNext}
            className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white cursor-pointer shrink-0"
            title="الدرس التالي"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Zoom controls on mobile inside row 2 */}
          <div className="flex items-center bg-white/10 rounded-xl p-0.5 sm:hidden border border-white/10 shrink-0">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-200"
              title="تصغير"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-black px-1 min-w-[34px] text-center text-amber-300">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-200"
              title="تكبير"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetTransform}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-200"
              title="إعادة ضبط"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Desktop Right Controls: Zoom + Fullscreen + Download + Close */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/10">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-200 hover:text-white transition-all cursor-pointer"
              title="تصغير (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-black px-2 min-w-[42px] text-center text-amber-300">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-200 hover:text-white transition-all cursor-pointer"
              title="تكبير (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={resetTransform}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-200 hover:text-white transition-all cursor-pointer"
              title="إعادة ضبط الحجم (0)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-all cursor-pointer hidden md:flex"
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md cursor-pointer"
            title="تحميل ملصق الدرس بجودة فائقة"
          >
            <Download className="w-4 h-4" />
            <span>تحميل الصورة</span>
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl transition-all cursor-pointer"
            title="إغلاق (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Image Viewport Area with Pan & Zoom */}
      <main 
        className={`flex-1 relative overflow-hidden flex items-center justify-center p-2 sm:p-4 touch-none ${
          scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="relative max-w-full max-h-full transition-transform duration-75 flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          <img
            src={currentPoster.imageSrc}
            alt={currentPoster.posterTitle}
            className="max-w-[96vw] max-h-[64vh] sm:max-h-[76vh] object-contain rounded-2xl shadow-2xl border-2 border-white/20 bg-slate-900 pointer-events-none"
            draggable={false}
          />
        </div>

        {/* Floating instruction tooltip when zoomed */}
        {scale > 1 && (
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-black/80 backdrop-blur-md text-amber-200 text-[11px] sm:text-xs px-3 py-1.5 rounded-full border border-amber-300/30 shadow-lg pointer-events-none">
            💡 اسحب بالإصبع أو بالماوس لتصفح التفاصيل
          </div>
        )}
      </main>

      {/* Footer Info & Details Bar */}
      <footer className="px-4 py-2.5 sm:px-6 bg-slate-900/90 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 z-20">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-amber-300 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ملصق تعليمي رسمي مستخلص 100% من كتاب الطالب</span>
          </span>
          <span className="text-white/20 hidden sm:inline">|</span>
          <span className="flex items-center gap-1.5 text-slate-300 hidden sm:flex">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>صفحات الكتاب: {currentPoster.pageRange}</span>
          </span>
        </div>

        <p className="text-slate-300 text-xs font-semibold max-w-2xl truncate">
          {currentPoster.description}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono">
            {currentIndex + 1} / {LESSON_POSTERS_LIST.length}
          </span>
        </div>
      </footer>
    </div>
  );
};
