// import i18next, { Callback } from 'i18next';
// import { I18nManager as RNI18nManager } from 'react-native';

import I18N, { Callback } from './i18n';

import * as config from './config.i18n';
import date from './date';
import languageDetector from './language-detector';
import translationLoader from './translation-loader';

// import 'intl-pluralrules'

/*
 "i18n-js": "^4.2.2",
 "i18next": "^22.4.9",

 "@types/i18n-js": "^3.8.4",
 "@types/i18next": "^13.0.0",
*/


let lazyLoading : I18N|undefined;

if( !lazyLoading ) {
    lazyLoading = new I18N();
}

const i18next = lazyLoading ? lazyLoading : new I18N();

const i18n = {
    /**
     * @returns {Promise}
     */
    init: () => {
        return new Promise((resolve, reject) => {
            i18next
                .use(languageDetector)//
                .use(translationLoader)//
                .init({
                    fallbackLng: config.fallback,
                    ns: config.namespaces,
                    defaultNS: config.defaultNamespace,
                    interpolation: {
                        escapeValue: false,
                        format(value, format) {
                            if (value instanceof Date) {
                                return date.format(value, format);
                            }
                        }
                    },
                }, (error) => {
                    console.log('end');
                    if (error) { return reject(error); }
                    date.init(i18next.language)
                        .then(resolve)
                        .catch(error => reject(error));
                });
        });
    },
    /**
     * @param {string} key
     * @param {Object} options
     * @returns {string}
     */
    t: (key:string, options?: any) : string => i18next.t(key, options) as any,
    /**
     * @returns {string}
     */
    get locale() { return i18next.language; },
    /**
     * @returns {'LTR' | 'RTL'}
     */
    get dir() {
        return i18next.dir().toUpperCase();
    },
    /**
     * @returns {boolean}
     */
    get isRTL() {
        // return RNI18nManager.isRTL;
        return false;
    },
    /**
     * Similar to React Native's Platform.select(),
     * i18n.select() takes a map with two keys, 'rtl'
     * and 'ltr'. It then returns the value referenced
     * by either of the keys, given the current
     * locale's direction.
     *
     * @param {Object<string,mixed>} map
     * @returns {mixed}
     */
    select(map: {[key:string] : string}) {
        const key = this.isRTL ? 'rtl' : 'ltr';
        return map[key];
    },
    changeLanguage(lng:string, callback?: Callback) {
        return i18next.changeLanguage(lng, callback)
    }
};

// i18n.init();

export const t = i18n.t;

export default i18n;
