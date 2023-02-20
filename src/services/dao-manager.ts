import { ASYNC_STORAGE_DAO, DB_MANAGER_ASYNC } from "./async_storage/dao-async-storage";
import { DAO, DaoType, InvalidDao } from "./dao";
import { DatabaseManager } from "./database-manager";
import { SQLITE_DAO, DB_MANAGER_SQLite } from "./sqlite/dao-sqlite";

export enum DatabaseType {
    ASYNC_STORAGE = "async_storage",
    SQLite = "sqlite"
}

export const DATABASE_TYPE = DatabaseType.SQLite;


function getDaoMapping(databaseType : DatabaseType) {
  switch(databaseType) {
    case DatabaseType.ASYNC_STORAGE:
      return ASYNC_STORAGE_DAO;
    case DatabaseType.SQLite:
      return SQLITE_DAO;
  }
}


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

  static getDAOFromType<T>(daoType : DaoType, databaseType : DatabaseType) : DAO<T> {

    const daoMapping = getDaoMapping(databaseType);

    const className = daoType.toString();

    if( daoMapping.has(className) ) {
      return daoMapping.get(className) as DAO<T>;
    }
    // throw new Error(`Invalid DAO type ${className} for ${databaseType}`);
    return new InvalidDao(className);
  }

  /**
   * @deprecated Use DAOFactory.getDAOFromType() instead 
   */
  static getDAO<T>(clazz: typeof DAO<T>, databaseType : DatabaseType) : DAO<T> | null {

    const daoMapping = getDaoMapping(databaseType);

    const className = clazz.name;

    if( daoMapping.has(className) ) {
      return daoMapping.get(className) as DAO<T>;
    }

    /*
    switch(databaseType) {
      case DatabaseType.ASYNC_STORAGE: {
        if( ASYNC_STORAGE_DAO.has(clazz.name) ) {
          return ASYNC_STORAGE_DAO.get(clazz.name) as DAO<T>;
        }
        break;
      }
      case DatabaseType.SQLite: {
        if( SQLITE_DAO.has(clazz.name) ) {
          return SQLITE_DAO.get(clazz.name) as DAO<T>;
        }
        break;
      }
    }
    */

    // throw new Error(`Invalid DAO type ${className} for ${databaseType}`);
    return new InvalidDao(className);

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
