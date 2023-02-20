import { ASYNC_STORAGE_DAO, DB_MANAGER_ASYNC } from "./async_storage/dao-async-storage";
import { DAO, DaoType } from "./dao";
import { DatabaseManager } from "./database-manager";
import { SQLITE_DAO, DB_MANAGER_SQLite } from "./sqlite/dao-sqlite";

export enum DatabaseType {
    ASYNC_STORAGE = "async_storage",
    SQLite = "sqlite"
}

export const DATABASE_TYPE = DatabaseType.SQLite;


export class DAOFactory {

  static getDatabaseManager(databaseType : DatabaseType) : DatabaseManager {

    switch(databaseType) {
      case DatabaseType.ASYNC_STORAGE: {
        return DB_MANAGER_ASYNC;
      }
      case DatabaseType.SQLite: {
        return DB_MANAGER_SQLite;
      }
    }

    throw new Error("Invalid DAO type");
  }

  static getDAO<T>(clazz: typeof DAO<T>, databaseType : DatabaseType) {

    switch(databaseType) {
      case DatabaseType.ASYNC_STORAGE: {
        if( ASYNC_STORAGE_DAO.has(clazz.name) ) {
          return ASYNC_STORAGE_DAO.get(clazz.name);
        }
        break;
      }
      case DatabaseType.SQLite: {
        if( SQLITE_DAO.has(clazz.name) ) {
          return SQLITE_DAO.get(clazz.name);
        }
        break;
      }
    }
    throw new Error(`Invalid DAO type ${clazz.name} for ${databaseType}`);

  }

  /*
  static getDAO<T>(clazz: typeof DAO<T>, database : Database) : DAO<T> {
    switch(database) {
      case Database.ASYNC_STORAGE: {
        const dao = ASYNC_STORAGE_DAO[clazz.name];
        if( dao ) {
          return dao;
        }
        break;
      }
      case Database.SQLite: {
        const dao = SQLITE_DAO[clazz.name];
        if( dao ) {
          return dao;
        }
        break;
      }
    }
    throw new Error(`Invalid DAO type ${clazz.name} for ${database}`);
  }
  */

}


/*
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
*/
