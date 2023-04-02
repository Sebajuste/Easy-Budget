import * as SQLite from 'expo-sqlite';
import { WebSQLDatabase } from "expo-sqlite";

import { DATABASE_VERSION, SchemaAction } from "./schema-sqlite";

export class UpgradeSQLite_1_0_0 implements SchemaAction {

    action(client: WebSQLDatabase): Promise<void> {
        
        return new Promise<void>( (resolve, reject) => {

            client.exec([

                { sql: `ALTER TABLE t_envelopes_transaction_ets RENAME TO t_envelopes_transaction_ets_backup`, args: [] },
                { sql: `CREATE TABLE IF NOT EXISTS t_envelopes_transaction_ets (
                    ets_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ets_name TEXT NOT NULL,
                    ets_amount DECIMAL(10,2) NOT NULL,
                    ets_date DATETIME DEFAULT (datetime('now')),
                    ets_envelope_id INTEGER NOT NULL CONSTRAINT "fk__ets_envelope_id" REFERENCES t_envelope_evp(evp_id) ON DELETE CASCADE,
                    ets_account_id INTEGER NOT NULL CONSTRAINT "fk__ets_account_id" REFERENCES t_account_act(act_id) ON DELETE CASCADE
                )`, args: []},
                {sql: `INSERT INTO t_envelopes_transaction_ets
                    SELECT ets_id, ets_name, ets_amount, ets_date, ets_envelope_id, ets_account_id
                    FROM t_envelopes_transaction_ets_backup;`, args: []},
                { sql: `DROP TABLE t_envelopes_transaction_ets_backup`, args: [] },


                { sql: `ALTER TABLE t_account_transaction_ats RENAME TO t_account_transaction_ats_backup`, args: [] },
                { sql: `CREATE TABLE IF NOT EXISTS t_account_transaction_ats (
                    ats_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ats_name TEXT NOT NULL,
                    ats_type TEXT NOT NULL,
                    ats_amount DECIMAL(10,2) NOT NULL,
                    ats_date DATETIME DEFAULT (datetime('now')),
                    ats_reconciled BOOLEAN DEFAULT FALSE,
                    ats_category_id INTEGER CONSTRAINT "fk__ats_category_id" REFERENCES t_category_cat(cat_id) ON DELETE SET NULL DEFAULT NULL,
                    ats_envelope_id INTEGER CONSTRAINT "fk__ats_envelope_id" REFERENCES t_envelope_evp(evp_id) ON DELETE SET NULL DEFAULT NULL,
                    ats_account_id INTEGER NOT NULL CONSTRAINT "fk__ats_account_id" REFERENCES t_account_act(act_id) ON DELETE CASCADE
                )`, args: []},
                {sql: `INSERT INTO t_account_transaction_ats (ats_id, ats_name, ats_type, ats_amount, ats_date, ats_reconciled, ats_category_id, ats_envelope_id, ats_account_id)
                    SELECT ats_id, ats_name, ats_type, ats_amount, ats_date, ats_reconciled, cat_id, ats_envelope_id, ats_account_id
                    FROM t_account_transaction_ats_backup
                        LEFT OUTER JOIN t_envelope_evp
                            ON evp_id = ats_envelope_id
                        LEFT OUTER JOIN t_category_cat
                            ON cat_id = evp_category_id`, args: []},
                { sql: `DROP TABLE t_account_transaction_ats_backup`, args: [] },

                { sql: `INSERT OR IGNORE INTO t_settings_set (set_name, set_value) VALUES ('version', '${DATABASE_VERSION}')`, args: []},

                { sql: `UPDATE t_account_transaction_ats SET ats_amount = -ats_amount WHERE ats_type = 'OUTCOME' AND ats_amount > 0`, args: [] },

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