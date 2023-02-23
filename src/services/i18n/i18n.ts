import _ from 'lodash';
import React, { useContext, useState } from 'react';

import { LanguageContext } from './language-context';
import * as config from './config.i18n';

export type TranslationWords = {[key:string]:string} | null;

export type Resource = {[namespace:string]: TranslationWords };

export interface TranslationConfig {
    name: string;
    translationFileLoader: () => Resource;
    momentLocaleLoader: () => Promise<any>;
}

export interface I18NConfig {
    fallback: string;
    namespaces: string[];
    defaultNamespace: string;
}

interface Interpolation {
    escapeValue: boolean;
    format: (value:any, format:any) => any;
}

interface UsableI18N {
    type: string;
    init: () => void;
    async?: boolean;
    detect?: ( callback : (lng:string) => void ) => void ;
    read?: (language:string, namespace:string, callback: (err:any, resource:TranslationWords|null) => void ) => void;
    compatibilityJSON?:string;
    cacheUserLanguage?: () => void;
}

interface SetupI18N {
    fallbackLng: string;
    ns: string[];
    defaultNS: string;
    interpolation: Interpolation;
}




export const t = (key: string) => {
    
    const { language } = useContext(LanguageContext);

    const parts = key.split(':');
    const namespace = parts[0];
    const value = parts.slice(1).join(':');

    
    if( ! config.supportedLocales[language] ) {
        return key;
    }

    const resource : Resource = config.supportedLocales[language].translationFileLoader() as Resource;

    const words = resource[namespace];
    if( words ) {
        return words[value];
    }
    return key;
    
};


/**
 * 
 */

export type Callback = (err?:any, r?:any) => void;

let CACHE_RESOURCE : Resource | undefined;

export class I18N {

    private setup : SetupI18N|undefined;

    private _language:string;
    private uses : UsableI18N[] = [];

    private languageDetector: UsableI18N|undefined;
    private backend: UsableI18N|undefined;

    constructor() {
        this._language = '';
        console.log('I18N::constructor')
    }

    private get resource() : Resource|undefined {
        return CACHE_RESOURCE;
    }

    private set resource(value: Resource|undefined) {
        CACHE_RESOURCE = value;
    }

    private async update() {
        const group = _.groupBy(this.uses, 'type');

        this.languageDetector = _.first(group['languageDetector']);
        this.backend = _.first(group['backend']);

        return this.detect().then(lng => {
            this._language = lng;
            return this.loadNamespace();
        });
    }

    private detect() : Promise<string>  {

        if( this.languageDetector ) {

            return new Promise((resolve, reject) => {
                if( this.languageDetector && this.languageDetector.detect !== undefined ) {
                    this.languageDetector.detect( (lng:string) => {
                        resolve(lng);
                    } );
                }
            });

        }
        return new Promise((resolve, reject) => {
            reject('No languageDetector set');
        });
    }

    private async loadNamespace() {

        if( !this.resource ) {
            this.resource = {};
        }
        
        if( this.setup ) {

            const promises = _.map(this.setup.ns, namespace => {

                return new Promise((resolve, reject) => {
                    if( this.backend && this.backend.read ) {
                        this.backend.read(this.language, namespace, (err:any, resource: TranslationWords) => {

                            if( err ) {
                                reject(err);
                            } else if( this.resource ) {
                                resolve({
                                    namespace: namespace,
                                    resource: resource
                                });
                            }
        
                        } );
                    }
                });

            });

            return Promise.all(promises).then(results => {

                _.forEach( results, (result:any) => {
                    const ns : string = result.namespace as any;
                    const resource : TranslationWords = result.resource as any;
                    if( this.resource ) {
                        this.resource[ns] = resource;
                    } else {
                        console.error('No resource ready');
                    }
                } );

            });

        }

        console.error('No setup');

    }

    get language() {
        return this._language;
    }

    get locale() {
        return this.language;
    }

    use(usable: UsableI18N) : I18N {
        this.uses.push(usable);
        return this;
    }

    init(setup : SetupI18N, callback: Callback) : Promise<void> {

        this.setup = setup;

        _.forEach(this.uses, use => {
            use.init();
        });

        return this.update().then(r => {
            callback();
        }).catch(err => {
            callback(err);
        });

    }

    t(key:string, options?: any) : string {

        const parts = key.split(':');
        const namespace = parts[0];
        const value = parts.slice(1).join(':');

        if( this.resource ) {
            const words : TranslationWords = this.resource[namespace];
            if( words ) {
                return words[value];
            }
        }
        return key;
    }

    changeLanguage(lng:string, callback?: Callback) {
        this._language = lng;
        this.update().then(v => {
            if( callback ) {
                callback();
            }
            
        }).catch(err => {
            if( callback ) {
                callback(err);
            }
        });
    }

    dir() {
        return '';
    }

}
