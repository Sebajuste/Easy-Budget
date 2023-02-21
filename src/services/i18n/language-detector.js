import * as Localization from 'expo-localization';
import { DAO, DaoType } from '../dao';
import { DAOFactory, DATABASE_TYPE } from '../dao-manager';
import { Settings } from '../settings';

const languageDetector = {
    type: 'languageDetector',
    compatibilityJSON: 'v3',
    async: true,
    detect: (callback) => {
        // We will get back a string like "en-US". We
        // return a string like "en" to match our language
        // files.

        const settingsDao = DAOFactory.getDAOFromType(DaoType.SETTINGS, DATABASE_TYPE);

        settingsDao.find('language').then(setting => {

            if( setting ) {
                console.log('lang : ', setting.value )
                callback(setting.value);
            } else {
                console.log('lang : ', Localization.locale.split('-')[0] )
                callback(Localization.locale.split('-')[0]);
            }

        }).catch(err => {
            console.error(err);
            console.log('lang : ', Localization.locale.split('-')[0] )
            callback(Localization.locale.split('-')[0]);
        });

        
    },
    init: () => { },
    cacheUserLanguage: () => { },
};

export default languageDetector;