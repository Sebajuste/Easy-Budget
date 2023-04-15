import { useEffect, useState } from "react";
import { View } from "react-native-animatable";
import { Text } from "react-native";

import { DatabaseContext, DatabaseSettings } from "./db-context";
import { DatabaseManager } from "./database-manager";
import { DatabaseType } from "./dao-manager";
import { DatabaseManagerFactory } from "./sqlite/database-manager-sqlite";
import { DB_MANAGER_ASYNC } from "./async_storage/dao-async-storage";



export default function DatabaseProvider({children} : {children:any}) {

    const [dbManager, setDbManager] = useState<DatabaseManager|null>( null );

    const [ loaded, setLoaded ] = useState(false);

    const setDbManagerHandler = (dbType:DatabaseType) : void => {

        switch(dbType) {
            case DatabaseType.ASYNC_STORAGE:
                setDbManager( DB_MANAGER_ASYNC );
                break;
            case DatabaseType.SQLite:
                // setDbManager( DB_MANAGER_SQLite );
                // setDbManager( DatabaseManagerFactory.create() );
                break;
          }
        
    }

    useEffect( () => {
        setLoaded(false);
        DatabaseManagerFactory.create().then(dbManager => {
            setDbManager(dbManager);
            setLoaded(true);
        });
    }, []);

    if( ! loaded ) {
        return (
            <View>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <DatabaseContext.Provider value={{dbManager: dbManager, setDbManager: setDbManagerHandler} as DatabaseSettings}>
            {children}
        </DatabaseContext.Provider>
    );

}
