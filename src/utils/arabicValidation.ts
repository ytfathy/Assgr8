/**
 * Normalize Arabic text for accurate automatic assessment
 * Strips tatweel, diacritics (tashkeel), normalizes alef, taa marbuta/haa, etc.
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    // Remove Arabic diacritics (harakat/tashkeel)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Remove tatweel (kashida)
    .replace(/\u0640/g, '')
    // Normalize Alefs
    .replace(/[أإآء]/g, 'ا')
    // Normalize Taa Marbuta to Haa
    .replace(/ة/g, 'ه')
    // Normalize Yaa / Alef Maksura
    .replace(/[ىي]/g, 'ي')
    // Remove extra punctuation and whitespace
    .replace(/[.,،؛:?!()"'«»-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validates if student's answer matches the correct answer or acceptable alternatives
 */
export function validateArabicAnswer(
  studentInput: string,
  correctAnswer: string,
  acceptableAnswers?: string[]
): boolean {
  if (!studentInput || !studentInput.trim()) return false;

  const normalizedInput = normalizeArabicText(studentInput);
  const normalizedCorrect = normalizeArabicText(correctAnswer);

  if (normalizedInput === normalizedCorrect) return true;

  if (acceptableAnswers && acceptableAnswers.length > 0) {
    for (const alt of acceptableAnswers) {
      if (normalizedInput === normalizeArabicText(alt)) return true;
    }
  }

  // Check if input contains essential key phrase of answer (for descriptive questions)
  if (normalizedCorrect.length > 15 && normalizedInput.length >= 8) {
    const inputWords = normalizedInput.split(' ').filter(w => w.length > 2);
    const correctWords = new Set(normalizedCorrect.split(' ').filter(w => w.length > 2));
    
    if (inputWords.length > 0) {
      let matchedCount = 0;
      for (const word of inputWords) {
        if (correctWords.has(word)) matchedCount++;
      }
      // If at least 60% of significant keywords match
      if (matchedCount / Math.min(inputWords.length, correctWords.size) >= 0.6) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Calculate gamification points based on difficulty and attempts
 */
export function calculatePoints(difficulty: 'سهل' | 'متوسط' | 'متقدم', isCorrectFirstTry: boolean): number {
  const base = difficulty === 'سهل' ? 10 : difficulty === 'متوسط' ? 20 : 30;
  return isCorrectFirstTry ? base : Math.round(base / 2);
}

/**
 * Calculate student rank title based on score/points
 */
export function getStudentRank(points: number): { title: string; nextThreshold: number; badgeColor: string } {
  if (points < 100) return { title: 'مستكشف مبتدئ 🧭', nextThreshold: 100, badgeColor: 'bg-emerald-100 text-emerald-800' };
  if (points < 250) return { title: 'باحث طموح 📜', nextThreshold: 250, badgeColor: 'bg-blue-100 text-blue-800' };
  if (points < 500) return { title: 'مؤرخ جغرافي بارع 🌍', nextThreshold: 500, badgeColor: 'bg-amber-100 text-amber-800' };
  if (points < 1000) return { title: 'عالم دراسات متألق 🏆', nextThreshold: 1000, badgeColor: 'bg-purple-100 text-purple-800' };
  return { title: 'عبقري International Education 🌟', nextThreshold: 99999, badgeColor: 'bg-yellow-200 text-yellow-900' };
}
