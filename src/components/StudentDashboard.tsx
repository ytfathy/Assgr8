import React from 'react';
import { StudentProgress } from '../types/assessment';
import { getStudentRank } from '../utils/arabicValidation';

interface StudentDashboardProps {
  progress: StudentProgress;
  onUpdateName: (name: string) => void;
  onResetProgress: () => void;
  totalQuestionsBank: number;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  progress,
  onUpdateName,
  onResetProgress,
  totalQuestionsBank,
}) => {
  const rank = getStudentRank(progress.points);
  const answeredCount = progress.answeredQuestionIds.length;
  const correctCount = progress.correctQuestionIds.length;
  const accuracyPct = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto py-6">
      
      {/* Student Badge Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center text-4xl shadow-md border-2 border-amber-300">
              🎓
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-black ${rank.badgeColor}`}>
                  {rank.title}
                </span>
                <span className="text-xs text-slate-400">الصف الثاني الإعدادي</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <span>الطالب: </span>
                <input
                  type="text"
                  value={progress.studentName}
                  onChange={(e) => onUpdateName(e.target.value)}
                  className="border-b-2 border-dotted border-blue-400 focus:border-blue-700 outline-none px-1 text-blue-900 font-black bg-transparent"
                />
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                انضم لمجتمع المتعلمين المتميزين في International Education Egypt
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="text-center px-3">
              <div className="text-xs text-slate-500">إجمالي النقاط</div>
              <div className="text-2xl font-black text-amber-600">{progress.points}</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center px-3">
              <div className="text-xs text-slate-500">الدقة العامة</div>
              <div className="text-2xl font-black text-blue-700">{accuracyPct}%</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center px-3">
              <div className="text-xs text-slate-500">الأسئلة المنجزة</div>
              <div className="text-2xl font-black text-emerald-600">{answeredCount}/{totalQuestionsBank}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges and Achievements */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
          <span>🏅</span>
          <span>الأوسمة وشارات الإنجاز الأكاديمي</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {progress.badges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  isUnlocked 
                    ? 'bg-amber-50/70 border-amber-300 text-amber-950 shadow-sm' 
                    : 'bg-slate-50/50 border-slate-200 text-slate-400 grayscale'
                }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <div className="font-bold text-sm mb-1">{badge.title}</div>
                <div className="text-[11px] leading-tight opacity-80">{badge.description}</div>
                {isUnlocked && (
                  <div className="mt-2 text-[10px] font-bold text-amber-700 bg-amber-200/60 py-0.5 rounded-md">
                    مكتمل ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Exam History table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
          <span>📜</span>
          <span>سجل الاختبارات المنجزة</span>
        </h3>

        {progress.examHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            لم تقم بخوض أي اختبارات مولدة بعد. اضغط على "منشئ الامتحانات الذكي" لتبدأ أول اختبار!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-700 text-xs font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">عنوان الاختبار</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">عدد الأسئلة</th>
                  <th className="p-3">الدرجة</th>
                  <th className="p-3">النسبة</th>
                  <th className="p-3">التقدير</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {progress.examHistory.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{ex.examTitle}</td>
                    <td className="p-3 text-slate-500 text-xs">{ex.date}</td>
                    <td className="p-3 text-slate-700">{ex.totalQuestions}</td>
                    <td className="p-3 text-blue-700 font-bold">{ex.score} / {ex.totalQuestions}</td>
                    <td className="p-3 font-black">{ex.percentage}%</td>
                    <td className="p-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        ex.percentage >= 85 ? 'bg-emerald-100 text-emerald-800' : ex.percentage >= 60 ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {ex.percentage >= 85 ? 'ممتاز' : ex.percentage >= 60 ? 'جيد' : 'يحتاج مراجعة'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset progress */}
      <div className="text-center pt-4">
        <button
          onClick={() => {
            if (confirm('هل أنت متأكد من رغبتك في إعادة ضبط وحذف سجل درجاتك والبدء من جديد؟')) {
              onResetProgress();
            }
          }}
          className="text-xs text-rose-600 hover:text-rose-800 font-bold transition-colors"
        >
          🗑️ إعادة ضبط كل التقدم والبدء من جديد
        </button>
      </div>

    </div>
  );
};
