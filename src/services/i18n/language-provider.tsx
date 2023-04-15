import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { DaoType } from "../dao";
import { Settings } from "../settings";
import { LanguageContext, LanguageSettings } from "./language-context";
import * as config from "./config.i18n";
import { DatabaseContext } from "../db-context";

export function LanguageProvider({ children }: any) {

    const [language, setLanguage] = useState( config.fallback );

    const [isI18nInitialized, setIsI18nInitialized] = useState(false);

    const { dbManager } = useContext( DatabaseContext );

    const settingsDao = dbManager.getDAOFromType<Settings>(DaoType.SETTINGS);

    useEffect(() => {

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