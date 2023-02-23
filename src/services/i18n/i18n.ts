import { useContext } from "react";
import { LanguageContext } from "./language-context";

import { supportedLocales } from "./config.i18n";

export interface LangConfig {
    name: String;
    translationFileLoader: () => LangResource;
    momentLocaleLoader?: () => Promise<any>;
}

export type TranslationWords = {[key:string]:string};
export type LangResource = {[namespace:string]:TranslationWords};

export function t(key: string) : string {

    const parts = key.split(':');
    const namespace = parts[0];
    const value = parts.slice(1).join(':');

    const { language } = useContext(LanguageContext);

    if( supportedLocales.hasOwnProperty(language) ) {
        const langConfig = supportedLocales[language] as LangConfig;
        const resource = langConfig.translationFileLoader()

        if( resource.hasOwnProperty(namespace)) {
            const words = resource[namespace];
            return words.hasOwnProperty(value) ? words[value] : key;
        }
    }
    
    return key;
}
