
import { Account, AccountDao } from "../account";
import { Settings, SettingsDao } from '../settings';
import { sqlite_client } from "./dao-sqlite";


export class SettingsDaoSQLite extends SettingsDao {



    load(): Promise<Settings> {
        throw new Error('Method not implemented.');
    }


    save(settings: Settings): Promise<void> {
        throw new Error('Method not implemented.');
    }

}
