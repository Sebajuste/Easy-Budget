import { DAO } from "./dao-manager";

export const DEFAULT_SETTINGS : Settings= {
    tuto_shown: false,
    revenue: 0
};


export interface Settings {

    tuto_shown: boolean;
    revenue: number;

}


export abstract class SettingsDao {

    abstract load() : Promise<Settings>;

    abstract save(settings : Settings) : Promise<void>;

}


