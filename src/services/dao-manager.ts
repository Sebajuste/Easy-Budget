import { ASYNC_STORAGE_DAO } from "./async_storage/dao-async-storage";


export enum Database {
    ASYNC_STORAGE,
    SQLite
}

export const DATABASE_TYPE = Database.ASYNC_STORAGE;

export function getDao<T>(clazz : T&Function, database : Database) : T | undefined {

	switch(database) {
    case Database.ASYNC_STORAGE: {
      return ASYNC_STORAGE_DAO[clazz.name] as T;
    }
  }
  return undefined;
}