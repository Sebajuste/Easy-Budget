import * as SQLite from 'expo-sqlite';
import _ from 'lodash';

import { Settings, SettingsDao } from '../settings';
import assert from '../../util/assert';


export class SettingsDaoSQLite extends SettingsDao {

    private client : SQLite.WebSQLDatabase;

    constructor(client: SQLite.WebSQLDatabase) {
        super();
        assert( client );
        this.client = client;
    }

    load(): Promise<Settings[]> {

        const SQL = `SELECT set_name as name, set_value as value FROM t_settings_set`;

        return new Promise<any[]>((resolve, reject) => {
            this.client.transaction(tx => {
                tx.executeSql(SQL, [], (_, { rows: {_array} }) => {
                    resolve(_array);
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });

    }

    async find(selector: any) : Promise<Settings|null> {

        const SQL = `SELECT set_name as name, set_value as value FROM t_settings_set WHERE set_name = ?`;

        //const client = await sqlite_client_async();

        return new Promise<Settings|null>((resolve, reject) => {
            this.client.transaction(tx => {
                tx.executeSql(SQL, [selector], (_, { rows: {_array} }) => {
                    resolve(_array.length > 0 ? _array[0] : null);
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });

    }

    add(settings: Settings): Promise<string | number | undefined> {

        const SQL = `INSERT OR REPLACE INTO t_settings_set (set_name, set_value) VALUES (?, ?)`;

        const params = [settings.name, settings.value];

        return new Promise((resolve, reject) => {
            this.client.transaction(tx => {
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
