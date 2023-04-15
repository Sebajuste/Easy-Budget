import { useState } from "react";
import { DatabaseContext, DatabaseSettings } from "./db-context";
import { DatabaseManager } from "./database-manager";
import { DatabaseType } from "./dao-manager";
import { DB_MANAGER_SQLite } from "./sqlite/database-manager-sqlite";
import { DB_MANAGER_ASYNC } from "./async_storage/dao-async-storage";


export default function DatabaseProvider({children} : {children:any}) {

    const [dbManager, setDbManager] = useState<DatabaseManager|null>( DB_MANAGER_SQLite );

    const setDbManagerHandler = (dbType:DatabaseType) : void => {

        switch(dbType) {
            case DatabaseType.ASYNC_STORAGE:
                setDbManager( DB_MANAGER_ASYNC );
                break;
            case DatabaseType.SQLite:
                setDbManager( DB_MANAGER_SQLite );
                break;
          }
        
    }

    return (
        <DatabaseContext.Provider value={{dbManager: dbManager, setDbManager: setDbManagerHandler} as DatabaseSettings}>
            {children}
        </DatabaseContext.Provider>
    );

}
