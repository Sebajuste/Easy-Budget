import * as SQLite from 'expo-sqlite';
import { WebSQLDatabase } from "expo-sqlite";

import { DATABASE_VERSION, SchemaAction } from "./schema-sqlite";

export class UpgradeSQLite_1_0_1 implements SchemaAction {

    action(client: WebSQLDatabase): Promise<void> {

        return new Promise<void>( (resolve, reject) => {
            client.exec([
                { sql: `UPDATE t_account_transaction_ats SET ats_amount = -ats_amount WHERE ats_type = 'OUTCOME' AND ats_amount > 0`, args: [] },

                { sql: `INSERT OR IGNORE INTO t_settings_set (set_name, set_value) VALUES ('version', '${DATABASE_VERSION}')`, args: []},
                { sql: `UPDATE t_settings_set
                    SET set_value = '${DATABASE_VERSION}'
                    WHERE set_name = 'version'`, args: [] },

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
                    console.log(`Database Upgrade ${DATABASE_VERSION} done`);
                    resolve();
                }
                
            });
        });

    }

}
