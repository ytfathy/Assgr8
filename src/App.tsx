/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UNITS_DATA } from './data/curriculumUnits';
import { QUESTIONS_DATABASE } from './data/questionsData';
import { ExamConfig, ExamResult, StudentProgress } from './types/assessment';
import { Navbar } from './components/Navbar';
import { HomeHero } from './components/HomeHero';
import { WeeklyAssessmentsView } from './components/WeeklyAssessmentsView';
import { SkillPracticeView } from './components/SkillPracticeView';
import { SmartExamGenerator } from './components/SmartExamGenerator';
import { ActiveExam } from './components/ActiveExam';
import { ExamResultView } from './components/ExamResultView';
import { StudentDashboard } from './components/StudentDashboard';
import { SolutionGuide } from './components/SolutionGuide';
import { TextbookPageModal } from './components/TextbookPageModal';
import { ZakerLiView } from './components/ZakerLiView';
import { AdminDashboard } from './components/AdminDashboard';
import { calculatePoints } from './utils/arabicValidation';

const INITIAL_PROGRESS: StudentProgress = {
  studentName: 'طالب متميز',
  points: 120,
  level: 1,
  answeredQuestionIds: [],
  correctQuestionIds: [],
  incorrectQuestionIds: [],
  completedWeeks: [],
  completedLessons: [],
  streakDays: 3,
  lastActiveDate: new Date().toISOString(),
  examHistory: [],
  badges: [
    {
      id: 'first_step',
      title: 'الخطوة الأولى',
      description: 'حل أول سؤال في المنصة بنجاح',
      icon: '🌱',
      unlockedAt: new Date().toISOString(),
    },
    {
      id: 'explorer',
      title: 'خبير الخرائط',
      description: 'إجابة 5 أسئلة تضاريس وخرائط بدقة',
      icon: '🧭',
      unlockedAt: new Date().toISOString(),
    },
    {
      id: 'exam_master',
      title: 'بطل الاختبارات',
      description: 'اجتياز اختبار مخصص بنسبة 80% أو أكثر',
      icon: '🏆',
    },
    {
      id: 'perfectionist',
      title: 'العلامة الكاملة',
      description: 'الحصول على 100% في أي تقييم أسبوعي',
      icon: '⭐',
    },
  ],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [progress, setProgress] = useState<StudentProgress>(() => {
    try {
      const saved = localStorage.getItem('iee_arabic_progress_g6');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROGRESS;
  });

  // Active exam state
  const [activeExamConfig, setActiveExamConfig] = useState<ExamConfig | null>(null);
  const [activeExamQuestions, setActiveExamQuestions] = useState<typeof QUESTIONS_DATABASE>([]);
  const [lastExamResult, setLastExamResult] = useState<ExamResult | null>(null);
  const [textbookModalOpen, setTextbookModalOpen] = useState<boolean>(false);
  const [selectedLessonForInfographic, setSelectedLessonForInfographic] = useState<string>('u1_l1');

  const handleOpenLessonInfographic = (lessonId: string) => {
    setSelectedLessonForInfographic(lessonId);
    setActiveTab('zaker_li');
  };

  // Font size setting (normal: 18px, large: 20px, xlarge: 22px)
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>(() => {
    try {
      const saved = localStorage.getItem('iee_font_size');
      if (saved === 'normal' || saved === 'large' || saved === 'xlarge') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'normal';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
    try {
      localStorage.setItem('iee_font_size', fontSize);
    } catch (e) {
      console.error(e);
    }
  }, [fontSize]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('iee_arabic_progress_g6', JSON.stringify(progress));
    } catch (e) {
      console.error(e);
    }
  }, [progress]);

  // Handle single question answers in Weekly/Skill view
  const handleAnswerSubmit = (questionId: string, isCorrect: boolean, _studentAnswer: string) => {
    const q = QUESTIONS_DATABASE.find(item => item.id === questionId);
    if (!q) return;

    const earned = isCorrect ? calculatePoints(q.difficulty, true) : 2;

    setProgress(prev => {
      const answeredSet = new Set(prev.answeredQuestionIds);
      answeredSet.add(questionId);

      const correctSet = new Set(prev.correctQuestionIds);
      const incorrectSet = new Set(prev.incorrectQuestionIds);

      if (isCorrect) {
        correctSet.add(questionId);
        incorrectSet.delete(questionId);
      } else {
        incorrectSet.add(questionId);
      }

      return {
        ...prev,
        points: prev.points + earned,
        answeredQuestionIds: Array.from(answeredSet),
        correctQuestionIds: Array.from(correctSet),
        incorrectQuestionIds: Array.from(incorrectSet),
      };
    });
  };

  // Launch customized exam
  const handleStartExam = (config: ExamConfig) => {
    let pool = QUESTIONS_DATABASE.filter(q => config.selectedLessonIds.includes(q.lessonId));

    if (config.randomize) {
      pool = [...pool].sort(() => Math.random() - 0.5);
    }

    const selectedPool = pool.slice(0, config.questionCount);
    setActiveExamConfig(config);
    setActiveExamQuestions(selectedPool);
    setLastExamResult(null);
  };

  const handleFinishExam = (result: ExamResult) => {
    setLastExamResult(result);
    setActiveExamConfig(null);

    // Update progress with exam rewards
    setProgress(prev => {
      const earned = result.score * 15;
      const updatedHistory = [result, ...prev.examHistory];
      const updatedBadges = prev.badges.map(b => {
        if (b.id === 'exam_master' && result.percentage >= 80 && !b.unlockedAt) {
          return { ...b, unlockedAt: new Date().toISOString() };
        }
        if (b.id === 'perfectionist' && result.percentage === 100 && !b.unlockedAt) {
          return { ...b, unlockedAt: new Date().toISOString() };
        }
        return b;
      });

      return {
        ...prev,
        points: prev.points + earned,
        examHistory: updatedHistory,
        badges: updatedBadges,
      };
    });
  };

  const handleRetakeExam = () => {
    if (!lastExamResult) return;
    const config: ExamConfig = {
      title: lastExamResult.examTitle,
      selectedLessonIds: UNITS_DATA.flatMap(u => u.lessons.map(l => l.id)),
      questionCount: lastExamResult.totalQuestions,
      mode: 'formal',
      durationMinutes: 20,
      randomize: true,
    };
    handleStartExam(config);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900" dir="rtl">
      
      {/* Brand Navigation */}
      <Navbar
        activeTab={activeExamConfig ? 'generator' : activeTab}
        setActiveTab={(tab) => {
          if (activeExamConfig) {
            if (confirm('أنت الآن داخل جلسة اختبار، هل تريد الخروج وفقدان التقدم الحالي؟')) {
              setActiveExamConfig(null);
              setActiveTab(tab);
            }
          } else {
            setActiveTab(tab);
          }
        }}
        points={progress.points}
        studentName={progress.studentName}
        onOpenProfile={() => setActiveTab('progress')}
        onOpenTextbook={() => setTextbookModalOpen(true)}
        onOpenAdmin={() => setActiveTab('admin_infographics')}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />

      {/* Global Textbook Page Lightbox Modal */}
      <TextbookPageModal
        initialPage={1}
        isOpen={textbookModalOpen}
        onClose={() => setTextbookModalOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* If an exam is currently being taken */}
        {activeExamConfig ? (
          <ActiveExam
            config={activeExamConfig}
            questions={activeExamQuestions}
            onFinishExam={handleFinishExam}
            onCancelExam={() => setActiveExamConfig(null)}
          />
        ) : lastExamResult && activeTab === 'generator' ? (
          <ExamResultView
            result={lastExamResult}
            onRetake={handleRetakeExam}
            onNewExam={() => setLastExamResult(null)}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeHero
                onStartMode={(tab) => setActiveTab(tab)}
                units={UNITS_DATA}
                totalQuestions={QUESTIONS_DATABASE.length}
              />
            )}

            {activeTab === 'zaker_li' && (
              <ZakerLiView
                units={UNITS_DATA}
                allQuestions={QUESTIONS_DATABASE}
                selectedLessonId={selectedLessonForInfographic}
                onSelectLesson={(lessonId) => setSelectedLessonForInfographic(lessonId)}
                onAnswerSubmit={handleAnswerSubmit}
                onOpenTextbookPage={(_page) => setTextbookModalOpen(true)}
                onOpenAdminDashboard={() => setActiveTab('admin_infographics')}
              />
            )}

            {activeTab === 'admin_infographics' && (
              <AdminDashboard
                units={UNITS_DATA}
                onPreviewLesson={(lessonId) => {
                  setSelectedLessonForInfographic(lessonId);
                  setActiveTab('zaker_li');
                }}
                onClose={() => setActiveTab('zaker_li')}
              />
            )}

            {activeTab === 'weekly' && (
              <WeeklyAssessmentsView
                units={UNITS_DATA}
                allQuestions={QUESTIONS_DATABASE}
                onAnswerSubmit={handleAnswerSubmit}
                onOpenInfographic={handleOpenLessonInfographic}
              />
            )}

            {activeTab === 'skills' && (
              <SkillPracticeView
                allQuestions={QUESTIONS_DATABASE}
                onAnswerSubmit={handleAnswerSubmit}
                onOpenInfographic={handleOpenLessonInfographic}
              />
            )}

            {activeTab === 'generator' && (
              <SmartExamGenerator
                units={UNITS_DATA}
                onStartExam={handleStartExam}
              />
            )}

            {activeTab === 'progress' && (
              <StudentDashboard
                progress={progress}
                totalQuestionsBank={QUESTIONS_DATABASE.length}
                onUpdateName={(name) => setProgress(p => ({ ...p, studentName: name }))}
                onResetProgress={() => setProgress(INITIAL_PROGRESS)}
              />
            )}

            {activeTab === 'solutions' && (
              <SolutionGuide />
            )}
          </>
        )}

      </main>

      {/* Footer with Brand Copyright */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/aistudio/WhatsApp_Image_2026-10-28_at_3.07.39_PM_2048e88f.jpeg" 
              alt="Logo" 
              className="w-8 h-8 object-contain rounded-full border border-amber-300"
            />
            <span className="font-bold text-slate-800">
              International Education Egypt © 2026/2027
            </span>
          </div>
          <div className="text-center sm:text-left">
            <span>جميع الحقوق محفوظة لمنهاج التقييمات والأداءات التفاعلية • الصف الثاني الإعدادي</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
