import React, { useState, useEffect } from 'react';
import { Question, ExamConfig, ExamResult } from '../types/assessment';
import { QuestionCard } from './QuestionCard';
import confetti from 'canvas-confetti';

interface ActiveExamProps {
  config: ExamConfig;
  questions: Question[];
  onFinishExam: (result: ExamResult) => void;
  onCancelExam: () => void;
}

export const ActiveExam: React.FC<ActiveExamProps> = ({
  config,
  questions,
  onFinishExam,
  onCancelExam,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { studentAnswer: string; isCorrect: boolean }>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(config.durationMinutes * 60);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Timer countdown
  useEffect(() => {
    if (config.durationMinutes === 0 || isFinished) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [config.durationMinutes, isFinished]);

  const handleAnswerSubmit = (questionId: string, isCorrect: boolean, studentAnswer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { studentAnswer, isCorrect }
    }));
  };

  const handleFinish = () => {
    setIsFinished(true);

    let correctCount = 0;
    const lessonStats: Record<string, { total: number; correct: number }> = {};
    const skillStats: Record<string, { total: number; correct: number }> = {};

    questions.forEach(q => {
      const ans = answers[q.id];
      const isCorrect = ans ? ans.isCorrect : false;
      if (isCorrect) correctCount++;

      // Lesson breakdown
      if (!lessonStats[q.lessonTitle]) {
        lessonStats[q.lessonTitle] = { total: 0, correct: 0 };
      }
      lessonStats[q.lessonTitle].total++;
      if (isCorrect) lessonStats[q.lessonTitle].correct++;

      // Skill breakdown
      if (!skillStats[q.skillCategory]) {
        skillStats[q.skillCategory] = { total: 0, correct: 0 };
      }
      skillStats[q.skillCategory].total++;
      if (isCorrect) skillStats[q.skillCategory].correct++;
    });

    const percentage = Math.round((correctCount / questions.length) * 100);

    // Confetti celebration if score >= 80%
    if (percentage >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    const result: ExamResult = {
      id: 'exam_' + Date.now(),
      date: new Date().toLocaleDateString('ar-EG', { dateStyle: 'full' }),
      examTitle: config.title,
      totalQuestions: questions.length,
      score: correctCount,
      percentage,
      timeSpentSeconds: config.durationMinutes > 0 ? (config.durationMinutes * 60) - timeRemainingSeconds : 0,
      answers,
      lessonStats,
      skillStats,
    };

    onFinishExam(result);
  };

  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Exam Header HUD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
            {config.mode === 'formal' ? 'اختبار رسمي' : config.mode === 'practice' ? 'اختبار تدريبي' : 'اختبار مراجعة'}
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
            {config.title}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {config.durationMinutes > 0 && (
            <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-sm font-black ${
              timeRemainingSeconds < 180 ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse' : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}>
              <span>⏱️</span>
              <span dir="ltr">{formatTime(timeRemainingSeconds)}</span>
            </div>
          )}

          <button
            onClick={onCancelExam}
            className="text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 transition-colors"
          >
            خروج من الاختبار
          </button>
        </div>
      </div>

      {/* Progress Bar & Question Jumpers */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
          <span>تمت الإجابة عن {answeredCount} من {questions.length} سؤال</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Index Pills */}
        <div className="flex flex-wrap gap-1.5">
          {questions.map((q, idx) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = idx === currentQuestionIndex;

            let pillStyle = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
            if (isCurrent) {
              pillStyle = 'bg-blue-600 text-white font-black ring-2 ring-blue-300';
            } else if (isAnswered) {
              pillStyle = 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300';
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-8 h-8 rounded-lg text-xs transition-all flex items-center justify-center cursor-pointer ${pillStyle}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Question Component */}
      {currentQ && (
        <QuestionCard
          key={currentQ.id}
          question={currentQ}
          questionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          mode={config.mode}
          onAnswerSubmit={handleAnswerSubmit}
        />
      )}

      {/* Navigation and Submission Buttons */}
      <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
          className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          السؤال السابق
        </button>

        {currentQuestionIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
            className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all"
          >
            السؤال التالي
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>✅</span>
            <span>تسليم وإنهاء الاختبار</span>
          </button>
        )}
      </div>
    </div>
  );
};
