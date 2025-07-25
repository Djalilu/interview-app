import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppContext, ThemeContext } from '../App';
import { LanguageCode, LANGUAGES } from '../types';
import { LogoIcon } from './icons/LogoIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

const LanguageSwitcher: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { language, setLanguage } = context;

    return (
        <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="bg-light-card dark:bg-dark-card border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            aria-label="Select language"
        >
            {Object.entries(LANGUAGES).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
            ))}
        </select>
    );
};

const ThemeToggle: React.FC = () => {
    const context = useContext(ThemeContext);
    if (!context) return null;

    const { theme, toggleTheme } = context;

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
        </button>
    );
}


const Header: React.FC = () => {
    const location = useLocation();
    
    return (
        <header className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-colors">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <LogoIcon className="h-8 w-8 text-primary" />
                        <span className="text-xl font-bold text-light-text dark:text-dark-text">PrepiQ</span>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-6">
                        <Link to="/" className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-primary' : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-primary'}`}>Home</Link>
                        <Link to="/select-role" className={`text-sm font-medium transition-colors ${location.pathname.startsWith('/select-role') || location.pathname.startsWith('/interview') ? 'text-primary' : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-primary'}`}>Practice</Link>

                        <Link to="/history" className={`text-sm font-medium transition-colors ${location.pathname.startsWith('/history') ? 'text-primary' : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-primary'}`}>History</Link>
                    </nav>

                    <div className="flex items-center space-x-4">
                        <LanguageSwitcher />
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;