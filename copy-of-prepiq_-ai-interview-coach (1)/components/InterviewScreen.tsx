import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../App';
import type { Question, Answer, InterviewSession } from '../types';
import { geminiService } from '../services/geminiService';
import { historyService } from '../services/historyService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { MicIcon } from './icons/MicIcon';
import { StopIcon } from './icons/StopIcon';
import LoadingSpinner from './LoadingSpinner';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

const InterviewScreen: React.FC = () => {
    const context = useContext(AppContext);
    const navigate = useNavigate();
    
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { transcript, isListening, startListening, stopListening, resetTranscript, hasRecognitionSupport } = useSpeechRecognition();
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (context?.jobRole && context.language) {
            const fetchQuestions = async () => {
                try {
                    setIsLoading(true);
                    setError(null);
                    const fetchedQuestions = await geminiService.getInterviewQuestions(context.jobRole!, context.language);
                    setQuestions(fetchedQuestions);
                } catch (e) {
                    setError('Failed to load interview questions. Please try again.');
                    console.error(e);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchQuestions();
        }
    }, [context?.jobRole, context?.language]);

    useEffect(() => {
        if (transcript) {
            setCurrentAnswer(prev => prev ? `${prev.trim()} ${transcript}`.trim() : transcript);
            resetTranscript();
        }
    }, [transcript, resetTranscript]);

    const handleNextQuestion = () => {
        const newAnswer: Answer = {
            questionId: questions[currentQuestionIndex].id,
            questionText: questions[currentQuestionIndex].text,
            answerText: currentAnswer,
        };
        const updatedAnswers = [...answers, newAnswer];
        setAnswers(updatedAnswers);
        setCurrentAnswer('');

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleSubmit(updatedAnswers);
        }
    };
    
    const handleSubmit = async (finalAnswers: Answer[]) => {
        if (!context || !context.currentSession || !context.jobRole) return;
        
        setIsSubmitting(true);
        setError(null);
                
        try {
            const feedback = await geminiService.getOverallFeedback(finalAnswers, context.jobRole, context.language);
            
            const finalSession: InterviewSession = {
                ...context.currentSession,
                id: context.currentSession.id || `session-${Date.now()}`,
                date: context.currentSession.date || new Date().toISOString(),
                language: context.language,
                jobRole: context.jobRole,
                company: context.currentSession.company || 'General Practice',
                companyUrl: context.currentSession.companyUrl || '',
                questionsAndAnswers: finalAnswers,
                feedbackReport: feedback,
            };
            
            historyService.saveSession(finalSession);
            if(context.setCurrentSession) {
                context.setCurrentSession(finalSession);
            }
            navigate(`/feedback/${finalSession.id}`);

        } catch (e) {
            setError('Failed to get feedback from AI. Please try again.');
            console.error(e);
            setIsSubmitting(false);
        }
    };

    const toggleRecording = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-64"><LoadingSpinner /> <p className="ml-4 text-light-text-secondary dark:text-dark-text-secondary">Generating your personalized questions...</p></div>;
    if (error) return <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-4 rounded-md">{error}</div>;
    if (questions.length === 0) return <div className="text-center text-light-text-secondary dark:text-dark-text-secondary">No questions available for this role.</div>;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
        <div className="max-w-3xl mx-auto flex flex-col h-full">
            <div className="mb-4">
                 <Link to="/select-role" className="inline-flex items-center gap-1 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary font-medium">
                    <ArrowLeftIcon className="w-4 h-4" />
                    Change Job Role
                </Link>
            </div>
            <div className="bg-light-card dark:bg-dark-card p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <span className="bg-blue-100 text-primary dark:bg-blue-900/50 dark:text-blue-300 text-sm font-semibold px-3 py-1 rounded-full">{currentQuestion.category}</span>
                    <span className="text-light-text-secondary dark:text-dark-text-secondary font-medium">Question {currentQuestionIndex + 1} of {questions.length}</span>
                </div>
                
                <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-6 flex-shrink-0">{currentQuestion.text}</h2>
                
                <div className="flex-grow flex flex-col">
                    <textarea
                        ref={textAreaRef}
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        placeholder="Start typing your answer here, or use the microphone to record..."
                        className="w-full h-full flex-grow p-4 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-base"
                        aria-label="Your Answer"
                    />
                </div>
                
                <div className="flex items-center justify-between mt-6">
                   {hasRecognitionSupport ? (
                        <button
                            onClick={toggleRecording}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
                            aria-label={isListening ? 'Stop recording' : 'Record answer'}
                        >
                            {isListening ? <StopIcon className="w-5 h-5" /> : <MicIcon className="w-5 h-5" />}
                            <span>{isListening ? 'Stop Recording' : 'Record Answer'}</span>
                        </button>
                    ) : <div />}
                    
                    <button
                        onClick={handleNextQuestion}
                        disabled={!currentAnswer.trim() || isSubmitting}
                        className="px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-dark transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
                    >
                        {isSubmitting ? (
                            <>
                                <LoadingSpinner size="sm" />
                                <span className="ml-2">Getting Feedback...</span>
                            </>
                        ) : (
                            isLastQuestion ? 'Finish & Get Feedback' : 'Next Question'
                        )}
                    </button>
                </div>
                 {isSubmitting && <p className="text-center text-light-text-secondary dark:text-dark-text-secondary mt-4">Analyzing your responses. This may take a moment...</p>}
            </div>
        </div>
    );
};

export default InterviewScreen;