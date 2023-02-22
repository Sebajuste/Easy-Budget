// import * as Localization from 'expo-localization';
import { DAO, DaoType } from '../dao';
import { DAOFactory, DATABASE_TYPE } from '../dao-manager';
import { Settings } from '../settings';

import * as config from './config.i18n';

const languageDetector = {
    type: 'languageDetector',
    compatibilityJSON: 'v3',
    async: true,
    detect: (callback: (lng: string) => void) => {
        // We will get back a string like "en-US". We
        // return a string like "en" to match our language
        // files.

        const settingsDao : DAO<Settings> = DAOFactory.getDAOFromType<Settings>(DaoType.SETTINGS, DATABASE_TYPE);

        settingsDao.find('language').then(setting => {

            if( setting ) {
                console.log('lang : ', setting.value )
                callback(setting.value);
            } else {
                /*
                console.log('lang : ', Localization.locale.split('-')[0] )
                callback(Localization.locale.split('-')[0]);
                */
                callback( config.fallback );
            }

        }).catch(err => {
            console.error(err);
            // console.log('lang : ', Localization.locale.split('-')[0] )
            // callback(Localization.locale.split('-')[0]);
            callback( config.fallback );
        });

        
    },
    init: () => { },
    cacheUserLanguage: () => { },
};

export default languageDetector;