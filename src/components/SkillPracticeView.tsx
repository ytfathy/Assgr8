import React, { useState } from 'react';
import { Question, SkillCategory } from '../types/assessment';
import { QuestionCard } from './QuestionCard';

interface SkillPracticeViewProps {
  allQuestions: Question[];
  onAnswerSubmit: (questionId: string, isCorrect: boolean, studentAnswer: string) => void;
  onOpenInfographic?: (lessonId: string) => void;
}

export const SkillPracticeView: React.FC<SkillPracticeViewProps> = ({
  allQuestions,
  onAnswerSubmit,
  onOpenInfographic,
}) => {
  const skillsList: { id: SkillCategory; title: string; icon: string; desc: string }[] = [
    {
      id: 'الجغرافيا ومظاهر السطح',
      title: 'الجغرافيا والتضاريس والخرائط',
      icon: '🌍',
      desc: 'الموقع الفلكي والجغرافي لقارتي آسيا وأوروبا، السلاسل الجبلية والهضاب والسهول والأنهار'
    },
    {
      id: 'المعادن ومصادر الطاقة',
      title: 'المعادن ومصادر الطاقة والمناجم الخضراء',
      icon: '⚡',
      desc: 'الحديد، المنجنيز، البوكسيت، التيتانيوم، الطاقة المتجددة، الفحم والبترول والغاز'
    },
    {
      id: 'النظم البيئية والمناخ',
      title: 'النظم البيئية والمناخ والشعاب المرجانية',
      icon: '🌿',
      desc: 'الغابات المدارية والنفضية، حشائش السافانا والإستبس والتندرا، الصحاري والمانجروف'
    },
    {
      id: 'الحضارات القديمة والشرق الأدنى',
      title: 'حضارات بلاد العراق القديم وفينيقيا',
      icon: '🏛️',
      desc: 'السومريون والأكاديون، بابل وحمورابي، الكتابة المسمارية، الأبجدية الفينيقية وقرطاج'
    },
    {
      id: 'حضارات اليمن والشرق الأقصى',
      title: 'حضارات اليمن القديم والهند والصين',
      icon: '🏯',
      desc: 'سد مأرب، خط المسند، حضارات معين وسبأ وحمير، حضارة الهند القديمة وسور الصين وطريق الحرير'
    },
    {
      id: 'الحضارة الإسلامية',
      title: 'الحضارة الإسلامية وعوامل قيامها',
      icon: '🕌',
      desc: 'الدولة الأموية والدولة العباسية، عواصم الخلافة، حركة الترجمة والتأثير في النهضة الأوروبية'
    },
    {
      id: 'الحضارة اليونانية والرومانية',
      title: 'الحضارة اليونانية والرومانية والحقبة القبطية',
      icon: '⛵',
      desc: 'الإسكندرية، البطالمة، دقلديانوس والشهداء، قسطنطين، نشأة الرهبنة المصرية والفن القبطي'
    },
  ];

  const [activeSkill, setActiveSkill] = useState<SkillCategory>(skillsList[0].id);

  // Filter questions for active skill
  const skillQuestions = allQuestions.filter(q => q.skillCategory === activeSkill);

  return (
    <div className="max-w-5xl mx-auto py-6">
      
      {/* Header Info */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-sm">
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-2 inline-block">
          🎯 النمط التخصصي والمهاري
        </span>
        <h2 className="text-2xl font-black text-slate-900">
          التدريب المنظم حسب المهارة والموضوع
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          جميع أسئلة الكتاب مجمعة ومنظمة حسب المجال المعرفي والمهاري لتعميق الفهم وإتقان المفاهيم المركبة.
        </p>

        {/* Skill Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-6">
          {skillsList.map((skill) => {
            const isActive = activeSkill === skill.id;
            const count = allQuestions.filter(q => q.skillCategory === skill.id).length;

            return (
              <button
                key={skill.id}
                onClick={() => setActiveSkill(skill.id)}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                  isActive
                    ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{skill.icon}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {count} أسئلة
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{skill.title}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{skill.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Questions list for selected skill */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500">
          <span>أسئلة تخصصية: {activeSkill}</span>
          <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full">{skillQuestions.length} سؤال متاح</span>
        </div>

        {skillQuestions.map((q, idx) => (
          <QuestionCard
            key={q.id}
            question={q}
            questionIndex={idx}
            totalQuestions={skillQuestions.length}
            mode="practice"
            onAnswerSubmit={onAnswerSubmit}
            onOpenInfographic={onOpenInfographic}
          />
        ))}
      </div>

    </div>
  );
};
