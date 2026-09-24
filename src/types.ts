export interface StepBreakdown {
  title: string;
  formulaOrCode: string;
  explanation: string;
  ambiguitiesOrErrors?: string;
  practicalTip?: string;
}

export interface PracticeQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Hotspot {
  id: string;
  title: string;
  x: number; // percentage
  y: number; // percentage
  width: number;
  height: number;
  shortDesc: string;
  color: string;
}

export interface LessonAnalysis {
  title: string;
  topicCategory: string;
  conceptualSummary: string;
  keyTakeaways: string[];
  stepByStepBreakdown: StepBreakdown[];
  practiceQuestions: PracticeQuestion[];
  hotspots?: Hotspot[];
}
