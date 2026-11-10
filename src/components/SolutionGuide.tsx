import React, { useState } from 'react';
import { QUESTIONS_DATABASE } from '../data/questionsData';
import { Question } from '../types/assessment';

export const SolutionGuide: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<number | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredQuestions = QUESTIONS_DATABASE.filter(q => {
    const matchesSearch = q.prompt.includes(searchTerm) || q.correctAnswer.includes(searchTerm) || q.lessonTitle.includes(searchTerm);
    const matchesUnit = selectedUnit === 'all' || q.unitId === selectedUnit;
    return matchesSearch && matchesUnit;
  });

  return (
    <div className="max-w-5xl mx-auto py-6">
      {/* Title */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-2 inline-block">
              📖 المرجع الشامل للإجابات
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              دليل الإجابات النموذجية والشروحات
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              تصفح جميع الأسئلة الواردة في كتاب الأداءات والتقييمات مع الإجابات النموذجية والشروحات والقواعد العلمية.
            </p>
          </div>
          <div className="text-center sm:text-left">
            <div className="text-2xl font-black text-blue-700">{filteredQuestions.length}</div>
            <div className="text-xs text-slate-400">سؤال متاح بالدليل</div>
          </div>
        </div>

        {/* Filter bars */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-100">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 ابحث في الأسئلة أو الإجابات أو الدروس..."
            className="w-full sm:w-2/3 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="w-full sm:w-1/3 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:border-blue-500"
          >
            <option value="all">جميع الوحدات الدراسية</option>
            <option value={1}>الوحدة 1: الملامح الطبيعية لآسيا وأوروبا</option>
            <option value={2}>الوحدة 2: الحضارات القديمة بآسيا وعلاقتها بمصر</option>
            <option value={3}>الوحدة 3: النظم البيئية بآسيا وأوروبا</option>
            <option value={4}>الوحدة 4: الحضارات القديمة بأوروبا وعلاقتها بمصر</option>
          </select>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const isExpanded = expandedId === q.id;
          return (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all hover:border-blue-300"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                      سؤال {idx + 1}
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500">{q.unitTitle}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-600 font-semibold">{q.section}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-400 text-[11px]">ص {q.sourcePage}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-relaxed">
                    {q.prompt}
                  </h3>
                </div>
                <div className="text-slate-400 text-xl font-bold px-2">
                  {isExpanded ? '▲' : '▼'}
                </div>
              </div>

              {isExpanded && (
                <div className="p-5 bg-slate-50 border-t border-slate-200/80 space-y-3 text-xs sm:text-sm">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
                    <div className="font-black mb-1 text-emerald-800">✅ الإجابة النموذجية المعتمدة:</div>
                    <div className="font-bold leading-relaxed">{q.correctAnswer}</div>
                  </div>

                  {q.explanation && (
                    <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700 leading-relaxed">
                      <div className="font-bold text-blue-800 mb-1">💡 الشرح والتوضيح العلمي:</div>
                      <div>{q.explanation}</div>
                    </div>
                  )}

                  {q.learningRule && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                      <div className="font-bold text-amber-800 mb-1">📌 قاعدة معرفية رئيسية:</div>
                      <div>{q.learningRule}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
