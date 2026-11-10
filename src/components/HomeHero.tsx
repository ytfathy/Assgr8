import React from 'react';
import { Unit } from '../types/assessment';

interface HomeHeroProps {
  onStartMode: (tab: string) => void;
  units: Unit[];
  totalQuestions: number;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onStartMode,
  units,
  totalQuestions,
}) => {
  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8">
      
      {/* Brand Hero Banner */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden mb-12 border border-blue-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 text-right space-y-4">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 px-4 py-1.5 rounded-full text-xs font-black shadow-md">
              <span>🌟</span>
              <span>International Education Egypt • المنهاج المعتمد</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">
              منصة التقييمات والأداءات التفاعلية
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 mt-2">
                كتاب الدراسات الاجتماعية المعتمد 2026/2027
              </span>
            </h1>

            <p className="text-blue-100/90 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl font-medium">
              تطبيق تفاعلي شامل مبني بنسبة 100% على كتاب الأداءات والتقييمات المركزية لوزارة التربية والتعليم، يدمج بين التدريب الأسبوعي المنظم ومنشئ الامتحانات الذكي مع التصحيح التلقائي الفوري والتغذية الراجعة ونظام التحفيز والجوائز.
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3.5 pt-3 sm:pt-4">
              <button
                onClick={() => onStartMode('zaker_li')}
                className="w-full sm:w-auto justify-center bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl shadow-lg shadow-amber-400/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95 ring-2 ring-amber-300/50"
              >
                <span>🖼️</span>
                <span>الدرس في صورة (ملصقات تفاعلية)</span>
              </button>

              <button
                onClick={() => onStartMode('zaker_li')}
                className="w-full sm:w-auto justify-center bg-blue-600/80 hover:bg-blue-600 text-white font-bold px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl border border-blue-400/40 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>💡</span>
                <span>ذاكر لي (NotebookLM)</span>
              </button>

              <button
                onClick={() => onStartMode('generator')}
                className="w-full sm:w-auto justify-center bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>⚡</span>
                <span>منشئ الامتحانات الذكي</span>
              </button>

              <button
                onClick={() => onStartMode('weekly')}
                className="w-full sm:w-auto justify-center bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>📅</span>
                <span>التقييمات الأسبوعية</span>
              </button>

              <button
                onClick={() => onStartMode('skills')}
                className="w-full sm:w-auto justify-center bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>🎯</span>
                <span>التدريب حسب المهارة</span>
              </button>
            </div>
          </div>

          {/* Official Logo & Shield Display */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center pt-4 lg:pt-0">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-blue-500 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-amber-300 shadow-2xl bg-white p-2">
                <img 
                  src="/assets/aistudio/WhatsApp_Image_2026-10-28_at_3.07.39_PM_2048e88f.jpeg" 
                  alt="International Education Egypt"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="text-center mt-3">
              <span className="text-[11px] sm:text-xs font-bold text-amber-300 tracking-wider">OFFICIAL BRAND GUARDIAN</span>
              <p className="text-[10px] sm:text-[11px] text-blue-200">International Education Egypt</p>
            </div>
          </div>

        </div>

      </div>

      {/* Main Learning Modes Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        {/* Visual Infographics Mode: ذاكر لي */}
        <div 
          onClick={() => onStartMode('zaker_li')}
          className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white rounded-3xl p-8 shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden border border-blue-400/30"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-lg">
            💡
          </div>
          <div className="inline-block text-xs sm:text-sm font-black text-amber-950 bg-amber-400 px-3.5 py-1 rounded-full mb-3 shadow-xs">
            النمط المرئي المبتكر (NotebookLM)
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition-colors mb-2.5">
            ذاكر لي (الإنفوجرافيك والخرائط الذهنية)
          </h2>
          <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed mb-6">
            لوحة بصرية متكاملة لكل درس: خرائط ذهنية متفرعة، خرائط جغرافية تفاعلية، خطوط زمنية للأحداث، ومقارنات وجداول وشرح صوتي باللغة العربية الفصحى.
          </p>
          <div className="flex items-center gap-2 text-sm sm:text-base font-black text-amber-300 group-hover:translate-x-[-4px] transition-transform">
            <span>افتح لوحات الإنفوجرافيك</span>
            <span>←</span>
          </div>
        </div>

        {/* Mode A: Weekly Assessments */}
        <div 
          onClick={() => onStartMode('weekly')}
          className="bg-white rounded-3xl border-2 border-slate-200/90 p-8 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
            📅
          </div>
          <div className="inline-block text-xs sm:text-sm font-black text-blue-800 bg-blue-100 px-3.5 py-1 rounded-full mb-3">
            النمط الأول (MODE A)
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 group-hover:text-blue-700 transition-colors mb-2.5">
            التقييمات الأسبوعية (Weekly)
          </h2>
          <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed mb-6">
            محاكاة تامة لترتيب أسابيع الكتاب: الأداء الصفي، الأداء المنزلي، ونماذج (أ، ب، ج)، والتدريبات الشهرية الشاملة مع صور الخرائط الأصلية.
          </p>
          <div className="flex items-center gap-2 text-sm sm:text-base font-black text-blue-700 group-hover:translate-x-[-4px] transition-transform">
            <span>ابدأ حل التقييمات الأسبوعية</span>
            <span>←</span>
          </div>
        </div>

        {/* Mode B: Skill-Based Practice */}
        <div 
          onClick={() => onStartMode('skills')}
          className="bg-white rounded-3xl border-2 border-slate-200/90 p-8 shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
            🎯
          </div>
          <div className="inline-block text-xs sm:text-sm font-black text-amber-900 bg-amber-100 px-3.5 py-1 rounded-full mb-3">
            النمط الثاني (MODE B)
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 group-hover:text-indigo-700 transition-colors mb-2.5">
            التدريب حسب المهارة (Skills)
          </h2>
          <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed mb-6">
            إعادة تنظيم شاملة للأسئلة حسب المهارات: التضاريس والخرائط، المعادن، النظم البيئية، الحضارات القديمة، الحضارة الإسلامية، واليونان والرومان.
          </p>
          <div className="flex items-center gap-2 text-sm sm:text-base font-black text-indigo-700 group-hover:translate-x-[-4px] transition-transform">
            <span>ابدأ التدريب التخصصي</span>
            <span>←</span>
          </div>
        </div>

      </div>

      {/* Curriculum Units Overview Cards */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              خريطة وحدات المنهج الدراسي
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              أربع وحدات دراسية متكاملة تغطي كافة موضوعات الفصل الدراسي الأول
            </p>
          </div>
          <div className="bg-slate-100 px-4 py-2 rounded-2xl text-xs font-bold text-slate-700">
            {totalQuestions} سؤالاً أصلياً موثقاً
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {units.map((unit) => (
            <div key={unit.id} className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-md">
                  الوحدة {unit.id}
                </span>
                <span className="text-xs text-slate-400">{unit.lessons.length} دروس</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">{unit.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">{unit.subtitle}</p>
              <div className="space-y-1">
                {unit.lessons.map(l => (
                  <div key={l.id} className="text-xs text-slate-700 flex items-center gap-2">
                    <span className="text-blue-500">•</span>
                    <span>{l.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
