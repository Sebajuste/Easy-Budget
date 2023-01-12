
export const DEFAULT_SETTINGS : Settings= {
    tuto_shown: false
};


export interface Settings {

    tuto_shown: boolean;

}


export interface SettingsDao {

    load() : Promise<Settings>;

    save(settings : Settings) : Promise<void>;

}
