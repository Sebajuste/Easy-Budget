import { ASYNC_STORAGE_DAO, DB_MANAGER_ASYNC } from "./async_storage/dao-async-storage";
import { DAO } from "./dao";
import { DatabaseManager } from "./database-manager";
import { SQLITE_DAO } from "./sqlite/dao-sqlite";

export enum Database {
    ASYNC_STORAGE = "async_storage",
    SQLite = "sqlite"
}

export const DATABASE_TYPE = Database.ASYNC_STORAGE;



export class DAOFactory {

  static getDatabaseManager(database : Database) : DatabaseManager {

    switch(database) {
      case Database.ASYNC_STORAGE: {
        return DB_MANAGER_ASYNC;
      }
      case Database.SQLite: {
        // return new DatabaseManagerSQLite(sqlite_client);
        break;
      }
    }

    throw new Error("Invalid DAO type");
  }

  static getDAO<T>(table: typeof DAO<T>, database : Database) : DAO<T> {
    switch(database) {
      case Database.ASYNC_STORAGE: {
        const dao = ASYNC_STORAGE_DAO[table.name];
        if( dao ) {
          return dao;
        }
        break;
      }
      case Database.SQLite: {
        const dao = SQLITE_DAO[table.name];
        if( dao ) {
          return dao;
        }
        break;
      }
    }
    throw new Error(`Invalid DAO type ${table.name} for ${database}`);
  }

}



export function getDao<T>(clazz: any, database : Database) : T {

	switch(database) {

    case Database.ASYNC_STORAGE: {
      return ASYNC_STORAGE_DAO[clazz.name] as T;
    }
    case Database.SQLite: {
      return SQLITE_DAO[clazz.name] as T;
    }
  }
  
  // throw new Error('Cannot find database')
  return {} as T;
}

