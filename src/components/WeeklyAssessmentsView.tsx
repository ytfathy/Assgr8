import React, { useState } from 'react';
import { Unit, Question } from '../types/assessment';
import { QuestionCard } from './QuestionCard';

interface WeeklyAssessmentsViewProps {
  units: Unit[];
  allQuestions: Question[];
  onAnswerSubmit: (questionId: string, isCorrect: boolean, studentAnswer: string) => void;
  onOpenInfographic?: (lessonId: string) => void;
}

export const WeeklyAssessmentsView: React.FC<WeeklyAssessmentsViewProps> = ({
  units,
  allQuestions,
  onAnswerSubmit,
  onOpenInfographic,
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState<number>(1);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedSection, setSelectedSection] = useState<string>('all');

  // Find active unit
  const activeUnit = units.find(u => u.id === selectedUnitId) || units[0];

  // Weeks available in this unit
  const unitWeeks = Array.from(
    new Set(activeUnit.lessons.flatMap(l => l.weeks))
  ).sort((a, b) => a - b);

  // Filter questions by week
  const weekQuestions = allQuestions.filter(q => {
    const matchesUnit = q.unitId === selectedUnitId;
    const matchesWeek = q.weekNumber === selectedWeek;
    const matchesSection = selectedSection === 'all' || q.section === selectedSection;
    return matchesUnit && matchesWeek && matchesSection;
  });

  const availableSections = Array.from(
    new Set(allQuestions.filter(q => q.unitId === selectedUnitId && q.weekNumber === selectedWeek).map(q => q.section))
  );

  return (
    <div className="max-w-5xl mx-auto py-6">
      
      {/* Unit Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {units.map(unit => {
          const isActive = unit.id === selectedUnitId;
          return (
            <button
              key={unit.id}
              onClick={() => {
                setSelectedUnitId(unit.id);
                const firstWeek = unit.lessons[0]?.weeks[0] || 1;
                setSelectedWeek(firstWeek);
                setSelectedSection('all');
              }}
              className={`flex-shrink-0 px-5 py-3 rounded-2xl text-sm sm:text-base font-black border-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-700 text-white border-blue-700 shadow-md shadow-blue-700/20'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{unit.title.split(':')[0]}</span>
              <span className="block text-xs font-semibold opacity-90 truncate max-w-[220px]">
                {unit.title.split(':')[1]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Week Selector Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-sm font-black text-slate-700 ml-2">اختر الأسبوع:</span>
            {unitWeeks.map(wk => (
              <button
                key={wk}
                onClick={() => {
                  setSelectedWeek(wk);
                  setSelectedSection('all');
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  selectedWeek === wk
                    ? 'bg-amber-400 text-amber-950 shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                الأسبوع {wk}
              </button>
            ))}
          </div>

          {/* Section filter */}
          {availableSections.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-600">القسم:</span>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 focus:border-blue-500"
              >
                <option value="all">كل الأقسام</option>
                {availableSections.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Questions list for selected week */}
      {weekQuestions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-400">
          <div className="text-4xl mb-2">📂</div>
          <p className="font-bold text-sm">لا توجد أسئلة تحت هذا التصنيف، جرب اختيار أسبوع أو قسم آخر.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500">
            <span>عرض أسئلة {activeUnit.title.split(':')[0]} - الأسبوع {selectedWeek}</span>
            <span className="bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full">{weekQuestions.length} سؤال متاح</span>
          </div>

          {weekQuestions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              questionIndex={idx}
              totalQuestions={weekQuestions.length}
              mode="practice"
              onAnswerSubmit={onAnswerSubmit}
              onOpenInfographic={onOpenInfographic}
            />
          ))}
        </div>
      )}

    </div>
  );
};
