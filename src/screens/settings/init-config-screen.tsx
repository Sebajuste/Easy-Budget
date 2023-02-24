import { useContext, useEffect, useRef } from "react";
import { Image, Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-rapi-ui";
import * as Animatable from 'react-native-animatable';

import { LanguageContext, t } from "../../services/i18n";
import { scroll_styles } from "../../styles";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import { DaoType } from "../../services/dao";


const FOCUSED = {
    scale: 1.1,
    ...Platform.select({
        ios: {
            shadowColor: "#000",
            shadowOffset: {
                width: 4,
                height: 5,
            },
            shadowOpacity: 0.2,
            shadowRadius: 5,
        },
        android: {
            elevation: 10,
            borderRadius: 10
        }
    })
};

const UNFOCUSED = {
    scale: 1,
    ...Platform.select({
        ios: {
            shadowColor: "transparent",
            shadowOffset: {
                width: 0,
                height: 5,
            },
            shadowOpacity: 0.34,
            shadowRadius: 0,
        },
        android: {
            elevation: 0,
            borderRadius: 0
        }
    })
};

function LangButton({image, onPress, focused} : any) {

    const viewRef = useRef<any>();

    useEffect( () => {
        if (viewRef && viewRef.current ) {
            if( focused ) {
                viewRef.current.animate({0: UNFOCUSED, 1: FOCUSED});
            } else {
                viewRef.current.animate({0: FOCUSED, 1: UNFOCUSED});
            }
        }
    }, [focused]);

    return (
        <Pressable onPress={onPress} style={{margin: 16}}>
            <Animatable.View ref={viewRef} duration={500}>
                <Image source={ image } style={{height: 128, width: 128, resizeMode: 'cover'}} />
            </Animatable.View>
        </Pressable>
    );

}



export default function InitConfigScreen({navigation} : any) {

    // const navigation = useNavigation();

    const {language, setLanguage} = useContext(LanguageContext);

    const settingsDao = DAOFactory.getDAOFromType(DaoType.SETTINGS, DATABASE_TYPE);

    const changeLanguageHandler = (lang:string) => {
        setLanguage(lang);
    };

    const saveHandler = () => {

        settingsDao.update({
            name: 'language',
            value: language
        }).then( () => {

            navigation.navigate('Drawer', { screen: 'TutoScreen' });

        } ).catch(err => {
            console.error(err);
        });

    };

    // console.log('InitConfigScreen navigation: ', navigation);

    return (
        <SafeAreaView style={scroll_styles.container}>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{margin: 10, fontSize: 24}}> {t('forms:select_language')}</Text>

                <View style={{flexDirection: 'row'}}>

                    <LangButton image={require('../../../assets/images/flag-english.png')} onPress={ () => changeLanguageHandler('en') } focused={language == 'en'} />

                    <LangButton image={require('../../../assets/images/flag-french.png')} onPress={ () => changeLanguageHandler('fr') } focused={language == 'fr'} />

                </View>

                <View>

                    <Button text={t('buttons:save')} onPress={saveHandler} />

                </View>

            </View>

        </SafeAreaView>
    );

}
