import { useContext, useEffect, useState } from "react";
import { SafeAreaView, Text, View } from "react-native";
import { Layout, Picker } from "react-native-rapi-ui";
import { DaoType } from "../../services/dao";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import i18n, { t } from "../../services/i18n";
import { LanguageContext } from "../../services/i18n/language-context";
import { Settings } from "../../services/settings";
import { scroll_styles } from "../../styles";



const LANGUAGE_ITEMS = [
    {
        "label": "Français",
        "value": "fr"
    }, {
        "label": "English",
        "value": "en"
    }
];

export default function SettingsScreen() {

    // const languageContext = useContext(LanguageContext);
    const { language, setLanguage } = useContext(LanguageContext);

    // const [language, setLanguage] = useState(languageContext.language);

    const settingDao = DAOFactory.getDAOFromType<Settings>(DaoType.SETTINGS, DATABASE_TYPE);

    const changeLanguageHandler = (lang:string) => {
        console.log('switch to ', lang)
        setLanguage(lang);
        
        settingDao.update({
            name: 'language',
            value: lang
        })//
        .then(r => {
            console.log('lang change saved')
            /*
            i18n.changeLanguage(lang, (err, t) => {
                if (err) return console.log('something went wrong loading', err);
            });
            */
        })//
        .catch(console.error);
    };

    useEffect(() => {
        /*
        if( i18n.locale ) {
            console.log('i18n.locale: ', i18n.locale);
            setLanguage( i18n.locale );
        } else {
            console.warn('No locale found');
        }

        settingDao.find('language').then(setting => {
            if( setting ) {
                setLanguage(setting.value);
            }
        }).catch(console.error);
        */

    }, []);

    return (
        <SafeAreaView style={scroll_styles.container}>

            <Layout style={{margin: 10}}>

                <View style={{margin: 2}}>
                    <Text style={{ fontSize: 12 }}>{ t('common:language') }</Text>
                    <Picker placeholder={t('common:language')} items={LANGUAGE_ITEMS} value={ language } onValueChange={changeLanguageHandler} />
                </View>

                <View style={{margin: 2}}>
                    <Text>{ t('common:language') } : {language}</Text>
                </View>

            </Layout>

        </SafeAreaView>
    );

}