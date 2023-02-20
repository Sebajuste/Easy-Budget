
import _ from 'lodash';
import { Settings, SettingsDao } from '../settings';
import { sqlite_client } from "./database-manager-sqlite";


export class SettingsDaoSQLite extends SettingsDao {

    load(): Promise<Settings> {

        const SQL = `SELECT set_name as name, set_value as value FROM t_settings_set`;

        return new Promise<any[]>((resolve, reject) => {
            sqlite_client().transaction(tx => {
                tx.executeSql(SQL, [], (_, { rows: {_array} }) => {
                    resolve(_array);
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        }).then((array : any[]) => {

            const settings = _.reduce(array, (acc, item : any) => {
                acc[item.name] = item.value;
                return acc;
            }, {} as {[key:string]:string}) as any;

            return settings as Settings;

        });

    }

    find(selector: any) : Promise<Settings|null> {
        throw new Error("Method not implemented.");
    }


    save(settings: Settings): Promise<void> {

        const SQL = `INSERT `;

        throw new Error('Method not implemented.');
    }

}
