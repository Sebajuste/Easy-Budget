import * as config from './config.i18n';
import { TranslationConfig, TranslationWords } from './i18n';

const translationLoader = {
    type: 'backend',
    init: () => {},
    read: function(language:string, namespace:string, callback: (err:any, resource:TranslationWords|null) => void ) {
        let resource : TranslationWords | null = null;
        let error = null;
        try {
            const supportedLocales : {[key:string]:TranslationConfig} = config.supportedLocales as any;
            resource = supportedLocales[language]
                .translationFileLoader()[namespace];
        } catch (_error) { error = _error; }
        callback(error, resource);
    },
};

export default translationLoader;