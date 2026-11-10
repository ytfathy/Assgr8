export type QuestionType = 
  | 'mcq' 
  | 'true_false' 
  | 'fill_blank' 
  | 'explain' 
  | 'prove' 
  | 'relationship' 
  | 'define' 
  | 'compare_table'
  | 'map_analysis';

export type SkillCategory = 
  | 'الجغرافيا ومظاهر السطح'
  | 'المعادن ومصادر الطاقة'
  | 'النظم البيئية والمناخ'
  | 'الحضارات القديمة والشرق الأدنى'
  | 'حضارات اليمن والشرق الأقصى'
  | 'الحضارة الإسلامية'
  | 'الحضارة اليونانية والرومانية';

export interface Question {
  id: string;
  sourcePage: number;
  unitId: number;
  unitTitle: string;
  lessonId: string;
  lessonTitle: string;
  weekNumber: number;
  weekTitle: string;
  section: 'الأداء الصفي' | 'الأداء المنزلي' | 'التقييم الأسبوعي (نموذج أ)' | 'التقييم الأسبوعي (نموذج ب)' | 'التقييم الأسبوعي (نموذج ج)' | 'التدريب الشهري';
  skillCategory: SkillCategory;
  questionType: QuestionType;
  prompt: string;
  subPrompt?: string;
  passage?: string;
  imageUrl?: string;
  pageCrop?: {
    pageNumber: number;
    top: number; // percentage from top (0-100)
    height: number; // percentage height (0-100)
  };
  mapFeatures?: { number: number; label: string; answer: string }[];
  options?: string[]; // For MCQ
  correctAnswer: string;
  acceptableAnswers?: string[]; // Flexible matching for Arabic text
  explanation: string;
  learningRule?: string; // Concept/rule summary
  difficulty: 'سهل' | 'متوسط' | 'متقدم';
}

export interface Unit {
  id: number;
  title: string;
  subtitle: string;
  lessons: {
    id: string;
    title: string;
    weeks: number[];
  }[];
}

export interface ExamConfig {
  title: string;
  selectedLessonIds: string[];
  questionCount: number;
  mode: 'practice' | 'formal' | 'revision'; // practice: immediate feedback, formal: at end, revision: answers pre-shown
  durationMinutes: number;
  randomize: boolean;
  selectedTypes?: QuestionType[];
}

export interface ExamResult {
  id: string;
  date: string;
  examTitle: string;
  totalQuestions: number;
  score: number;
  percentage: number;
  timeSpentSeconds: number;
  answers: Record<string, { studentAnswer: string; isCorrect: boolean }>;
  lessonStats: Record<string, { total: number; correct: number }>;
  skillStats: Record<string, { total: number; correct: number }>;
}

export interface StudentProgress {
  studentName: string;
  points: number;
  level: number;
  answeredQuestionIds: string[];
  correctQuestionIds: string[];
  incorrectQuestionIds: string[];
  completedWeeks: number[];
  completedLessons: string[];
  streakDays: number;
  lastActiveDate: string;
  examHistory: ExamResult[];
  badges: {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: string;
  }[];
}
