import { ASYNC_STORAGE_DAO } from "./async_storage/dao-async-storage";
import { SQLITE_DAO } from "./sqlite/dao-sqlite";


export enum Database {
    ASYNC_STORAGE,
    SQLite
}

export const DATABASE_TYPE = Database.ASYNC_STORAGE;



export abstract class DatabaseManager {
  abstract init() : Promise<void>;
  abstract delete(): Promise<void>;
}


export function getDao<T>(clazz: any, database : Database) : T {

	switch(database) {
    case Database.ASYNC_STORAGE: {
      return ASYNC_STORAGE_DAO[clazz.name] as T;
    }
    case Database.SQLite: {
      console.log('get SQLite');
      return SQLITE_DAO[clazz.name] as T;
    }
  }
  throw new Error('Cannot find database')
  
}