import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { geminiService } from '../services/geminiService';
import { historyService } from '../services/historyService';
import type { Message, InterviewSession } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { LogoIcon } from './icons/LogoIcon';
import type { Chat } from '@google/genai';

type InterviewState = 'setup' | 'active' | 'loading' | 'feedback' | 'error';

const HomeScreen: React.FC = () => {
    const context = useContext(AppContext);
    const navigate = useNavigate();

    // Setup form state
    const [company, setCompany] = useState('');
    const [jobRole, setJobRole] = useState('');
    const [companyUrl, setCompanyUrl] = useState('');
    const [isStarting, setIsStarting] = useState(false);


    // Chat state
    const [interviewState, setInterviewState] = useState<InterviewState>('setup');
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [error, setError] = useState<string | null>(null);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll to bottom of chat
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleStartInterview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company || !jobRole || !companyUrl) {
            setError("Please fill in all fields.");
            return;
        }
        
        setIsStarting(true);
        setInterviewState('loading');
        setError(null);

        try {
            const { chat, firstQuestion } = await geminiService.startChat(company, jobRole, companyUrl, context!.language);
            setChatSession(chat);
            setMessages([{ sender: 'ai', text: firstQuestion }]);
            setInterviewState('active');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setInterviewState('error');
        } finally {
            setIsStarting(false);
        }
    };
    
    const handleCancelInterview = () => {
        if (window.confirm("Are you sure you want to cancel this interview? Your progress will be lost.")) {
            setInterviewState('setup');
            setMessages([]);
            setChatSession(null);
            setError(null);
            setCompany('');
            setJobRole('');
            setCompanyUrl('');
        }
    };

    const handleEndInterview = async () => {
        setInterviewState('feedback');
        setError(null);
        
        try {
            const feedbackReport = await geminiService.getNarrativeFeedback(messages, company, jobRole, context!.language);
            const newSession: InterviewSession = {
                id: `session-${Date.now()}`,
                company,
                jobRole,
                companyUrl,
                language: context!.language,
                date: new Date().toISOString(),
                messages,
                feedbackReport,
            };
            historyService.saveSession(newSession);
            navigate(`/feedback/${newSession.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setInterviewState('error'); // Revert to an error state on the chat page
        }
    };

    const handleSendMessage = async () => {
        if (!userInput.trim() || !chatSession || (interviewState !== 'active' && interviewState !== 'error')) return;

        const userMessage: Message = { sender: 'user', text: userInput };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = userInput;
        setUserInput('');
        setInterviewState('loading');

        if (currentInput.trim().toLowerCase() === 'end interview') {
            await handleEndInterview();
            return;
        }

        try {
            const response = await chatSession.sendMessage({ message: currentInput });
            const aiMessage: Message = { sender: 'ai', text: response.text };
            setMessages(prev => [...prev, aiMessage]);
            setInterviewState('active');
        } catch (err)
            {
            setError(err instanceof Error ? err.message : 'Failed to get a response from the AI.');
            setInterviewState('error');
        }
    };
    
    if (interviewState === 'setup' || (interviewState === 'error' && messages.length === 0)) {
        return (
            <div className="max-w-xl mx-auto">
                 <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-light-text dark:text-dark-text">
                        Welcome to <span className="text-primary">PrepiQ</span>
                    </h1>
                    <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">
                        Your personal AI-powered interview coach. Practice, get feedback, and land your dream job with confidence.
                    </p>
                </div>
                <h2 className="text-3xl font-bold text-center text-light-text dark:text-dark-text">AI Interview Practice</h2>
                <p className="text-center text-light-text-secondary dark:text-dark-text-secondary mt-2 mb-8">Let's set up your mock interview. The AI will adopt a persona based on your inputs.</p>
                <form onSubmit={handleStartInterview} className="bg-light-card dark:bg-dark-card p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-6">
                    <div>
                        <label htmlFor="company" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Company Name</label>
                        <input type="text" id="company" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g., Google" required className="mt-1 block w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"/>
                    </div>
                     <div>
                        <label htmlFor="jobRole" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Job Role</label>
                        <input type="text" id="jobRole" value={jobRole} onChange={e => setJobRole(e.target.value)} placeholder="e.g., Software Engineer" required className="mt-1 block w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"/>
                    </div>
                     <div>
                        <label htmlFor="companyUrl" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Company Homepage URL</label>
                        <input type="url" id="companyUrl" value={companyUrl} onChange={e => setCompanyUrl(e.target.value)} placeholder="e.g., https://www.google.com" required className="mt-1 block w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"/>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" disabled={isStarting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 dark:disabled:bg-gray-600">
                       {isStarting ? <LoadingSpinner size="sm"/> : 'Start Interview'}
                    </button>
                </form>
            </div>
        );
    }
    
    // Chat View
    return (
        <div className="max-w-3xl mx-auto flex flex-col h-[80vh] bg-light-card dark:bg-dark-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Interview for {jobRole} at {company}</h2>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Type "End interview" to finish and get feedback.</p>
                </div>
                 <button onClick={handleCancelInterview} className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-semibold hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/80">
                    Cancel
                </button>
            </div>

            <div ref={chatContainerRef} className="flex-grow p-6 space-y-6 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                       {msg.sender === 'ai' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white"><LogoIcon className="w-5 h-5"/></div>}
                        <div className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none ml-auto' : 'bg-gray-100 dark:bg-gray-700 text-light-text dark:text-dark-text rounded-bl-none'}`}>
                            <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                        </div>
                    </div>
                ))}
                {(interviewState === 'loading' || interviewState === 'feedback') && (
                     <div className="flex items-start gap-3 justify-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white"><LogoIcon className="w-5 h-5"/></div>
                        <div className="max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-light-text dark:text-dark-text rounded-bl-none">
                            <LoadingSpinner size="sm" />
                        </div>
                    </div>
                )}
            </div>

            {error && <p className="p-4 text-red-500 text-sm text-center">There was an error. You can try your message again or type "End interview" to finish.</p>}

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                 <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your answer here..."
                        className="flex-grow px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={interviewState !== 'active' && interviewState !== 'error'}
                    />
                    <button onClick={handleSendMessage} disabled={interviewState !== 'active' && interviewState !== 'error' || !userInput.trim()} className="bg-primary text-white rounded-full p-3 hover:bg-primary-dark disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default HomeScreen;