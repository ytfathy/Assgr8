import { InfographicLesson } from '../types/infographic';
import { INFOGRAPHICS_DATABASE } from '../data/infographicsDatabase';
import { QUESTIONS_DATABASE } from '../data/questionsData';
import { UNITS_DATA } from '../data/curriculumUnits';

const STORAGE_KEY = 'iee_custom_infographics_v1';

export class InfographicGenerator {
  /**
   * Retrieves all infographics, merging pre-bundled database with any locally approved admin edits.
   * Completely offline, instantaneous, and zero student-facing API key requirement.
   */
  static getAllInfographics(): InfographicLesson[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const customMap: Record<string, InfographicLesson> = JSON.parse(saved);
        return INFOGRAPHICS_DATABASE.map(base => customMap[base.lessonId] || base);
      }
    } catch (e) {
      console.warn('Failed to load custom infographics from storage:', e);
    }
    return INFOGRAPHICS_DATABASE;
  }

  /**
   * Get an infographic for a specific lesson by lessonId
   */
  static getInfographicByLessonId(lessonId: string): InfographicLesson | undefined {
    const all = this.getAllInfographics();
    return all.find(item => item.lessonId === lessonId);
  }

  /**
   * Saves an updated infographic (admin edit, approval, or regeneration)
   */
  static saveInfographic(infographic: InfographicLesson): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const customMap: Record<string, InfographicLesson> = saved ? JSON.parse(saved) : {};
      customMap[infographic.lessonId] = {
        ...infographic,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customMap));
    } catch (e) {
      console.error('Failed to save infographic:', e);
    }
  }

  /**
   * Approves an infographic for students
   */
  static approveInfographic(lessonId: string, approverName: string = 'الموجه العام للدراسات'): InfographicLesson | null {
    const existing = this.getInfographicByLessonId(lessonId);
    if (!existing) return null;

    const updated: InfographicLesson = {
      ...existing,
      status: 'published',
      approvedBy: approverName,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    this.saveInfographic(updated);
    return updated;
  }

  /**
   * AI-powered or Rule-Based Generation:
   * Generates or enriches an infographic for a specific lesson using textbook questions and curriculum structures.
   * If Gemini API is available on the server/admin environment, it can optionally contact Gemini.
   * Otherwise, it uses high-yield algorithmic extraction directly from the textbook question database!
   */
  static async generateInfographicForLesson(
    lessonId: string,
    apiKey?: string
  ): Promise<InfographicLesson> {
    const unit = UNITS_DATA.find(u => u.lessons.some(l => l.id === lessonId));
    const lessonMeta = unit?.lessons.find(l => l.id === lessonId);
    const relatedQuestions = QUESTIONS_DATABASE.filter(q => q.lessonId === lessonId);

    // If an API key is provided, try Gemini model call
    if (apiKey) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });

        const promptText = `
أنت خبير مناهج دراسات اجتماعية للمرحلة الإعدادية ومصمم إنفوجرافيك تعليمي بأسلوب NotebookLM.
المطلوب استخراج وتوليد لوحة إنفوجرافيك تعليمية بصيغة JSON حصراً للدرس:
عنوان الدرس: ${lessonMeta?.title || lessonId}
الوحدة: ${unit?.title || ''}
عدد أسئلة الكتاب الأصلي المتاحة للدرس: ${relatedQuestions.length}
نماذج من أسئلة وتفسيرات الكتاب:
${relatedQuestions.slice(0, 10).map((q, i) => `${i + 1}- ${q.prompt} (الإجابة: ${q.correctAnswer} - التفسير: ${q.explanation})`).join('\n')}

المخرجات المطلوبة: كائن JSON صالح فقط يطابق واجهة InfographicLesson.
يجب ألا تبتكر أي معلومة خارج كتاب الطالب. استخدم مصطلحات الكتاب بدقة.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptText,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text) as Partial<InfographicLesson>;
          const base = this.getInfographicByLessonId(lessonId) || INFOGRAPHICS_DATABASE[0];
          const enriched: InfographicLesson = {
            ...base,
            ...parsed,
            lessonId,
            unitId: unit?.id || 1,
            lessonTitle: lessonMeta?.title || base.lessonTitle,
            unitTitle: unit?.title || base.unitTitle,
            status: 'review',
            approvedBy: 'قيد المراجعة والاعتماد',
            lastUpdated: new Date().toISOString().split('T')[0],
          };
          this.saveInfographic(enriched);
          return enriched;
        }
      } catch (err) {
        console.warn('Gemini extraction fallback to local algorithm:', err);
      }
    }

    // Local algorithmic generation from textbook questions database
    const existing = this.getInfographicByLessonId(lessonId);
    if (existing) {
      // Regenerate fresh insights from the questions bank
      const whyQs = relatedQuestions
        .filter(q => q.questionType === 'explain' || q.prompt.includes('بم تفسر') || q.prompt.includes('علل'))
        .slice(0, 4)
        .map(q => ({
          question: q.prompt,
          answer: q.correctAnswer,
          examNote: `صفحة ${q.sourcePage} بالكتاب الأصلي`,
        }));

      const whatHappenedQs = relatedQuestions
        .filter(q => q.prompt.includes('ما النتائج') || q.questionType === 'relationship')
        .slice(0, 3)
        .map(q => ({
          question: q.prompt,
          answer: q.correctAnswer,
        }));

      const regenerated: InfographicLesson = {
        ...existing,
        status: 'review',
        approvedBy: 'المشرف التعليمي (توليد مراجع)',
        lastUpdated: new Date().toISOString().split('T')[0],
        importantPanels: {
          ...existing.importantPanels,
          whyQuestions: whyQs.length > 0 ? whyQs : existing.importantPanels.whyQuestions,
          whatHappenedQuestions: whatHappenedQs.length > 0 ? whatHappenedQs : existing.importantPanels.whatHappenedQuestions,
        },
      };

      this.saveInfographic(regenerated);
      return regenerated;
    }

    throw new Error(`Lesson ${lessonId} not found in database.`);
  }

  /**
   * Generates or refreshes all infographics for an entire unit
   */
  static async generateInfographicsForUnit(unitId: number, apiKey?: string): Promise<InfographicLesson[]> {
    const unit = UNITS_DATA.find(u => u.id === unitId);
    if (!unit) return [];

    const results: InfographicLesson[] = [];
    for (const lesson of unit.lessons) {
      const generated = await this.generateInfographicForLesson(lesson.id, apiKey);
      results.push(generated);
    }
    return results;
  }

  /**
   * Resets all infographics back to the original textbook master database
   */
  static resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
