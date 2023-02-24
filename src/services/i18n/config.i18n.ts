import { LangConfig } from "./i18n";

export const fallback = "en";
export const supportedLocales : {[lang:string]:LangConfig} = {
    en: {
        name: "English",
        translationFileLoader: () => require('../../../assets/lang/en.json'),
        // en is default locale in Moment
        momentLocaleLoader: () => Promise.resolve(),
    },
    fr: {
        name: "Français",
        translationFileLoader: () => require('../../../assets/lang/fr.json'),
        momentLocaleLoader: () => Promise.resolve(),
    },
    /*
    ar: {
        name: "عربي",
        translationFileLoader: () => require('../lang/ar.json'),
        momentLocaleLoader: () => import('moment/locale/ar'),
    },
    */
};
export const defaultNamespace = "common";
export const namespaces = [
    "buttons",
    "common",
    "forms",
    "menus",
    "title",
    "tutorial"
];