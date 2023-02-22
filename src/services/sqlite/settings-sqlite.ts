
import _ from 'lodash';
import { Settings, SettingsDao } from '../settings';
import { sqlite_client } from "./database-manager-sqlite";


export class SettingsDaoSQLite extends SettingsDao {

    load(): Promise<Settings[]> {

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
        });

    }

    find(selector: any) : Promise<Settings|null> {

        const SQL = `SELECT set_name as name, set_value as value FROM t_settings_set WHERE set_name = ?`;

        return new Promise<Settings|null>((resolve, reject) => {

            const client = sqlite_client();

            if( client ) {
                client.transaction(tx => {
                    tx.executeSql(SQL, [selector], (_, { rows: {_array} }) => {
                        resolve(_array.length > 0 ? _array[0] : null);
                    }, (tx, err) => {
                        reject(err);
                        return true;
                    });
                });
            } else {
                reject('DB not ready');
            }

            
        });
    }

    add(settings: Settings): Promise<string | number | undefined> {

        const SQL = `INSERT OR REPLACE INTO t_settings_set (set_name, set_value) VALUES (?, ?)`;

        const params = [settings.name, settings.value];

        return new Promise((resolve, reject) => {
            sqlite_client().transaction(tx => {
                tx.executeSql(SQL, params, (_, { insertId }) => {
                    resolve(insertId);
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });
    }

    addAll(settings: Settings[]): Promise<(string | number | undefined)[]> {
        throw new Error('Method not implemented.');
    }

    update(settings: Settings): Promise<void> {
        return this.add(settings).then(r => {});
    }

    remove(settings: Settings): Promise<void> {
        throw new Error('Method not implemented.');
    }

}
