'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Supported languages
type Language = 'en' | 'km';

interface LangContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    toggleLang: () => void;
}

// Create context
const LangContext = createContext<LangContextType | undefined>(undefined);

// Provider component
export const LangProvider = ({ children }: { children: ReactNode }) => {
    const [lang, setLangState] = useState<Language>('en'); // default

    // Load language from localStorage on mount
    useEffect(() => {
        const storedLang = localStorage.getItem('app-lang') as Language | null;
        if (storedLang) {
            setLangState(storedLang);
        }
    }, []);

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem('app-lang', newLang);
    };

    const toggleLang = () => {
        const newLang = lang === 'en' ? 'km' : 'en';
        setLang(newLang);
    };

    return (
        <LangContext.Provider value={{ lang, setLang, toggleLang }}>
            {children}
        </LangContext.Provider>
    );
};

// Hook for easy access
export const useLang = () => {
    const context = useContext(LangContext);
    if (!context) {
        throw new Error('useLang must be used within a LangProvider');
    }
    return context;
};
