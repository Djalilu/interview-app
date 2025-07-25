import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { InterviewSession } from '../types';
import { historyService } from '../services/historyService';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

const FeedbackScreen: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [session, setSession] = useState<InterviewSession | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (sessionId) {
            const data = historyService.getSessionById(sessionId);
            setSession(data);
        }
        setLoading(false);
    }, [sessionId]);

    if (loading) return <div className="text-center p-8">Loading feedback...</div>;
    if (!session || !session.feedbackReport) return (
        <div className="text-center p-8 bg-light-card dark:bg-dark-card rounded-lg shadow">
            <h2 className="text-2xl font-bold text-red-600">Feedback Not Found</h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">Could not find the feedback for this session. It might be invalid or has been removed.</p>
            <Link to="/history" className="mt-4 inline-block bg-primary text-white font-semibold px-6 py-2 rounded-lg">Go to History</Link>
        </div>
    );
    
    const { feedbackReport, company, jobRole } = session;

    const sections = feedbackReport.split(/(Overall Assessment|Key Strengths|Areas for Improvement)/).filter(s => s.trim() !== '');
    const structuredReport: { title: string, content: string }[] = [];
    for (let i = 0; i < sections.length; i += 2) {
        if (sections[i] && sections[i+1]) {
            structuredReport.push({ title: sections[i].trim(), content: sections[i+1].trim() });
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-light-card dark:bg-dark-card p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text text-center">Your Interview Feedback</h1>
                <p className="text-center text-lg text-light-text-secondary dark:text-dark-text-secondary mt-2">For the {jobRole} role at {company}</p>
            </div>
            
            <div className="bg-light-card dark:bg-dark-card p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-6">
                {structuredReport.length > 0 ? structuredReport.map(({title, content}) => (
                    <div key={title}>
                        <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text border-b-2 border-primary pb-2 mb-4">{title}</h2>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-line leading-relaxed">{content}</p>
                    </div>
                )) : (
                     <div>
                        <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text">Feedback Report</h2>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-line leading-relaxed">{feedbackReport}</p>
                    </div>
                )}
            </div>

            <div className="text-center mt-8 flex justify-center items-center gap-4">
                 <button 
                    onClick={() => navigate(-1)} 
                    className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform transform hover:-translate-y-1"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back
                </button>
                <Link to="/" className="bg-primary text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-primary-dark transition-transform transform hover:-translate-y-1 inline-block">
                    Practice Another Role
                </Link>
            </div>
        </div>
    );
};

export default FeedbackScreen;