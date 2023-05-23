import * as SQLite from 'expo-sqlite';

export const DATABASE_VERSION = '1.0.3';

export interface SchemaAction {
    action(client : SQLite.WebSQLDatabase) : Promise<void>;
}