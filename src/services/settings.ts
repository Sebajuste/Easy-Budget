
export const DEFAULT_SETTINGS : Settings= {
    tuto_shown: false,
    revenue: 0
};


export interface Settings {

    tuto_shown: boolean;
    revenue: number;

}


export interface SettingsDao {

    load() : Promise<Settings>;

    save(settings : Settings) : Promise<void>;

}
