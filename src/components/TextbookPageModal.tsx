import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronRight, ChevronLeft, BookOpen, Download } from 'lucide-react';

interface TextbookPageModalProps {
  initialPage: number;
  isOpen: boolean;
  onClose: () => void;
}

export const TextbookPageModal: React.FC<TextbookPageModalProps> = ({
  initialPage,
  isOpen,
  onClose,
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    setCurrentPage(initialPage);
    setZoomLevel(1);
  }, [initialPage, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && currentPage > 1) setCurrentPage(p => p - 1);
      if (e.key === 'ArrowLeft' && currentPage < 68) setCurrentPage(p => p + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, onClose]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.3, 0.6));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-700/30"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="px-3 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white flex items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-white/20 shrink-0">
              <img 
                src="/assets/aistudio/WhatsApp_Image_2026-10-28_at_3.07.39_PM_2048e88f.jpeg" 
                alt="International Education Egypt"
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <h3 className="font-bold text-xs sm:text-base text-amber-300 truncate max-w-[180px] xs:max-w-[250px] sm:max-w-none">
                  كتاب التقييمات والأداءات الرسمية
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-blue-200">
                صفحة <span className="font-extrabold text-amber-400 text-xs sm:text-sm">{currentPage}</span> من 68 (النسخة المعتمدة)
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-white/10 rounded-xl p-1 border border-white/15 gap-1">
              <button
                type="button"
                onClick={handleZoomIn}
                title="تكبير"
                className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                title="تصغير"
                className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                title="إعادة ضبط الحجم"
                className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono px-1.5 text-blue-200">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>

            <a
              href={`/assets/pages/page_${currentPage}.jpg`}
              download={`كتاب_التقييمات_صفحة_${currentPage}.jpg`}
              target="_blank"
              rel="noreferrer"
              title="تحميل الصورة بدقة كاملة"
              className="p-2 hover:bg-white/20 rounded-xl text-blue-200 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={onClose}
              title="إغلاق (Esc)"
              className="p-2 bg-rose-600/80 hover:bg-rose-600 rounded-xl text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Image Canvas */}
        <div className="flex-1 bg-slate-900/95 overflow-auto relative flex items-center justify-center p-4 select-none">
          <div 
            className="transition-transform duration-200 ease-out flex items-center justify-center min-w-full min-h-full"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
            }}
          >
            <img
              src={`/assets/pages/page_${currentPage}.jpg`}
              alt={`صفحة ${currentPage} من كتاب التقييمات`}
              className="max-h-[82vh] w-auto object-contain rounded-lg shadow-2xl bg-white border border-slate-700"
              draggable={false}
            />
          </div>

          {/* Quick Page Nav Buttons overlay */}
          {currentPage > 1 && (
            <button
              type="button"
              onClick={() => setCurrentPage(p => p - 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-slate-900/80 hover:bg-blue-600 text-white rounded-full shadow-xl backdrop-blur-md border border-white/20 transition-all cursor-pointer group"
              title="الصفحة السابقة"
            >
              <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          )}

          {currentPage < 68 && (
            <button
              type="button"
              onClick={() => setCurrentPage(p => p + 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-slate-900/80 hover:bg-blue-600 text-white rounded-full shadow-xl backdrop-blur-md border border-white/20 transition-all cursor-pointer group"
              title="الصفحة التالية"
            >
              <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">الانتقال السريع للصفحة:</span>
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 68 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  صفحة {num} {num === 1 ? '(الغلاف)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              💡 يمكنك استخدام زري الأسهم يمين/يسار للتنقل ومفتاح Esc للإغلاق
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
