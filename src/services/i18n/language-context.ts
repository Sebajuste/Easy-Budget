import React from "react";

import * as config from "./config.i18n";

export interface LanguageSettings {
    language: string;
    setLanguage: (lng:string) => void
}

export const LanguageContext = React.createContext({
    language: config.fallback,
    setLanguage: (lng:string) => { console.warn('No set language defined') }
} as LanguageSettings);
