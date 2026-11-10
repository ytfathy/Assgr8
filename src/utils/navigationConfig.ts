export interface NavItem {
  id: string;
  label: string;
  icon: string;
  shortLabel?: string;
  description?: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { 
    id: 'home', 
    label: 'الصفحة الرئيسية', 
    shortLabel: 'الرئيسية', 
    icon: '🏠',
    description: 'الواجهة الرئيسية وخريطة الوحدات'
  },
  { 
    id: 'zaker_li', 
    label: 'ذاكر لي (إنفوجرافيك)', 
    shortLabel: 'ذاكر لي', 
    icon: '💡',
    description: 'اللوحات البصرية الذكية والملصقات بأسلوب NotebookLM'
  },
  { 
    id: 'weekly', 
    label: 'التقييمات الأسبوعية', 
    shortLabel: 'التقييمات', 
    icon: '📅',
    description: 'الأداء الصفي والمنزلي ونماذج الامتحانات المعتمدة'
  },
  { 
    id: 'skills', 
    label: 'التدريب حسب المهارة', 
    shortLabel: 'المهارات', 
    icon: '🎯',
    description: 'تدريب متخصص في الخرائط والمعادن والنظم والحضارات'
  },
  { 
    id: 'generator', 
    label: 'منشئ الامتحانات الذكي', 
    shortLabel: 'منشئ الامتحانات', 
    icon: '⚡',
    description: 'توليد اختبارات مخصصة بأسئلة عشوائية وتصحيح تلقائي'
  },
  { 
    id: 'progress', 
    label: 'نتائجي وتقدمي', 
    shortLabel: 'نتائجي', 
    icon: '📊',
    description: 'لوحة إنجازات الطالب وسجل الاختبارات والأوسمة'
  },
  { 
    id: 'solutions', 
    label: 'دليل الإجابات', 
    shortLabel: 'الإجابات', 
    icon: '📖',
    description: 'الدليل النموذجي الكامل لإجابات كتاب الوزارة'
  },
];

export function getNavItemById(id: string): NavItem | undefined {
  return MAIN_NAV_ITEMS.find(item => item.id === id);
}

export function isValidTabId(id: string): boolean {
  return MAIN_NAV_ITEMS.some(item => item.id === id) || id === 'admin_infographics';
}
