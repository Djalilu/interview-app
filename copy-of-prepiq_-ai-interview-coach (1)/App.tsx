import React, { useState, useMemo, useCallback, useEffect, createContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { LanguageCode, InterviewSession } from './types';
import Header from './components/Header';
import HomeScreen from './components/HomeScreen';
import FeedbackScreen from './components/FeedbackScreen';
import HistoryScreen from './components/HistoryScreen';
import JobRoleSelectionScreen from './components/JobRoleSelectionScreen';
import InterviewScreen from './components/InterviewScreen';

// App Context for app state
interface AppContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  jobRole: string | null;
  setJobRole: (role: string | null) => void;
  currentSession: Partial<InterviewSession> | null;
  setCurrentSession: (session: Partial<InterviewSession> | null) => void;
}
export const AppContext = createContext<AppContextType | null>(null);

// Theme Context for UI theme
type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
export const ThemeContext = createContext<ThemeContextType | null>(null);

const App: React.FC = () => {
  // App State
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [jobRole, setJobRole] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<Partial<InterviewSession> | null>(null);

  const appContextValue = useMemo(() => ({
    language,
    setLanguage,
    jobRole,
    setJobRole,
    currentSession,
    setCurrentSession,
  }), [language, jobRole, currentSession]);

  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('prepiq-theme');
    if (storedTheme) {
      return storedTheme as Theme;
    }
    // Default to system preference if available, otherwise light
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('prepiq-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const themeContextValue = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <AppContext.Provider value={appContextValue}>
      <ThemeContext.Provider value={themeContextValue}>
        <HashRouter>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/select-role" element={<JobRoleSelectionScreen />} />
                <Route path="/interview" element={jobRole ? <InterviewScreen /> : <Navigate to="/select-role" />} />
                <Route path="/feedback/:sessionId" element={<FeedbackScreen />} />
                <Route path="/history" element={<HistoryScreen />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </HashRouter>
      </ThemeContext.Provider>
    </AppContext.Provider>
  );
};

export default App;