import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

import { DatabaseManager } from "../database-manager";
import { SCHEMA_ACTIONS } from './schema/schema-config';
import { SQLTransaction } from 'expo-sqlite';
import { ReadingOptions } from 'expo-file-system';


const SQLITE_VERSION = "1.0";
// const DATABASE_NAME = "easy_budget.db";


async function getDatabaseVersion(client : SQLite.WebSQLDatabase ) : Promise<string> {
    return new Promise<string>((resolve, reject) => {
        client.transaction((tx:SQLTransaction) => {
            const SQL = `SELECT set_value as value FROM t_settings_set WHERE set_name = 'version'`;
            tx.executeSql(SQL, [], (_, { rows: {_array} }) => {
                resolve(_array.length > 0 ? _array[0].value : '1.0.0');
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

    private database_name : string = '';

    constructor() {
        super();
        this.error = null;
    }

    public get client() : SQLite.WebSQLDatabase {
        return this.db;
    }

    public async dbList() : Promise<string[]> {

        const dirUri = FileSystem.documentDirectory + 'SQLite';

        if (!(await FileSystem.getInfoAsync(dirUri)).exists) {
            await FileSystem.makeDirectoryAsync(dirUri);
        }

        return FileSystem.readDirectoryAsync(dirUri);

    }

    public async open(dbName:string) : Promise<void> {

        const dirUri = FileSystem.documentDirectory + 'SQLite';

        if (!(await FileSystem.getInfoAsync(dirUri)).exists) {
            await FileSystem.makeDirectoryAsync(dirUri);
        }
        /*
        // To download from external file
        await FileSystem.downloadAsync(
            Asset.fromModule(require(pathToDatabaseFile)).uri,
            FileSystem.documentDirectory + `SQLite/${DATABASE_NAME}`
        );
        */

        const fileUri = `${dirUri}/${dbName}`;
        const readOptions = {encoding: FileSystem.EncodingType.Base64} as ReadingOptions;

        FileSystem.readAsStringAsync(fileUri, readOptions).then(data => {
            return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data);
        }).then(digest => {
            
        }).catch(console.error);

        /*
        const { modificationTime: modTime } = await FileSystem.getInfoAsync(fileUri, { md5: false });
        console.log('modificationTime: ', new Date(modTime*1000).toString() );
        */

        return new Promise((resolve, reject) => {
            SQLite.openDatabase(dbName, SQLITE_VERSION, "", 1, (db) => {
                this.db = db;
                this.database_name = dbName;
                console.log('Database opened');
                resolve();
            });
        });
    }

    async close() {
        if( this.db ) {
            return this.db.closeAsync().then(() => {
                console.log('Database closed');
            });
        }
    }

    public async init(): Promise<void> {

        this.error = null;

        getDatabaseVersion(this.db).then(version => {
            if( SCHEMA_ACTIONS[version] ) {
                return SCHEMA_ACTIONS[version].action(this.client).catch(err => {
                    this.error = err;
                });
            } else {
                console.log('No upgrade required');
            }
        }, err => {
            return SCHEMA_ACTIONS['install'].action(this.client);
        }).catch(err => {
            console.error(err);
            this.error = err;
        });

        /*
        return SCHEMA_ACTIONS['install'].action(this.client) //
        .then( async () => {
            const version = await getDatabaseVersion(this.db);
            console.log('Database version ', version);
            if( SCHEMA_ACTIONS[version] ) {
                return await SCHEMA_ACTIONS[version].action(this.client).catch(err => {
                    this.error = err;
                });
            } else {
                console.log('No upgrade required');
            }
        })
        .catch(err => {
            console.error(err);
            this.error = err;
        });
        */
    }

    public delete(): Promise<void> {

        return this.close()//
        .then( () => this.db.deleteAsync())//
        .then( () => FileSystem.deleteAsync(FileSystem.documentDirectory + `SQLite/${DATABASE_NAME}`, {idempotent: true}) )//
        .then( () => {
            console.log('Database removed');
            return this.open(this.database_name);
        });

    }

    public getLastError() {
        return this.error;
    }    
}

export let DB_MANAGER_SQLite : DatabaseManagerSQLite; // = new DatabaseManagerSQLite();

const sqlite_client_future = new Promise<SQLite.WebSQLDatabase>((resolve, reject) => {
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
