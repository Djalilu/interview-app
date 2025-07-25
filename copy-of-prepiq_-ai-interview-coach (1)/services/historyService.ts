
import type { InterviewSession } from '../types';

const HISTORY_KEY = 'prepiq_interview_history';

const getHistory = (): InterviewSession[] => {
    try {
        const historyJson = localStorage.getItem(HISTORY_KEY);
        return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
        console.error("Failed to parse history from localStorage", error);
        return [];
    }
};

const saveSession = (session: InterviewSession) => {
    try {
        const history = getHistory();
        const existingIndex = history.findIndex(s => s.id === session.id);
        if (existingIndex > -1) {
            history[existingIndex] = session;
        } else {
            history.push(session);
        }
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.error("Failed to save session to localStorage", error);
    }
};

const getSessionById = (sessionId: string): InterviewSession | null => {
    const history = getHistory();
    return history.find(s => s.id === sessionId) || null;
};

export const historyService = {
    getHistory,
    saveSession,
    getSessionById,
};
