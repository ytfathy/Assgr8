import React, { useState, useRef } from 'react';
import { InfographicLesson, MapHotspot } from '../types/infographic';
import { Unit, Question } from '../types/assessment';
import { InfographicGenerator } from '../services/InfographicGenerator';
import { calculatePoints } from '../utils/arabicValidation';
import { LessonPosterModal } from './LessonPosterModal';
import { getPosterForLesson } from '../data/lessonPosters';

interface ZakerLiViewProps {
  units: Unit[];
  allQuestions: Question[];
  selectedLessonId?: string;
  onSelectLesson?: (lessonId: string) => void;
  onAnswerSubmit: (questionId: string, isCorrect: boolean, studentAnswer: string) => void;
  onOpenTextbookPage?: (page: number) => void;
  onOpenAdminDashboard?: () => void;
}

export const ZakerLiView: React.FC<ZakerLiViewProps> = ({
  units,
  allQuestions,
  selectedLessonId,
  onSelectLesson,
  onAnswerSubmit,
  onOpenTextbookPage,
  onOpenAdminDashboard,
}) => {
  // All infographics
  const allInfographics = InfographicGenerator.getAllInfographics();

  // Active lesson state
  const [currentLessonId, setCurrentLessonId] = useState<string>(
    selectedLessonId || allInfographics[0]?.lessonId || 'u1_l1'
  );

  // 4 Student Modes
  const [learningMode, setLearningMode] = useState<'infographic' | 'summary' | 'quiz' | 'poster'>('infographic');

  // Zoom level (0.7 to 1.3)
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active Map Hotspot Modal
  const [activeHotspot, setActiveHotspot] = useState<MapHotspot | null>(null);

  // Lesson in a Picture Modal (الدرس في صورة)
  const [isPosterModalOpen, setIsPosterModalOpen] = useState<boolean>(false);

  // Expanded concept card IDs
  const [expandedConceptIds, setExpandedConceptIds] = useState<Set<string>>(new Set());

  // SpeechSynthesis audio state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingText, setSpeakingText] = useState<string>('');

  // Interactive Quiz state for this lesson
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<{ total: number; correct: number } | null>(null);

  // Find active infographic
  const activeInfographic = allInfographics.find(item => item.lessonId === currentLessonId) || allInfographics[0];
  const currentPoster = getPosterForLesson(currentLessonId);

  // Questions for this specific lesson
  const lessonQuestions = allQuestions.filter(q => q.lessonId === currentLessonId);
  const drillQuestions = lessonQuestions.slice(0, 5); // 5 instant drill questions

  // Switch lesson
  const handleLessonChange = (newLessonId: string) => {
    stopSpeech();
    setCurrentLessonId(newLessonId);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setActiveHotspot(null);
    if (onSelectLesson) onSelectLesson(newLessonId);
  };

  // Next / Prev lesson navigation
  const currentIndex = allInfographics.findIndex(item => item.lessonId === currentLessonId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allInfographics.length - 1;

  const handlePrevLesson = () => {
    if (hasPrev) handleLessonChange(allInfographics[currentIndex - 1].lessonId);
  };

  const handleNextLesson = () => {
    if (hasNext) handleLessonChange(allInfographics[currentIndex + 1].lessonId);
  };

  // Toggle concept card expansion
  const toggleConcept = (id: string) => {
    setExpandedConceptIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Text-To-Speech (Read Aloud in Arabic)
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('متصفحك لا يدعم خاصية نطق النصوص الصوتية.');
      return;
    }

    window.speechSynthesis.cancel();

    if (isSpeaking && speakingText === text) {
      setIsSpeaking(false);
      setSpeakingText('');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingText(text);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingText('');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingText('');
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingText('');
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Print / Download handler
  const handlePrint = () => {
    window.print();
  };

  // Quiz submission
  const handleQuizSubmit = () => {
    let correctCount = 0;
    drillQuestions.forEach(q => {
      const studentAns = (quizAnswers[q.id] || '').trim().toLowerCase();
      const correctAns = q.correctAnswer.trim().toLowerCase();
      const isCorrect = studentAns === correctAns || Boolean(q.acceptableAnswers && q.acceptableAnswers.some(a => a.trim().toLowerCase() === studentAns));
      if (isCorrect) correctCount++;
      onAnswerSubmit(q.id, isCorrect, studentAns);
    });

    setQuizScore({ total: drillQuestions.length, correct: correctCount });
    setQuizSubmitted(true);
  };

  if (!activeInfographic) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 font-bold">جاري تحميل الإنفوجرافيك التعليمي...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6 bg-slate-50 min-h-screen pb-12 print:bg-white print:p-0">
      
      {/* Top Header Bar & Brand Ribbon */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden print:hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 bg-amber-400 text-amber-950 rounded-full text-xs font-black shadow-sm flex items-center gap-1.5">
                <span>🧠</span>
                <span>ذاكر لي • Visual Learning</span>
              </span>
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-blue-200 border border-white/15 rounded-full text-xs font-bold">
                أسلوب Google NotebookLM
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold">
                كتاب الوزارة المعتمد 100%
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{activeInfographic.lessonTitle}</span>
            </h2>
            <p className="text-slate-100 text-sm sm:text-base max-w-2xl leading-relaxed font-semibold">
              {activeInfographic.mainConcept.tagline} • صفحات الكتاب المدرسي ({activeInfographic.pagesRange})
            </p>
          </div>

          {/* Action Buttons: Lesson in Picture, Audio, Fullscreen, Print, Admin */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* USER REQUESTED: الدرس في صورة */}
            <button
              onClick={() => setIsPosterModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black rounded-2xl text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer ring-2 ring-amber-300/60"
              title="عرض الملصق التعليمي البصري الكامل لهذا الدرس (الدرس في صورة)"
            >
              <span className="text-base">🖼️</span>
              <span>الدرس في صورة</span>
            </button>

            <button
              onClick={() => speakText(`${activeInfographic.lessonTitle}. ${activeInfographic.mainConcept.mainIdea}`)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm ${
                isSpeaking
                  ? 'bg-amber-400 text-amber-950 animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md'
              }`}
              title="استمع للشرح الصوتي باللغة العربية الفصحى"
            >
              <span className="text-base">{isSpeaking ? '⏹️' : '🔊'}</span>
              <span>{isSpeaking ? 'إيقاف الصوت' : 'استمع للشرح'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md rounded-2xl text-xs font-bold transition-all cursor-pointer"
              title="طباعة أو حفظ الإنفوجرافيك كملف PDF للمذاكرة"
            >
              <span>🖨️</span>
              <span>طباعة / PDF</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md rounded-2xl text-xs font-bold transition-all cursor-pointer"
              title="عرض كامل الشاشة"
            >
              <span>{isFullscreen ? '🗗' : '⛶'}</span>
              <span>{isFullscreen ? 'تصغير' : 'ملء الشاشة'}</span>
            </button>

            {onOpenAdminDashboard && (
              <button
                onClick={onOpenAdminDashboard}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                title="لوحة تحكم وتوليد الإنفوجرافيك للمشرفين والمعلمين"
              >
                <span>⚙️</span>
                <span>لوحة المعلم</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Student Learning Modes Tabs */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
          <div className="flex items-center gap-1.5 sm:gap-2 p-1 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 overflow-x-auto scrollbar-none flex-nowrap max-w-full touch-pan-x">
            <button
              onClick={() => setLearningMode('poster')}
              className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                learningMode === 'poster'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                  : 'text-amber-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🖼️</span>
              <span>الدرس في صورة</span>
            </button>

            <button
              onClick={() => setLearningMode('infographic')}
              className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                learningMode === 'infographic'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>🎨</span>
              <span>الإنفوجرافيك البصري</span>
            </button>

            <button
              onClick={() => setLearningMode('summary')}
              className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                learningMode === 'summary'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>📖</span>
              <span>ملخص الدرس</span>
            </button>

            <button
              onClick={() => setLearningMode('quiz')}
              className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                learningMode === 'quiz'
                  ? 'bg-amber-500 text-amber-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>⚡</span>
              <span>اختبر معلوماتك</span>
            </button>
          </div>

          {/* Quick Lesson Selector dropdown & Prev/Next */}
          <div className="flex items-center gap-2 justify-between md:justify-end">
            <button
              onClick={handlePrevLesson}
              disabled={!hasPrev}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>→</span>
              <span className="hidden xs:inline">الدرس السابق</span>
            </button>

            <select
              value={currentLessonId}
              onChange={(e) => handleLessonChange(e.target.value)}
              className="px-2.5 sm:px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 md:flex-none max-w-[200px] sm:max-w-[260px] truncate"
            >
              {units.map(unit => (
                <optgroup key={unit.id} label={unit.title}>
                  {unit.lessons.map(lesson => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <button
              onClick={handleNextLesson}
              disabled={!hasNext}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span className="hidden xs:inline">الدرس التالي</span>
              <span>←</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area based on Selected Mode */}

      {/* ============================================================ */}
      {/* MODE 0: LESSON IN A PICTURE (الدرس في صورة) */}
      {/* ============================================================ */}
      {learningMode === 'poster' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 font-black rounded-xl text-xs">
                    🖼️ الدرس في صورة
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    {currentPoster.unitTitle} • صفحات الكتاب: {currentPoster.pageRange}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {currentPoster.posterTitle}
                </h3>
                <p className="text-sm text-slate-600 mt-1 font-semibold max-w-2xl leading-relaxed">
                  {currentPoster.description}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsPosterModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <span>⛶</span>
                  <span>عرض بملء الشاشة مع التكبير الفائق</span>
                </button>
                <a
                  href={currentPoster.imageSrc}
                  download={`${currentPoster.posterTitle}.png`}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  <span>📥</span>
                  <span>تحميل الملصق</span>
                </a>
              </div>
            </div>

            {/* Poster Image Container */}
            <div 
              onClick={() => setIsPosterModalOpen(true)}
              className="relative rounded-2xl overflow-hidden border-2 border-slate-200/90 shadow-xl bg-slate-900 group cursor-pointer"
            >
              <img
                src={currentPoster.imageSrc}
                alt={currentPoster.posterTitle}
                className="w-full h-auto object-contain max-h-[75vh] mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                <span className="px-5 py-2.5 bg-amber-400 text-slate-950 font-black rounded-2xl text-sm shadow-xl flex items-center gap-2">
                  <span>🔍</span>
                  <span>انقر للتكبير والتنقل بحرية بدقة كاملة</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 1: VISUAL INFOGRAPHIC (NOTEBOOKLM STYLE) */}
      {/* ============================================================ */}
      {learningMode === 'infographic' && (
        <div className="space-y-6">
          {/* Banner linking to الدرس في صورة */}
          <div className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-yellow-50 rounded-2xl p-4 border border-amber-300/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-14 h-14 rounded-xl overflow-hidden border-2 border-amber-400 shrink-0 bg-slate-900 shadow-sm cursor-pointer hover:scale-105 transition-transform" 
                onClick={() => setIsPosterModalOpen(true)}
                title="عرض الملصق"
              >
                <img src={currentPoster.imageSrc} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black bg-amber-400 text-amber-950 px-2 py-0.5 rounded-md">ملصق معتمد</span>
                  <span className="text-xs font-black text-amber-900">لوحة "الدرس في صورة"</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">{currentPoster.posterTitle}</h4>
              </div>
            </div>
            <button
              onClick={() => setIsPosterModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer ring-1 ring-amber-400"
            >
              <span>🖼️ فتح "الدرس في صورة"</span>
              <span>←</span>
            </button>
          </div>
          
          {/* Zoom & View Controls Toolbar */}
          <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200/80 shadow-sm print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">حجم العرض التفاعلي:</span>
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition-all cursor-pointer text-sm"
                title="تصغير"
              >
                -
              </button>
              <span className="text-xs font-black text-slate-800 min-w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(1.3, prev + 0.1))}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition-all cursor-pointer text-sm"
                title="تكبير"
              >
                +
              </button>
              <button
                onClick={() => setZoomLevel(1.0)}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
              >
                إعادة ضبط
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
              <span>💡 انقر على أي فرع أو دبوس بالخريطة للتفاصيل العميقة</span>
            </div>
          </div>

          {/* Scaled Infographic Board */}
          <div 
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }} 
            className="transition-transform duration-200 space-y-6"
          >
            
            {/* SECTION A: Central Concept & Essential Question */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md relative overflow-hidden">
              <div className="border-r-4 border-blue-600 pr-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-black tracking-wider uppercase text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                    الفكرة المحورية للدرس
                  </span>
                  {activeInfographic.pagesRange && onOpenTextbookPage && (
                    <button
                      onClick={() => {
                        const pageNum = parseInt(activeInfographic.pagesRange.replace(/[^0-9]/g, '')) || 2;
                        onOpenTextbookPage(pageNum);
                      }}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-xl transition-all"
                    >
                      <span>📖 تصفح في كتاب الوزارة ({activeInfographic.pagesRange})</span>
                    </button>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {activeInfographic.mainConcept.centralTitle}
                </h3>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                  {activeInfographic.mainConcept.mainIdea}
                </p>

                {/* Essential Question Box */}
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 mt-4">
                  <div className="text-2xl">❓</div>
                  <div>
                    <span className="text-xs font-black text-amber-900 block">السؤال الجوهري للدرس:</span>
                    <p className="text-sm font-bold text-amber-950 mt-0.5">
                      {activeInfographic.mainConcept.essentialQuestion}
                    </p>
                  </div>
                </div>

                {/* Learning Objectives Grid */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500 mb-2 block">أهداف التعلم الرئيسية:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {activeInfographic.mainConcept.learningObjectives.map((obj, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION B: Detailed Interactive Mind Map (الخريطة الذهنية المتفرعة) */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center text-xl">
                    🧠
                  </span>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      الخريطة الذهنية البصرية المتفرعة
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200 font-semibold">
                      تشريح بصري لجميع محاور الدرس وعلاقاتها الهرمية
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-bold text-white border border-white/20">
                  {activeInfographic.mindMap.rootLabel}
                </span>
              </div>

              {/* Mind Map Branches Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeInfographic.mindMap.branches.map((branch) => (
                  <div 
                    key={branch.id} 
                    className="bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/30 rounded-3xl p-6 transition-all backdrop-blur-md flex flex-col justify-between group shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-3xl">{branch.icon}</span>
                          <h4 className="text-lg sm:text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                            {branch.title}
                          </h4>
                        </div>
                      </div>

                      <p className="text-sm sm:text-base text-slate-100 leading-relaxed mb-4 font-semibold">
                        {branch.summary}
                      </p>

                      {/* Sub-branches */}
                      <div className="space-y-2.5">
                        {branch.subBranches.map((sub, sIdx) => (
                          <div 
                            key={sIdx} 
                            className="bg-black/40 p-3.5 rounded-2xl border border-white/15 text-sm space-y-1.5 hover:border-white/30 transition-all"
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-black text-amber-300 text-sm sm:text-base">{sub.name}</span>
                              {sub.badge && (
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/40 text-blue-100 border border-blue-400/50 font-black">
                                  {sub.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-100 text-xs sm:text-sm leading-relaxed font-medium">
                              {sub.details}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-white/15 flex items-center justify-between text-xs sm:text-sm text-slate-200 font-bold">
                      <span>{branch.subBranches.length} عناصر فرعية</span>
                      <button
                        onClick={() => speakText(`${branch.title}. ${branch.summary}`)}
                        className="hover:text-amber-300 text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                        title="استمع لهذا الفرع"
                      >
                        <span>🔊</span>
                        <span>استمع للشرح</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION C: Illustrated Educational Map with Clickable Hotspots (if available) */}
            {activeInfographic.mapSchema && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center text-xl">
                      🗺️
                    </span>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900">
                        {activeInfographic.mapSchema.mapTitle}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {activeInfographic.mapSchema.baseDescription}
                      </p>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-3 flex-wrap bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold">
                    {activeInfographic.mapSchema.legend.map((leg, lIdx) => (
                      <div key={lIdx} className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: leg.color }} />
                        <span className="text-slate-700">{leg.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Map Visual Schema */}
                <div className="relative w-full aspect-[16/9] max-h-[460px] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl overflow-hidden border border-slate-300 shadow-inner flex items-center justify-center">
                  
                  {/* Decorative stylized geography grid */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <span className="text-9xl font-black tracking-widest text-white">EURASIA</span>
                  </div>

                  {/* Clickable Hotspots */}
                  {activeInfographic.mapSchema.hotspots.map((spot) => (
                    <button
                      key={spot.id}
                      onClick={() => setActiveHotspot(spot)}
                      style={{ top: `${spot.y}%`, left: `${spot.x}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform hover:scale-125 focus:outline-none z-10"
                    >
                      <div className="relative flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-amber-400 opacity-60" />
                        <div className="w-7 h-7 rounded-full bg-amber-500 text-amber-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white group-hover:bg-amber-400">
                          📍
                        </div>
                      </div>

                      {/* Tooltip Label */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-xl whitespace-nowrap shadow-xl border border-slate-700 pointer-events-none z-20">
                        {spot.title} ({spot.category})
                      </div>
                    </button>
                  ))}

                  {/* Overlay Info Card */}
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs sm:text-sm px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2 font-bold shadow-md">
                    <span>👆 انقر على أي دبوس تفاعلي لعرض التفاصيل وتوثيق كتاب الوزارة</span>
                  </div>
                </div>

                {/* Hotspot details cards below map */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
                  {activeInfographic.mapSchema.hotspots.map((spot) => (
                    <div
                      key={spot.id}
                      onClick={() => setActiveHotspot(spot)}
                      className="p-4 bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-400 rounded-2xl cursor-pointer transition-all space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-sm font-black text-slate-900">
                        <span className="flex items-center gap-1.5">
                          <span>📍</span>
                          <span>{spot.title}</span>
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold">
                          {spot.category}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 line-clamp-2 leading-relaxed font-medium">
                        {spot.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION D: Visual Timeline (for historical lessons) */}
            {activeInfographic.timeline && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center text-xl">
                    ⏳
                  </span>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900">
                      {activeInfographic.timeline.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      تتابع زمني دقيق للأحداث والشخصيات والأثر التاريخي
                    </p>
                  </div>
                </div>

                {/* Timeline Horizontal / Vertical Steps */}
                <div className="relative border-r-2 border-amber-400 mr-4 sm:mr-6 pr-6 space-y-8">
                  {activeInfographic.timeline.events.map((evt, eIdx) => (
                    <div key={eIdx} className="relative group">
                      {/* Timeline Node Icon */}
                      <div className="absolute -right-[35px] top-1 w-8 h-8 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center border-4 border-white shadow-md">
                        {evt.icon || '📌'}
                      </div>

                      <div className="bg-gradient-to-r from-amber-50/70 to-orange-50/40 hover:to-orange-50/70 p-5 sm:p-6 rounded-3xl border border-amber-200 transition-all space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="px-3.5 py-1 bg-amber-500 text-amber-950 font-black text-xs sm:text-sm rounded-full">
                            {evt.era}
                          </span>
                          {evt.rulerOrLeader && (
                            <span className="text-xs sm:text-sm font-bold text-slate-700 bg-white px-3 py-1 rounded-xl border border-slate-200">
                              👑 القائد/الحاكم: {evt.rulerOrLeader}
                            </span>
                          )}
                        </div>

                        <h4 className="text-lg sm:text-xl font-black text-slate-950">
                          {evt.title}
                        </h4>
                        <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                          {evt.description}
                        </p>

                        <div className="pt-3 border-t border-amber-200/80 grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs sm:text-sm">
                          <div className="text-slate-800 bg-white/70 p-2.5 rounded-xl border border-amber-200/50">
                            <span className="font-black text-amber-950">السبب والنتيجة: </span>
                            <span className="font-medium">{evt.causeAndEffect}</span>
                          </div>
                          <div className="text-slate-800 bg-white/70 p-2.5 rounded-xl border border-blue-200/50">
                            <span className="font-black text-blue-950">الأثر التاريخي: </span>
                            <span className="font-medium">{evt.impact}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION E: Comparison Table (المقارنة البصرية الشاملة) */}
            {activeInfographic.comparison && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-xl">
                    ⚖️
                  </span>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900">
                      {activeInfographic.comparison.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      مقارنة دقيقة تسهل تثبيت الفروق الجوهرية والنجاح في الامتحانات
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-right text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-200">
                        {activeInfographic.comparison.headers.map((h, hIdx) => (
                          <th key={hIdx} className="p-3 sm:p-4">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeInfographic.comparison.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 sm:p-4 font-black text-slate-900 bg-slate-50/50 w-1/4">
                            {row.criteria}
                          </td>
                          <td className="p-3 sm:p-4 text-slate-700 leading-relaxed">
                            {row.item1}
                          </td>
                          <td className="p-3 sm:p-4 text-slate-700 leading-relaxed">
                            {row.item2}
                          </td>
                          {row.item3 && (
                            <td className="p-3 sm:p-4 text-slate-700 leading-relaxed">
                              {row.item3}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECTION F: Expandable Concept Cards (بطاقات المفاهيم التفاعلية) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">💡</span>
                <h3 className="text-lg font-black text-slate-900">
                  لوحات المفاهيم العميقة (اضغط للتفاصيل)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeInfographic.conceptCards.map((card) => {
                  const isExpanded = expandedConceptIds.has(card.id);
                  return (
                    <div
                      key={card.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all hover:shadow-md"
                    >
                      <div
                        onClick={() => toggleConcept(card.id)}
                        className="p-5 cursor-pointer flex items-start justify-between gap-3 bg-gradient-to-r from-slate-50 to-white"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{card.icon}</span>
                          <div>
                            <h4 className="font-black text-slate-950 text-base sm:text-lg">
                              {card.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-600 font-bold mt-0.5">
                              {card.shortText}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-black text-blue-700 bg-blue-100/70 px-3 py-1 rounded-xl">
                          {isExpanded ? 'إخفاء' : 'تفاصيل'}
                        </span>
                      </div>

                      {isExpanded && (
                        <div className="p-5 pt-0 border-t border-slate-100 bg-white space-y-3.5 text-sm sm:text-base leading-relaxed text-slate-800">
                          <p className="pt-3 font-semibold text-slate-900 leading-relaxed">
                            {card.deepExplanation}
                          </p>
                          <ul className="space-y-2 list-disc list-inside text-slate-700 font-medium">
                            {card.bulletPoints.map((b, bIdx) => (
                              <li key={bIdx} className="leading-relaxed">{b}</li>
                            ))}
                          </ul>
                          {card.visualTag && (
                            <span className="inline-block text-xs font-black text-amber-900 bg-amber-100/80 border border-amber-300 px-3 py-1 rounded-xl mt-2">
                              {card.visualTag}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION G: Important Panels (بم تفسر - ما النتائج - مصطلحات الامتحانات) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Box 1: بم تفسر وعلل */}
              <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 rounded-3xl p-6 sm:p-7 border border-amber-200/90 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-amber-950 font-black text-lg border-b border-amber-200/80 pb-3.5">
                  <span className="text-2xl">🎯</span>
                  <h4>أهم أسئلة "بم تفسر؟" الواردة بكتاب الوزارة</h4>
                </div>

                <div className="space-y-3.5">
                  {activeInfographic.importantPanels.whyQuestions.map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-amber-200 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between text-sm sm:text-base font-black text-amber-950 gap-2">
                        <span>{item.question}</span>
                        {item.examNote && (
                          <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-black flex-shrink-0">
                            {item.examNote}
                          </span>
                        )}
                      </div>
                      <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
                        <span className="font-black text-emerald-800">الإجابة المعتمدة: </span>
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 2: ما النتائج المترتبة والمصطلحات */}
              <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 rounded-3xl p-6 sm:p-7 border border-blue-200/90 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-blue-950 font-black text-lg border-b border-blue-200/80 pb-3.5">
                  <span className="text-2xl">⚡</span>
                  <h4>ما النتائج المترتبة؟ وأهم المصطلحات الجغرافية</h4>
                </div>

                <div className="space-y-3.5">
                  {activeInfographic.importantPanels.whatHappenedQuestions.map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-blue-200 space-y-2 shadow-2xs">
                      <span className="text-sm sm:text-base font-black text-blue-950 block">{item.question}</span>
                      <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
                        <span className="font-black text-blue-800">النتيجة: </span>
                        {item.answer}
                      </p>
                    </div>
                  ))}

                  {/* Vocabulary Terms */}
                  {activeInfographic.importantPanels.vocabulary.map((vocab, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-blue-200 text-sm sm:text-base leading-relaxed">
                      <span className="font-black text-blue-900">{vocab.term}: </span>
                      <span className="text-slate-800 font-medium">{vocab.definition}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION H: Lesson Summary (الكبسولة الذهبية للاستذكار السريع) */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">💊</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    الكبسولة الذهبية: خلاصة الدرس في نقاط لا تُنسى
                  </h3>
                </div>
                <span className="text-xs sm:text-sm bg-white/25 px-4 py-1.5 rounded-full font-black shadow-xs">
                  مراجعة ليلة الامتحان
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                {activeInfographic.lessonSummary.goldenTakeaways.map((takeaway, tIdx) => (
                  <div key={tIdx} className="flex items-start gap-3 bg-black/25 p-4 rounded-2xl border border-white/20 text-sm sm:text-base font-bold text-white">
                    <span className="text-amber-300 font-black text-lg">✓</span>
                    <span className="leading-relaxed text-white">{takeaway}</span>
                  </div>
                ))}
              </div>

              {activeInfographic.lessonSummary.memoryMnemonics && (
                <div className="mt-4 p-4 bg-white/15 rounded-2xl border border-white/20 text-sm sm:text-base flex items-center gap-2.5">
                  <span className="text-xl">💡</span>
                  <span className="font-bold text-amber-200">
                    طريقة التذكر السريع: {activeInfographic.lessonSummary.memoryMnemonics}
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 2: READ LESSON SUMMARY (قراءة ملخص الدرس) */}
      {/* ============================================================ */}
      {learningMode === 'summary' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-200 pb-5 space-y-2">
            <span className="text-xs sm:text-sm font-black text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full">
              الملخص النصي المعتمد • {activeInfographic.unitTitle}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 mt-2">
              {activeInfographic.lessonTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-bold">
              صفحات كتاب الطالب الأصلي: ({activeInfographic.pagesRange}) • تاريخ المراجعة: {activeInfographic.lastUpdated}
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-slate-800 text-base sm:text-lg leading-relaxed space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2.5">
              <h4 className="font-black text-slate-950 text-lg">المفهوم العام:</h4>
              <p className="font-medium leading-relaxed">{activeInfographic.mainConcept.mainIdea}</p>
            </div>

            <div className="space-y-5">
              <h4 className="font-black text-slate-950 text-lg">أهم محاور الدرس:</h4>
              {activeInfographic.mindMap.branches.map((branch, bIdx) => (
                <div key={bIdx} className="border-r-3 border-blue-600 pr-5 space-y-2.5">
                  <h5 className="font-black text-slate-950 text-base sm:text-lg flex items-center gap-2">
                    <span>{branch.icon}</span>
                    <span>{branch.title}</span>
                  </h5>
                  <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">{branch.summary}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {branch.subBranches.map((sub, sIdx) => (
                      <div key={sIdx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-sm space-y-1">
                        <span className="font-black text-slate-950 block">{sub.name}</span>
                        <span className="text-slate-700 font-medium leading-relaxed">{sub.details}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Questions to review */}
            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 space-y-3">
              <h4 className="font-black text-amber-950 text-base">أسئلة الامتحانات المتوقعة لهذا الدرس:</h4>
              <ul className="space-y-2 text-xs">
                {activeInfographic.importantPanels.whyQuestions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-700 font-bold">•</span>
                    <div>
                      <span className="font-bold text-slate-900">{q.question}</span>
                      <p className="text-slate-700 mt-0.5">{q.answer}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 3: TEST YOUR KNOWLEDGE (اختبر معلوماتك في هذا الدرس) */}
      {/* ============================================================ */}
      {learningMode === 'quiz' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-200 pb-5 space-y-2 flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                تدريب فوري سريع • 5 أسئلة معتمدة
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                اختبار الدرس: {activeInfographic.lessonTitle}
              </h2>
              <p className="text-xs text-slate-500">
                مستخرجة مباشرة من كتاب التقييمات والأداءات الوزارية لنفس الدرس
              </p>
            </div>

            {quizSubmitted && quizScore && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                <span className="text-xs font-bold text-emerald-800 block">نتيجتك في الاختبار</span>
                <span className="text-xl font-black text-emerald-700">
                  {quizScore.correct} من {quizScore.total}
                </span>
              </div>
            )}
          </div>

          {drillQuestions.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              لا توجد أسئلة مسجلة لهذا الدرس حالياً.
            </p>
          ) : (
            <div className="space-y-6">
              {drillQuestions.map((q, idx) => {
                const studentAns = quizAnswers[q.id] || '';
                const isCorrect = studentAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() ||
                  (q.acceptableAnswers && q.acceptableAnswers.some(a => a.trim().toLowerCase() === studentAns.trim().toLowerCase()));

                return (
                  <div key={q.id} className="p-6 rounded-3xl border-2 border-slate-200 bg-slate-50/50 space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 font-bold">
                      <span className="font-black text-blue-800 bg-blue-100/70 px-3 py-1 rounded-xl">السؤال {idx + 1} من {drillQuestions.length}</span>
                      <span className="bg-white px-3 py-1 rounded-xl border border-slate-200 text-slate-700 font-semibold">
                        {q.section} • ص {q.sourcePage}
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg lg:text-xl font-black text-slate-950 leading-relaxed">
                      {q.prompt}
                    </h4>

                    {/* MCQ Options or Text input */}
                    {q.options && q.options.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {q.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            disabled={quizSubmitted}
                            onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            className={`p-4 rounded-2xl border-2 text-sm sm:text-base font-bold text-right transition-all cursor-pointer ${
                              studentAns === opt
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md font-black'
                                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-900'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="pt-2">
                        <input
                          type="text"
                          disabled={quizSubmitted}
                          value={studentAns}
                          onChange={(e) => setQuizAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                          placeholder="اكتب إجابتك هنا بدقة..."
                          className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-2xl text-base sm:text-lg font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600"
                        />
                      </div>
                    )}

                    {/* Feedback when submitted */}
                    {quizSubmitted && (
                      <div className={`p-4 rounded-2xl text-sm sm:text-base space-y-2 font-medium border-2 ${isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'}`}>
                        <div className="font-black text-base flex items-center gap-2">
                          <span>{isCorrect ? '✓ إجابة صحيحة وممتازة!' : '✗ إجابة غير دقيقة'}</span>
                        </div>
                        <p className="leading-relaxed">
                          <span className="font-black">الإجابة النموذجية المعتمدة في كتاب الطالب: </span>
                          <span className="font-bold underline">{q.correctAnswer}</span>
                        </p>
                        {q.explanation && (
                          <p className="text-xs sm:text-sm text-slate-700 mt-2 bg-white/70 p-3 rounded-xl border border-slate-200">
                            💡 {q.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Submit Button */}
              <div className="pt-4 flex items-center justify-between">
                {!quizSubmitted ? (
                  <button
                    onClick={handleQuizSubmit}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer"
                  >
                    تأكيد الإجابات وتصحيح الاختبار ✓
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setQuizAnswers({});
                      setQuizSubmitted(false);
                      setQuizScore(null);
                    }}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-2xl transition-all cursor-pointer"
                  >
                    إعادة المحاولة ↺
                  </button>
                )}

                <span className="text-xs text-slate-500 font-bold">
                  تُحتسب النقاط في ملفك الدراسي تلقائياً
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Map Hotspot Details Modal */}
      {activeHotspot && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📍</span>
                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    {activeHotspot.title}
                  </h4>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    {activeHotspot.category}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveHotspot(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>{activeHotspot.description}</p>
              
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-1">
                <span className="font-bold text-amber-950 block">الأهمية الجغرافية والتاريخية:</span>
                <p className="text-slate-800 text-xs">{activeHotspot.significance}</p>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2">
                <span>📖 التوثيق: {activeHotspot.textbookReference}</span>
                <button
                  onClick={() => speakText(`${activeHotspot.title}. ${activeHotspot.description}. ${activeHotspot.significance}`)}
                  className="text-blue-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  🔊 استمع
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveHotspot(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson in a Picture Lightbox Modal (الدرس في صورة) */}
      <LessonPosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        initialLessonId={currentLessonId}
        onSelectLesson={(lessonId) => handleLessonChange(lessonId)}
      />

    </div>
  );
};
