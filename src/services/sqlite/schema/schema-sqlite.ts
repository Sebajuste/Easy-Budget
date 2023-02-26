import * as SQLite from 'expo-sqlite';

export interface SchemaAction {
    action(client : SQLite.WebSQLDatabase) : Promise<void>;
}