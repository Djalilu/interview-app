import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { InterviewSession } from '../types';
import { historyService } from '../services/historyService';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

const HistoryScreen: React.FC = () => {
    const [history, setHistory] = useState<InterviewSession[]>([]);
    const [filterRole, setFilterRole] = useState('');
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        setHistory(historyService.getHistory());
    }, []);

    const allRoles = useMemo(() => [...new Set(history.map(s => s.jobRole))], [history]);

    const filteredHistory = useMemo(() => {
        return history
            .filter(session => filterRole ? session.jobRole === filterRole : true)
            .filter(session => filterDate ? new Date(session.date).toLocaleDateString() === new Date(filterDate).toLocaleDateString() : true)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [history, filterRole, filterDate]);

    return (
        <div className="max-w-6xl mx-auto">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Interview History</h1>
                <Link to="/" className="inline-flex items-center gap-1 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary font-medium">
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back to Home
                </Link>
            </div>

            <div className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <label htmlFor="role-filter" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Filter by Role</label>
                    <select
                        id="role-filter"
                        value={filterRole}
                        onChange={e => setFilterRole(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 bg-transparent text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    >
                        <option value="">All Roles</option>
                        {allRoles.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                </div>
                <div className="flex-1">
                    <label htmlFor="date-filter" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Filter by Date</label>
                    <input
                        type="date"
                        id="date-filter"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 bg-transparent text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    />
                </div>
                 <button onClick={() => {setFilterRole(''); setFilterDate('')}} className="mt-auto self-end md:self-auto h-10 px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
                    Clear Filters
                </button>
            </div>

            <div className="bg-light-card dark:bg-dark-card shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                {filteredHistory.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Company</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Job Role</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">View Report</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-light-card dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredHistory.map(session => (
                                <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text dark:text-dark-text">{new Date(session.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">{session.company}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">{session.jobRole}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/feedback/${session.id}`} className="text-primary hover:text-primary-dark">View Report</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-light-text dark:text-dark-text">No History Found</h3>
                        <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">Your past interview sessions will appear here.</p>
                        <Link to="/" className="mt-4 inline-block bg-primary text-white font-semibold px-6 py-2 rounded-lg">
                            Start Your First Practice
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryScreen;