import React, { useContext } from "react";
import { DatabaseManager } from "./database-manager";
import { DatabaseType } from "./dao-manager";


export interface DatabaseSettings {
    dbManager: DatabaseManager;
    setDbManager: (dbType:DatabaseType) => void
}

export const DatabaseContext = React.createContext({
    dbManager: {},
    setDbManager: (dbType:DatabaseType) => { console.warn('No set database defined') }
} as DatabaseSettings);
