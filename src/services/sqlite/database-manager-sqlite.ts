import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

import { DatabaseManager } from "../database-manager";
import { SCHEMA_ACTIONS } from './schema/schema-config';
import { SQLTransaction } from 'expo-sqlite';


const SQLITE_VERSION = "1.0";
const DATABASE_NAME = "easy_budget.db";


async function getDatabaseVersion(client : SQLite.WebSQLDatabase ) : Promise<any> {
    new Promise<any[]>((resolve, reject) => {
        client.transaction((tx:SQLTransaction) => {
            const SQL = `SELECT set_value as value FROM t_settings_set WHERE set_name = 'version'`;
            tx.executeSql(SQL, [], (_, { rows: {_array} }) => {
                resolve(_array);
            }, (tx, err) => {
                reject(err);
                return true;
            });
        });
    })
}


export class DatabaseManagerSQLite extends DatabaseManager {

    private db: any;

    private error: any;

    constructor() {
        super();
        this.error = null;
    }

    public get client() : SQLite.WebSQLDatabase {
        return this.db;
    }

    public async open() : Promise<void> {

        if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite')).exists) {
            await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
        }
        /*
        // To download from external file
        await FileSystem.downloadAsync(
            Asset.fromModule(require(pathToDatabaseFile)).uri,
            FileSystem.documentDirectory + `SQLite/${DATABASE_NAME}`
        );
        */

        return new Promise((resolve, reject) => {
            SQLite.openDatabase(DATABASE_NAME, SQLITE_VERSION, "", 1, (db) => {
                this.db = db;
                console.log('Database opened');
                resolve();
            });
        });
    }

    async close() {
        if( this.db ) {
            return this.db.closeAsync().then(() => {
                console.log('Database closed');
                // this.db = null;
            });
        }
    }

    public async init(): Promise<void> {

        this.error = null;

        return SCHEMA_ACTIONS['install'].action(this.client) //
        .then( async () => {
            const versionSetting = await getDatabaseVersion(this.db);
            const version = versionSetting ? versionSetting.value : '1.0.0';
            console.log('Update version ', version);
            if( SCHEMA_ACTIONS[version] ) {
                return await SCHEMA_ACTIONS[version].action(this.client).catch(err => {
                    this.error = err;
                });
            }
        })
        .catch(err => {
            console.error(err);
            this.error = err;
        });

    }

    public delete(): Promise<void> {

        return this.close()//
        .then( () => this.db.deleteAsync())//
        .then( () => FileSystem.deleteAsync(FileSystem.documentDirectory + `SQLite/${DATABASE_NAME}`, {idempotent: true}) )//
        .then( () => {
            console.log('Database removed');
            return this.open();
        });

    }

    public getLastError() {
        return this.error;
    }    
}

export let DB_MANAGER_SQLite : DatabaseManagerSQLite; // = new DatabaseManagerSQLite();

export const sqlite_client_future = new Promise<SQLite.WebSQLDatabase>((resolve, reject) => {
    DB_MANAGER_SQLite = new DatabaseManagerSQLite();
    DB_MANAGER_SQLite.open().then(db => {
        console.log('DB opened');
        return DB_MANAGER_SQLite.init();
    })//
    .then(r => {
        resolve(DB_MANAGER_SQLite.client);
    }, err => {
        reject(err);
    })//
    .catch(console.error);
    
});

export function sqlite_client_async() {
    return sqlite_client_future;
}

export const sqlite_client = () : SQLite.WebSQLDatabase => {
    return DB_MANAGER_SQLite.client;
};
