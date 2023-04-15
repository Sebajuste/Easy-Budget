import { useContext } from "react";
import { SafeAreaView, Text, View } from "react-native";
import { Layout, Picker } from "react-native-rapi-ui";
import _ from "lodash";

import { DaoType } from "../../services/dao";
import { t } from "../../services/i18n";
import { LanguageContext } from "../../services/i18n/language-context";
import { Settings } from "../../services/settings";
import { scroll_styles } from "../../styles";
import * as config from "../../services/i18n/config.i18n";
import { DatabaseContext } from "../../services/db-context";


export default function SettingsScreen() {

    const { language, setLanguage } = useContext(LanguageContext);

    const { dbManager } = useContext(DatabaseContext);

    const settingsDao = dbManager.getDAOFromType<Settings>(DaoType.SETTINGS);


    const languages_items  = _.map(_.toPairs(config.supportedLocales), ([lang, config]) => {
        return {
            label: config.name,
            value: lang
        };
    });

    const changeLanguageHandler = (lang:string) => {
        setLanguage(lang);
        settingsDao.update({
            name: 'language',
            value: lang
        })//
        .catch(console.error);
    };

    return (
        <SafeAreaView style={scroll_styles.container}>

            <Layout style={{margin: 10}}>

                <View style={{margin: 2}}>
                    <Text style={{ fontSize: 12 }}>{ t('common:language') }</Text>
                    <Picker placeholder={t('common:language')} items={languages_items} value={ language } onValueChange={changeLanguageHandler} />
                </View>

            </Layout>

        </SafeAreaView>
    );

}