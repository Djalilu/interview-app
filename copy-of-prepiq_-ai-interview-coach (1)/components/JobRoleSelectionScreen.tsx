import React, { useState, useMemo, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../App';
import { JOB_CATEGORIES } from '../constants';
import type { InterviewSession } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

const JobRoleSelectionScreen: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const context = useContext(AppContext);
    const navigate = useNavigate();

    const handleRoleSelect = (role: string) => {
        if (context && context.setJobRole && context.setCurrentSession) {
            context.setJobRole(role);
            // This flow doesn't use company info, so we create a new session with placeholder values.
            const newSession: Partial<InterviewSession> = {
                id: `session-${Date.now()}`,
                jobRole: role,
                language: context.language,
                date: new Date().toISOString(),
                company: 'General Practice', 
                companyUrl: '',
                feedbackReport: null,
            };
            context.setCurrentSession(newSession);
            navigate('/interview');
        }
    };

    const filteredRoles = useMemo(() => {
        if (searchTerm) {
            const allRoles = Object.values(JOB_CATEGORIES).flat();
            return allRoles.filter(role => role.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (selectedCategory) {
            return JOB_CATEGORIES[selectedCategory];
        }
        return [];
    }, [searchTerm, selectedCategory]);

    const handleCategoryClick = (category: string) => {
        setSearchTerm('');
        setSelectedCategory(category);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary font-medium mb-4">
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-center text-light-text dark:text-dark-text mb-2">Choose Your Job Role</h1>
            <p className="text-center text-light-text-secondary dark:text-dark-text-secondary mb-8">Select a role to get interview questions tailored to your field.</p>
            
            <div className="relative mb-8">
                <input
                    type="text"
                    placeholder="Search for a job title (e.g., Software Engineer)"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setSelectedCategory(null);
                    }}
                    className="w-full px-4 py-3 bg-light-card dark:bg-dark-card border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {!searchTerm && (
                <>
                    <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mb-4">Or pick a category:</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                        {Object.keys(JOB_CATEGORIES).map(category => (
                            <button
                                key={category}
                                onClick={() => handleCategoryClick(category)}
                                className={`p-4 text-center font-semibold rounded-lg border-2 transition-all duration-200 ${selectedCategory === category ? 'bg-primary text-white border-primary' : 'bg-light-card dark:bg-dark-card border-gray-300 dark:border-gray-700 hover:border-primary hover:text-primary'}`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </>
            )}

            {(selectedCategory || searchTerm) && (
                <div>
                    <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
                        {searchTerm ? `Search Results for "${searchTerm}"` : `Roles in ${selectedCategory}`}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {filteredRoles.length > 0 ? filteredRoles.map(role => (
                            <button
                                key={role}
                                onClick={() => handleRoleSelect(role)}
                                className="px-4 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/80 transition-colors"
                            >
                                {role}
                            </button>
                        )) : <p className="text-light-text-secondary dark:text-dark-text-secondary">No roles found.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobRoleSelectionScreen;