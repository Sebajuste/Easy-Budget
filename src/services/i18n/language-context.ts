import React from "react";

export interface LanguageSettings {
    language: string;
    setLanguage: (lng:string) => void
}

export const LanguageContext = React.createContext({
    language: 'en',
    setLanguage: (lng:string) => { console.warn('No set language defined') }
} as LanguageSettings);
