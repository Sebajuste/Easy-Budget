import React from "react";
import { DatabaseManager } from "./database-manager";
import { DatabaseType } from "./dao-manager";


export interface DatabaseSettings {
    dbManager: DatabaseManager|null;
    setDbManager: (dbType:DatabaseType) => void
}

export const DatabaseContext = React.createContext({
    dbManager: null,
    setDbManager: (dbType:DatabaseType) => { console.warn('No set database defined') }
} as DatabaseSettings);
