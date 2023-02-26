import * as SQLite from 'expo-sqlite';

import { WebSQLDatabase } from "expo-sqlite";
import { SchemaAction } from "./schema-sqlite";



export class UpgradeSQLite1_1_0 implements SchemaAction {

    action(client: WebSQLDatabase): Promise<void> {
        
        return new Promise<void>( (resolve, reject) => {

            client.exec([
                { sql: 'PRAGMA foreign_keys = ON;', args: [] },

                { sql: 'PRAGMA foreign_keys = ON;', args: [] },


            ], false, (err : any, resultSet) => {
    
                if( err ) {
                    console.error('Database Init error', err); 
                    reject(err);
                } else {
    
                    if( resultSet ) {
                        for(const item of resultSet) {
                            if( item.hasOwnProperty('error') ) {
                                const itemError = item as SQLite.ResultSetError;
                                console.error(itemError.error);
                                reject(itemError.error);
                                return;
                            }
                        }
                    }
                    console.log('Database Install done');
                    resolve();
                }
                
            });
            
        });

    }

}