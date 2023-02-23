import { useEffect, useState } from "react";
import { DaoType } from "../dao";
import { DAOFactory, DATABASE_TYPE } from "../dao-manager";
import { Settings } from "../settings";
import { LanguageContext, LanguageSettings } from "./language-context";

export function LanguageProvider({ children }: any) {

    const [language, setLanguage] = useState('en');

    useEffect(() => {

        const settingsDao = DAOFactory.getDAOFromType<Settings>(DaoType.SETTINGS, DATABASE_TYPE);

        settingsDao.find('language').then((setting) => {
            console.log('load lang : ', setting)
            if( setting ) {
                setLanguage(setting.value);
            }
        })

    }, []);

    return (
        <LanguageContext.Provider value={{language, setLanguage} as LanguageSettings}>
            {children}
        </LanguageContext.Provider>
    );
    
}
