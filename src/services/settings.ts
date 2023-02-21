import { DAO } from "./dao";


export interface Settings {
    name: string;
    value: string;
}


export abstract class SettingsDao extends DAO<Settings> {

    // abstract load() : Promise<Settings[]>;

    // abstract update(settings : Settings) : Promise<void>;

}


