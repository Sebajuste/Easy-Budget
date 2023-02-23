import { useContext } from "react";
import { SafeAreaView, Text, View } from "react-native";
import { Layout, Picker } from "react-native-rapi-ui";
import _ from "lodash";

import { DaoType } from "../../services/dao";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import { t } from "../../services/i18n";
import { LanguageContext } from "../../services/i18n/language-context";
import { Settings } from "../../services/settings";
import { scroll_styles } from "../../styles";
import * as config from "../../services/i18n/config.i18n";


export default function SettingsScreen() {

    const { language, setLanguage } = useContext(LanguageContext);

    const settingDao = DAOFactory.getDAOFromType<Settings>(DaoType.SETTINGS, DATABASE_TYPE);

    const languages_items  = _.map(_.toPairs(config.supportedLocales), ([lang, config]) => {
        return {
            label: config.name,
            value: lang
        };
    });

    const changeLanguageHandler = (lang:string) => {
        setLanguage(lang);
        settingDao.update({
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