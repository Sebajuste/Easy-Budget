import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { DaoType } from "../dao";
import { DAOFactory, DATABASE_TYPE } from "../dao-manager";
import { Settings } from "../settings";
import { LanguageContext, LanguageSettings } from "./language-context";
import * as config from "./config.i18n";

export function LanguageProvider({ children }: any) {

    const [language, setLanguage] = useState( config.fallback );

    const [isI18nInitialized, setIsI18nInitialized] = useState(false);

    useEffect(() => {

        const settingsDao = DAOFactory.getDAOFromType<Settings>(DaoType.SETTINGS, DATABASE_TYPE);

        settingsDao.find('language').then((setting) => {
            if( setting ) {
                setLanguage(setting.value);
            }
        }).catch(err => {
            console.error('Cannot init LanguageProvider');
            console.error(err);
        }).finally(() => {
            setIsI18nInitialized(true);
        });

    }, []);

    if( isI18nInitialized ) {
        return (
            <LanguageContext.Provider value={{language, setLanguage} as LanguageSettings}>
                {children}
            </LanguageContext.Provider>
        );
    }

    return (
        <View style={styles.loadingScreen}>
            <ActivityIndicator />
        </View>
    );

}


const styles = StyleSheet.create({
    loadingScreen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
  });