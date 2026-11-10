import React, { useState, useMemo } from 'react';
import { Unit, Question, ExamConfig } from '../types/assessment';
import { QUESTIONS_DATABASE } from '../data/questionsData';

interface SmartExamGeneratorProps {
  units: Unit[];
  onStartExam: (config: ExamConfig) => void;
}

export const SmartExamGenerator: React.FC<SmartExamGeneratorProps> = ({
  units,
  onStartExam,
}) => {
  const [examTitle, setExamTitle] = useState('اختبار تقييمي مخصص - الدراسات الاجتماعية');
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [mode, setMode] = useState<'practice' | 'formal' | 'revision'>('formal');
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [randomize, setRandomize] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('all');

  // Count available questions for selected lessons
  const availableQuestionsCount = useMemo(() => {
    if (selectedLessonIds.length === 0) return 0;
    return QUESTIONS_DATABASE.filter(q => selectedLessonIds.includes(q.lessonId)).length;
  }, [selectedLessonIds]);

  // Lessons list with question counts
  const allLessons = useMemo(() => {
    const list: {
      id: string;
      title: string;
      unitTitle: string;
      unitId: number;
      questionCount: number;
    }[] = [];

    units.forEach(u => {
      u.lessons.forEach(l => {
        const qCount = QUESTIONS_DATABASE.filter(q => q.lessonId === l.id).length;
        list.push({
          id: l.id,
          title: l.title,
          unitTitle: u.title,
          unitId: u.id,
          questionCount: qCount,
        });
      });
    });

    return list;
  }, [units]);

  // Filtered lessons
  const filteredLessons = useMemo(() => {
    return allLessons.filter(lesson => {
      const matchesSearch = lesson.title.includes(searchTerm) || lesson.unitTitle.includes(searchTerm);
      return matchesSearch;
    });
  }, [allLessons, searchTerm]);

  const handleToggleLesson = (id: string) => {
    setSelectedLessonIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedLessonIds(allLessons.map(l => l.id));
  };

  const handleClearSelection = () => {
    setSelectedLessonIds([]);
  };

  const handleSelectUnit = (unitId: number) => {
    const unitLessonIds = allLessons.filter(l => l.unitId === unitId).map(l => l.id);
    const allSelected = unitLessonIds.every(id => selectedLessonIds.includes(id));
    
    if (allSelected) {
      setSelectedLessonIds(prev => prev.filter(id => !unitLessonIds.includes(id)));
    } else {
      setSelectedLessonIds(prev => Array.from(new Set([...prev, ...unitLessonIds])));
    }
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLessonIds.length === 0) {
      alert('يرجى اختيار درس واحد على الأقل لإنشاء الامتحان.');
      return;
    }

    const finalCount = Math.min(questionCount, availableQuestionsCount);

    onStartExam({
      title: examTitle || 'اختبار تقييمي مخصص',
      selectedLessonIds,
      questionCount: finalCount,
      mode,
      durationMinutes,
      randomize,
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-4">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-blue-500/20 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-right">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-950 px-3.5 py-1 rounded-full text-xs font-black mb-3">
              <span>⚡ ميزة حصرية</span>
              <span>•</span>
              <span>منشئ الامتحانات الذكي 100% من الكتاب الأصلي</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-2 text-white">
              إنشاء وتخصيص اختبار تفاعلي مخصص
            </h2>
            <p className="text-blue-100 text-sm max-w-2xl leading-relaxed">
              اختر الدروس والوحدات التي ترغب باختبار نفسك فيها، وحدد عدد الأسئلة ونمط الاختبار، واستمتع بتجربة تقييم دقيقة وشاملة مع التصحيح وحساب النسبة المئوية.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center min-w-[160px]">
            <div className="text-xs text-blue-200 mb-1">الدروس المحددة</div>
            <div className="text-3xl font-black text-amber-300 mb-1">
              {selectedLessonIds.length} <span className="text-sm text-white">درس</span>
            </div>
            <div className="text-[11px] text-blue-200">
              ({availableQuestionsCount} سؤال متاح)
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Lesson Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>📚</span>
                  <span>تحديد الدروس والوحدات المطلوبة</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  يمكنك الدمج بين وحدات ودروس مختلفة لإنشاء اختبار تراكمي ذكي.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  تحديد الكل
                </button>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  إلغاء التحديد
                </button>
              </div>
            </div>

            {/* Search Filter */}
            <div className="mb-5">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 ابحث عن اسم الدرس أو موضوع الوحدة..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Units & Lessons Accordion List */}
            <div className="space-y-4">
              {units.map((unit) => {
                const unitLessons = unit.lessons;
                const unitLessonIds = unitLessons.map(l => l.id);
                const isAllSelected = unitLessonIds.every(id => selectedLessonIds.includes(id));
                const isPartiallySelected = unitLessonIds.some(id => selectedLessonIds.includes(id)) && !isAllSelected;

                return (
                  <div key={unit.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                    {/* Unit Header */}
                    <div className="bg-slate-50/80 p-3.5 flex items-center justify-between border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={el => {
                            if (el) el.indeterminate = isPartiallySelected;
                          }}
                          onChange={() => handleSelectUnit(unit.id)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="font-bold text-slate-800 text-sm">
                          {unit.title}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {unit.lessons.length} دروس
                      </span>
                    </div>

                    {/* Lessons inside unit */}
                    <div className="divide-y divide-slate-100 p-2 bg-white">
                      {unitLessons.map((lesson) => {
                        const isChecked = selectedLessonIds.includes(lesson.id);
                        const qCount = QUESTIONS_DATABASE.filter(q => q.lessonId === lesson.id).length;

                        return (
                          <label
                            key={lesson.id}
                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                              isChecked ? 'bg-blue-50/70 text-blue-950 font-bold' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleLesson(lesson.id)}
                                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="text-xs sm:text-sm">{lesson.title}</span>
                            </div>
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                              {qCount} أسئلة
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Right Column: Exam Customization */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-28">
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
              <span>⚙️</span>
              <span>إعدادات وتخصيص الاختبار</span>
            </h3>

            {/* Exam Title */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                عنوان الاختبار:
              </label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Exam Mode */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نمط التقييم:
              </label>
              <div className="space-y-2">
                <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                  mode === 'formal' ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="examMode"
                    value="formal"
                    checked={mode === 'formal'}
                    onChange={() => setMode('formal')}
                    className="mt-0.5 text-blue-600"
                  />
                  <div>
                    <div className="font-bold">اختبار رسمي (Formal Exam)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">لا تظهر الإجابات إلا بعد تسليم الاختبار بالكامل لحساب الدرجة والنسبة.</div>
                  </div>
                </label>

                <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                  mode === 'practice' ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="examMode"
                    value="practice"
                    checked={mode === 'practice'}
                    onChange={() => setMode('practice')}
                    className="mt-0.5 text-blue-600"
                  />
                  <div>
                    <div className="font-bold">اختبار تدريبي (Practice Exam)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">تصحيح فوري بعد كل سؤال مع التغذية الراجعة والشرح.</div>
                  </div>
                </label>

                <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                  mode === 'revision' ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="examMode"
                    value="revision"
                    checked={mode === 'revision'}
                    onChange={() => setMode('revision')}
                    className="mt-0.5 text-blue-600"
                  />
                  <div>
                    <div className="font-bold">اختبار مراجعة (Revision Exam)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">عرض الأسئلة مصحوبة بالإجابات النموذجية والشرح للمذاكرة.</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Question Count Slider */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>عدد الأسئلة:</span>
                <span className="text-blue-700 font-black text-sm">{Math.min(questionCount, availableQuestionsCount || 10)} سؤال</span>
              </div>
              <input
                type="range"
                min={3}
                max={Math.max(5, availableQuestionsCount || 20)}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>3 أسئلة</span>
                <span>الحد الأقصى المتاح ({availableQuestionsCount})</span>
              </div>
            </div>

            {/* Exam Duration */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                زمن الاختبار:
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:border-blue-500"
              >
                <option value={10}>10 دقائق (سريع)</option>
                <option value={20}>20 دقيقة (متوسط)</option>
                <option value={30}>30 دقيقة (شامل)</option>
                <option value={45}>45 دقيقة (اختبار نهائي)</option>
                <option value={0}>بدون وقت محدد (حر)</option>
              </select>
            </div>

            {/* Randomize order */}
            <div className="mb-6">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={randomize}
                  onChange={(e) => setRandomize(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span>ترتيب عشوائي للأسئلة</span>
              </label>
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              disabled={selectedLessonIds.length === 0}
              className="w-full bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-3.5 px-4 rounded-xl shadow-lg shadow-blue-700/25 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>🚀</span>
              <span>بدء الاختبار الآن</span>
            </button>

            {selectedLessonIds.length === 0 && (
              <p className="text-center text-[11px] text-rose-500 mt-2 font-medium">
                يرجى تحديد درس واحد على الأقل للمتابعة
              </p>
            )}

          </div>
        </div>

      </form>
    </div>
  );
};
