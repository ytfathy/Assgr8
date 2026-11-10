import React, { useState } from 'react';
import { Question } from '../types/assessment';
import { validateArabicAnswer } from '../utils/arabicValidation';
import { TextbookPageModal } from './TextbookPageModal';
import { LessonPosterModal } from './LessonPosterModal';
import { Maximize2, ZoomIn, BookOpen } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  mode: 'practice' | 'formal' | 'revision';
  onAnswerSubmit: (questionId: string, isCorrect: boolean, studentAnswer: string) => void;
  showLearningAids?: boolean;
  onOpenInfographic?: (lessonId: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionIndex,
  totalQuestions,
  mode,
  onAnswerSubmit,
  showLearningAids = true,
  onOpenInfographic,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(mode === 'revision');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(mode === 'revision' ? true : null);
  const [revealedHint, setRevealedHint] = useState<boolean>(false);
  const [showPageModal, setShowPageModal] = useState<boolean>(false);
  const [showPosterModal, setShowPosterModal] = useState<boolean>(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (submitted && mode !== 'formal') return;

    const answerToCheck = question.options ? selectedOption : textInput;
    if (!answerToCheck.trim()) return;

    let correct = false;
    if (question.options) {
      correct = answerToCheck.trim() === question.correctAnswer.trim();
    } else {
      correct = validateArabicAnswer(answerToCheck, question.correctAnswer, question.acceptableAnswers);
    }

    setIsCorrect(correct);
    setSubmitted(true);
    onAnswerSubmit(question.id, correct, answerToCheck);
  };

  const getDifficultyBadge = () => {
    switch (question.difficulty) {
      case 'سهل':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">سهل</span>;
      case 'متوسط':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">متوسط</span>;
      case 'متقدم':
        return <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full font-bold">متقدم</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 mb-6 transition-all hover:shadow-md">
      {/* Textbook Page Lightbox Modal */}
      <TextbookPageModal
        initialPage={question.sourcePage || (question.pageCrop ? question.pageCrop.pageNumber : 1)}
        isOpen={showPageModal}
        onClose={() => setShowPageModal(false)}
      />

      {/* Lesson in a Picture Lightbox Modal (الدرس في صورة) */}
      <LessonPosterModal
        initialLessonId={question.lessonId}
        isOpen={showPosterModal}
        onClose={() => setShowPosterModal(false)}
      />

      {/* Top Meta info */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-100 pb-3 mb-4 text-xs sm:text-sm font-bold text-slate-600">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-xl font-black text-xs sm:text-sm">
            سؤال {questionIndex + 1} من {totalQuestions}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-700 bg-slate-100 px-3 py-1 rounded-xl font-bold">{question.section}</span>
          <span className="text-slate-300">|</span>
          <span className="text-blue-800 bg-blue-50 px-3 py-1 rounded-xl font-black">{question.skillCategory}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {getDifficultyBadge()}
          {onOpenInfographic && (
            <button
              type="button"
              onClick={() => onOpenInfographic(question.lessonId)}
              className="flex items-center gap-1.5 text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow-2xs"
              title="فتح لوحة الشرح البصري والإنفوجرافيك لهذا الدرس في ذاكر لي"
            >
              <span>💡</span>
              <span>ذاكر لي</span>
            </button>
          )}
          {/* USER REQUESTED: الدرس في صورة */}
          <button
            type="button"
            onClick={() => setShowPosterModal(true)}
            className="flex items-center gap-1.5 text-amber-950 bg-gradient-to-r from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 border border-amber-400/80 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow-2xs active:scale-95"
            title="عرض ملصق الدرس في صورة لهذا السؤال بدقة فائقة"
          >
            <span>🖼️</span>
            <span>الدرس في صورة</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPageModal(true)}
            className="flex items-center gap-1.5 text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs"
            title="فتح صفحة الكتاب المدرسي كاملة بدقة فائقة"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>ص {question.sourcePage} بالكتاب الأصلي</span>
          </button>
        </div>
      </div>

      {/* Lesson title */}
      <div className="text-xs sm:text-sm text-slate-500 mb-2 font-bold flex items-center gap-1.5">
        <span>📖</span>
        <span>{question.unitTitle} • {question.lessonTitle}</span>
      </div>

      {/* Main Prompt */}
      <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-950 mb-3.5 leading-relaxed tracking-tight">
        {question.prompt}
      </h3>

      {question.subPrompt && (
        <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-amber-950 text-sm sm:text-base mb-4 leading-relaxed font-semibold">
          💡 <span className="font-black">إرشاد السؤال:</span> {question.subPrompt}
        </div>
      )}

      {/* Visual illustration / Map cropped from official textbook page */}
      {question.pageCrop && (
        <div className="my-4 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md bg-white">
          <div className="bg-gradient-to-r from-amber-100 to-amber-50 px-3 py-2 border-b border-amber-200 text-xs font-bold text-amber-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>🗺️</span>
              <span>خريطة / شكل توضيحي من الكتاب الأصلي (صفحة {question.pageCrop.pageNumber})</span>
            </span>
            <button
              type="button"
              onClick={() => setShowPageModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>تكبير الصفحة بالكامل بدقة عالية</span>
            </button>
          </div>
          <div 
            onClick={() => setShowPageModal(true)}
            title="انقر لتكبير وتصفح الخريطة بالكامل بدقة فائقة"
            className="w-full relative overflow-hidden bg-slate-100 flex items-start justify-center cursor-pointer group"
            style={{
              height: '300px'
            }}
          >
            <img
              src={`/assets/pages/page_${question.pageCrop.pageNumber}.jpg`}
              alt={`خريطة توضيحية صفحة ${question.pageCrop.pageNumber}`}
              className="w-full object-cover select-none pointer-events-none transition-transform duration-300 group-hover:scale-[1.02]"
              style={{
                transform: `translateY(-${question.pageCrop.top}%)`,
              }}
            />
            <div className="absolute inset-0 bg-blue-950/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="bg-slate-900/85 backdrop-blur text-white px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl">
                <ZoomIn className="w-4 h-4 text-amber-300" />
                <span>انقر لفتح الصفحة كاملة والتكبير بحرية</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Direct image url if provided */}
      {question.imageUrl && !question.pageCrop && (
        <div 
          className="my-4 rounded-2xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer" 
          onClick={() => setShowPageModal(true)}
          title="انقر لتكبير الصورة"
        >
          <img
            src={question.imageUrl}
            alt="صورة السؤال"
            className="w-full max-h-72 object-contain bg-slate-50"
          />
        </div>
      )}

      {/* Interactive Answer Area */}
      {question.options && question.options.length > 0 ? (
        // Multiple Choice
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5">
          {question.options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isThisCorrect = opt === question.correctAnswer;
            let btnClass = 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-900 bg-white shadow-2xs';

            if (submitted && mode !== 'formal') {
              if (isThisCorrect) {
                btnClass = 'border-emerald-500 bg-emerald-50/90 text-emerald-950 font-black ring-2 ring-emerald-500 shadow-sm';
              } else if (isSelected && !isCorrect) {
                btnClass = 'border-rose-400 bg-rose-50 text-rose-950 line-through opacity-80';
              }
            } else if (isSelected) {
              btnClass = 'border-blue-600 bg-blue-50 text-blue-950 font-black ring-2 ring-blue-500 shadow-sm';
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={submitted && mode !== 'formal'}
                onClick={() => setSelectedOption(opt)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 text-right transition-all text-base sm:text-lg font-bold cursor-pointer ${btnClass}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-black text-sm border border-slate-300">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{opt}</span>
                </div>
                {submitted && mode !== 'formal' && isThisCorrect && (
                  <span className="text-emerald-700 font-black text-sm bg-emerald-100/80 px-2 py-0.5 rounded-lg">✓ صحيحة</span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        // Text / Definition / Reason / Sentence Completion
        <form onSubmit={handleSubmit} className="my-5">
          <label className="block text-sm sm:text-base font-black text-slate-800 mb-2">
            اكتب إجابتك هنا بدقة ووضوح:
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={textInput}
              disabled={submitted && mode !== 'formal'}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="اكتب الإجابة باللغة العربية كما وردت في كتاب الطالب..."
              className="w-full p-4 rounded-2xl border-2 border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-base sm:text-lg font-bold text-slate-900 transition-all resize-y leading-relaxed bg-slate-50/50 focus:bg-white"
            />
          </div>
        </form>
      )}

      {/* Action button */}
      {(!submitted || mode === 'formal') && (
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setRevealedHint(!revealedHint)}
            className="text-sm font-black text-blue-700 hover:text-blue-900 flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <span>💡</span>
            <span>{revealedHint ? 'إخفاء التلميح' : 'عرض فكرة الحل'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={(!selectedOption && !textInput.trim())}
            className="bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base px-7 py-3 rounded-2xl shadow-lg shadow-blue-700/25 transition-all cursor-pointer active:scale-98"
          >
            تأكيد الإجابة
          </button>
        </div>
      )}

      {/* Hint display */}
      {revealedHint && (
        <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900">
          <span className="font-bold">تلميح لمساعدتك:</span> ابحث في موضوع ({question.lessonTitle}) وركز في المصطلحات والمواقع الجغرافية أو الأحداث التاريخية المرتبطة.
        </div>
      )}

      {/* Feedback Panel (in practice & revision mode) */}
      {submitted && mode !== 'formal' && (
        <div className={`mt-6 p-5 rounded-2xl border-2 transition-all ${
          isCorrect 
            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-sm' 
            : 'bg-rose-50 border-rose-400 text-rose-950 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 font-black text-base sm:text-lg mb-3">
            <span className="text-xl">{isCorrect ? '🎉 ممتاز! إجابة صحيحة ومطابقة' : '❌ إجابة تحتاج للمراجعة والتدقيق'}</span>
          </div>

          <div className="space-y-3 text-sm sm:text-base leading-relaxed">
            <div className="p-3 bg-white/90 rounded-xl border border-slate-200">
              <span className="font-black text-slate-800">الإجابة النموذجية المعتمدة في كتاب الطالب: </span>
              <span className="font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 block sm:inline-block mt-1 sm:mt-0">
                {question.correctAnswer}
              </span>
            </div>

            {question.explanation && (
              <div className="text-slate-800 leading-relaxed bg-white/80 p-3.5 rounded-xl border border-slate-200 mt-2 font-medium">
                <span className="font-black text-blue-900 block mb-1">الشرح والتوضيح العلمي المعتمد: </span>
                {question.explanation}
              </div>
            )}

            {question.learningRule && showLearningAids && (
              <div className="text-amber-950 bg-amber-100/70 p-3.5 rounded-xl border border-amber-300 font-semibold leading-relaxed">
                <span className="font-black text-amber-900 block mb-1">قاعدة تعليمية هامة من الكتاب: </span>
                {question.learningRule}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
