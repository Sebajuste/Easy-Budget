import i18next, { Callback } from 'i18next';
import { I18nManager as RNI18nManager } from 'react-native';

import * as config from './config.i18n';
import date from './date';
import languageDetector from './language-detector';
import translationLoader from './translation-loader';

import 'intl-pluralrules'

const i18n = {
    /**
     * @returns {Promise}
     */
    init: () => {
        return new Promise((resolve, reject) => {
            i18next
                .use(languageDetector)
                .use(translationLoader)
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
        return RNI18nManager.isRTL;
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
    changeLanguage(lng:string, callback: Callback|undefined) {
        return i18next.changeLanguage(lng, callback)
    }
};

export const t = i18n.t;

export default i18n;
