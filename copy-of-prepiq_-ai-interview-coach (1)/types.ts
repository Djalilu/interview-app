
export interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export interface Question {
    id: string;
    text: string;
    category: string;
}

export interface Answer {
    questionId: string;
    questionText: string;
    answerText: string;
}

export interface InterviewSession {
  id: string;
  company: string;
  companyUrl: string;
  jobRole: string;
  language: string;
  date: string; // ISO string
  messages?: Message[];
  questionsAndAnswers?: Answer[];
  feedbackReport: string | null;
}

export const LANGUAGES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ru: 'Русский',
  ar: 'العربية',
  'zh-CN': '简体中文', // Chinese (Simplified)
  ja: '日本語', // Japanese
  hi: 'हिन्दी', // Hindi
  bn: 'বাংলা', // Bengali
  id: 'Bahasa Indonesia',
  sw: 'Kiswahili',
  rw: 'Kinyarwanda',
  ur: 'اردو', // Urdu
} as const;

export type LanguageCode = keyof typeof LANGUAGES;