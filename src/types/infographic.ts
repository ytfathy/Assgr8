export type InfographicFormat = 
  | 'mindmap' 
  | 'timeline' 
  | 'geographical_map' 
  | 'cause_effect' 
  | 'comparison' 
  | 'comprehensive_board';

export interface MindMapBranch {
  id: string;
  title: string;
  color: string;
  icon: string;
  summary: string;
  subBranches: {
    name: string;
    details: string;
    badge?: string;
  }[];
}

export interface MapHotspot {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  title: string;
  category: 'جبال' | 'هضاب' | 'أنهار' | 'مضايق' | 'مدن' | 'حضارة' | 'موارد' | 'غابات';
  description: string;
  significance: string;
  textbookReference: string;
}

export interface TimelineEvent {
  era: string;
  title: string;
  description: string;
  rulerOrLeader?: string;
  causeAndEffect: string;
  impact: string;
  icon?: string;
}

export interface ConceptCard {
  id: string;
  title: string;
  icon: string;
  shortText: string;
  deepExplanation: string;
  bulletPoints: string[];
  visualTag?: string;
}

export interface ComparisonTable {
  title: string;
  headers: string[];
  rows: {
    criteria: string;
    item1: string;
    item2: string;
    item3?: string;
  }[];
}

export interface InfographicLesson {
  lessonId: string;
  unitId: number;
  lessonTitle: string;
  unitTitle: string;
  pagesRange: string;
  format: InfographicFormat;
  status: 'published' | 'draft' | 'review';
  approvedBy: string;
  lastUpdated: string;
  themeColor: {
    primary: string;
    secondary: string;
    accent: string;
    badge: string;
    bgGradient: string;
  };
  mainConcept: {
    centralTitle: string;
    tagline: string;
    mainIdea: string;
    learningObjectives: string[];
    essentialQuestion: string;
  };
  mindMap: {
    rootLabel: string;
    branches: MindMapBranch[];
  };
  mapSchema?: {
    mapTitle: string;
    mapType: string;
    baseDescription: string;
    hotspots: MapHotspot[];
    legend: { color: string; label: string }[];
  };
  timeline?: {
    title: string;
    events: TimelineEvent[];
  };
  conceptCards: ConceptCard[];
  comparison?: ComparisonTable;
  importantPanels: {
    whyQuestions: { question: string; answer: string; examNote?: string }[];
    whatHappenedQuestions: { question: string; answer: string }[];
    vocabulary: { term: string; definition: string }[];
    examPointers: string[];
  };
  lessonSummary: {
    goldenTakeaways: string[];
    memoryMnemonics?: string;
  };
}
