import { ASYNC_STORAGE_DAO } from "./async_storage/dao-async-storage";


export enum Database {
    ASYNC_STORAGE,
    SQLite
}

export const DATABASE_TYPE = Database.ASYNC_STORAGE;

export function getDao<T>(clazz: any, database : Database) : T {

	switch(database) {
    case Database.ASYNC_STORAGE: {
      return ASYNC_STORAGE_DAO[clazz.name] as T;
    }
  }
  throw new Error('Cannot find database')
}