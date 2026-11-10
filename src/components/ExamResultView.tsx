import React from 'react';
import { ExamResult } from '../types/assessment';

interface ExamResultViewProps {
  result: ExamResult;
  onRetake: () => void;
  onNewExam: () => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  result,
  onRetake,
  onNewExam,
}) => {
  const isPassed = result.percentage >= 60;
  const isDistinction = result.percentage >= 85;

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Score Hero Card */}
      <div className={`rounded-3xl p-8 text-center text-white shadow-xl relative overflow-hidden mb-8 ${
        isDistinction 
          ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600'
          : isPassed
          ? 'bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900'
          : 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900'
      }`}>
        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-4xl shadow-inner border border-white/30">
            {isDistinction ? '🏆' : isPassed ? '⭐' : '📖'}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black mb-2 text-white">
            {isDistinction ? 'ممتاز مع مرتبة الشرف!' : isPassed ? 'أحسنت! لقد اجتزت الاختبار بنجاح' : 'تحتاج لمزيد من المذاكرة والمراجعة'}
          </h2>
          <p className="text-sm opacity-90 max-w-lg mx-auto mb-6">
            تم تسجيل نتيجتك في ملف تقدمك بـ International Education Egypt.
          </p>

          <div className="inline-flex items-center gap-6 bg-white/15 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/20">
            <div>
              <div className="text-xs uppercase tracking-wider opacity-80 mb-0.5">الدرجة الكلية</div>
              <div className="text-3xl font-black">{result.score} / {result.totalQuestions}</div>
            </div>
            <div className="w-px h-10 bg-white/30" />
            <div>
              <div className="text-xs uppercase tracking-wider opacity-80 mb-0.5">النسبة المئوية</div>
              <div className="text-3xl font-black">{result.percentage}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Performance by Skill */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span>📊</span>
            <span>التحليل حسب مجالات المهارة:</span>
          </h3>
          <div className="space-y-4">
            {Object.entries(result.skillStats).map(([skill, stat]) => {
              const pct = Math.round((stat.correct / stat.total) * 100);
              return (
                <div key={skill}>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>{skill}</span>
                    <span>{stat.correct} من {stat.total} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance by Lesson */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span>📚</span>
            <span>التحليل حسب الدروس:</span>
          </h3>
          <div className="space-y-3">
            {Object.entries(result.lessonStats).map(([lesson, stat]) => {
              const pct = Math.round((stat.correct / stat.total) * 100);
              return (
                <div key={lesson} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-800 line-clamp-1 flex-1 ml-2">{lesson}</span>
                  <span className={`px-2 py-0.5 rounded-md font-bold ${
                    pct >= 75 ? 'bg-emerald-100 text-emerald-800' : pct >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {stat.correct} / {stat.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={onRetake}
          className="px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>🔄</span>
          <span>إعادة هذا الاختبار</span>
        </button>
        <button
          onClick={onNewExam}
          className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>⚡</span>
          <span>إنشاء اختبار جديد</span>
        </button>
      </div>

    </div>
  );
};
