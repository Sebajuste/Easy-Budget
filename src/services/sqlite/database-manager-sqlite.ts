import * as SQLite from 'expo-sqlite';
import { DatabaseManager } from "../database-manager";

const SQLITE_VERSION = "1.0";
const DATABASE_NAME = "easy_budget.db";


// export let sqlite_client : SQLite.WebSQLDatabase;
/*
function OpenSQLite() {
    sqlite_client = SQLite.openDatabase('easy_budget.db', SQLITE_VERSION, "", 1, (db) => {
        new DatabaseManagerSQLite().init();
    });
}

OpenSQLite();
*/


export class DatabaseManagerSQLite extends DatabaseManager {

    private db: any;

    constructor(/*sqlite: SQLite.WebSQLDatabase | null*/) {
        super();
        this.open().then(db => {
            console.log('DB opened');
            this.init();
        }).catch(console.error);
    }

    public get client() : SQLite.WebSQLDatabase {
        return this.db;
    }

    public open() : Promise<void> {
        return new Promise((resolve, reject) => {
            SQLite.openDatabase(DATABASE_NAME, SQLITE_VERSION, "", 1, (db) => {
                this.db = db;
                console.log('Database opened');
                resolve();
            });
        });
    }

    close() {
        return this.db.closeAsync().then(() => {
            console.log('Database closed');
            this.db = null;
        });
    }

    public init(): Promise<void> {
        return new Promise((resolve, reject) => {

            this.client.exec([
                { sql: 'PRAGMA foreign_keys = ON;', args: [] },
    
                // { sql: 'DROP TABLE t_account_act', args: []},
                // { sql: 'DROP TABLE t_category_cat', args: []},
                // { sql: 'DROP TABLE t_envelope_evp', args: []},
                
                // { sql: 'DROP TABLE t_transaction_tst', args: []},

                // Envelopes
                { sql: `CREATE TABLE IF NOT EXISTS t_category_cat (
                    cat_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    cat_name TEXT NOT NULL,
                    cat_color TEXT NOT NULL,
                    cat_icon TEXT NOT NULL
                )`, args: [] },
                { sql: `CREATE TABLE IF NOT EXISTS t_envelope_evp (
                    evp_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    evp_name TEXT NOT NULL,
                    evp_current_amount DECIMAL(10,2) NOT NULL,
                    evp_due_date DATE NOT NULL,
                    evp_target_amount DECIMAL(10,2) NOT NULL,
                    evp_target_period TEXT NOT NULL,
                    evp_category_id INTEGER NOT NULL REFERENCES t_category_cat(cat_id)
                )`, args: []},
    
                { sql: `CREATE TRIGGER IF NOT EXISTS check_envelope_amount_insert
                    BEFORE INSERT
                    ON t_envelope_evp
                    FOR EACH ROW
                    BEGIN
                        SELECT
                            CASE
                                WHEN (SELECT SUM(evp_current_amount) FROM t_envelope_evp) > (SELECT SUM(act_balance) FROM t_account_act) THEN
                                    RAISE (ABORT, 'Total evp_current_amount must be less than total act_balance')
                            END;
                    END;`, args: []
                },
                { sql: `CREATE TRIGGER IF NOT EXISTS check_envelope_amount_update
                    BEFORE UPDATE
                    ON t_envelope_evp
                    FOR EACH ROW
                    BEGIN
                        SELECT
                            CASE
                                WHEN (SELECT SUM(evp_current_amount) FROM t_envelope_evp) > (SELECT SUM(act_balance) FROM t_account_act) THEN
                                    RAISE (ABORT, 'Total evp_current_amount must be less than total act_balance')
                            END;
                    END;`, args: []
                },
    
                { sql: `CREATE TRIGGER IF NOT EXISTS check_evp_target_period_insert
                BEFORE INSERT
                ON t_envelope_evp
                FOR EACH ROW
                BEGIN
                    SELECT
                        CASE
                            WHEN NEW.evp_target_period NOT IN ('MONTHLY', 'TRIMESTER', 'SEMESTER', 'YEARLY') THEN
                                RAISE (ABORT, 'evp_target_period must be MONTHLY, TRIMESTER, SEMESTER or YEARLY')
                        END;
                END;`, args: []},
                { sql: `CREATE TRIGGER IF NOT EXISTS check_evp_target_period_update
                BEFORE UPDATE
                ON t_envelope_evp
                FOR EACH ROW
                BEGIN
                    SELECT
                        CASE
                            WHEN NEW.evp_target_period NOT IN ('MONTHLY', 'TRIMESTER', 'SEMESTER', 'YEARLY') THEN
                                RAISE (ABORT, 'evp_target_period must be MONTHLY, TRIMESTER, SEMESTER or YEARLY')
                        END;
                END;`, args: []},
    
                // Accounts
                { sql: `CREATE TABLE IF NOT EXISTS t_account_act (
                    act_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    act_name TEXT NOT NULL,
                    act_balance DECIMAL(10,2) NOT NULL,
                    act_envelope_balance DECIMAL(10,2) NOT NULL,
                    act_created_at DATETIME DEFAULT (datetime('now'))
                )`, args: []},
                { sql: `CREATE TRIGGER IF NOT EXISTS check_act_envelope_balance_update
                    BEFORE UPDATE
                    ON t_account_act
                    FOR EACH ROW
                    BEGIN
                        SELECT CASE
                            WHEN NEW.act_envelope_balance < 0 THEN
                                RAISE(ABORT, 'act_envelope_balance cannot be below than 0')
                        END;
                    END;
                `, args: []},
    
                // Revenues
                { sql: `CREATE TABLE IF NOT EXISTS t_revenue_rev (
                    rev_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    rev_name TEXT NOT NULL UNIQUE,
                    rev_amount DECIMAL(10,2) NOT NULL
                )`, args: []},
                { sql: `CREATE TRIGGER IF NOT EXISTS check_rev_amount_insert
                    BEFORE INSERT
                    ON t_revenue_rev
                    FOR EACH ROW
                    BEGIN
                        SELECT CASE
                            WHEN NEW.rev_amount < 0 THEN
                                RAISE(ABORT, 'rev_amount cannot be below than 0')
                        END;
                    END;
                `, args: []},
                { sql: `CREATE TRIGGER IF NOT EXISTS check_rev_amount_update
                    BEFORE UPDATE
                    ON t_revenue_rev
                    FOR EACH ROW
                    BEGIN
                        SELECT CASE
                            WHEN NEW.rev_amount < 0 THEN
                                RAISE(ABORT, 'rev_amount cannot be below than 0')
                        END;
                    END;
                `, args: []},

                // Transactions
                { sql: `CREATE TABLE IF NOT EXISTS t_account_transaction_ats (
                    ats_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ats_name TEXT NOT NULL,
                    ats_amount DECIMAL(10,2) NOT NULL,
                    ats_date DATETIME DEFAULT (datetime('now')),
                    ats_reconciled BOOLEAN DEFAULT FALSE,
                    ats_envelope_id INTEGER REFERENCES t_envelope_evp(evp_id),
                    ats_account_id INTEGER NOT NULL REFERENCES t_account_act(act_id)
                )`, args: []},
                
                { sql: `CREATE TABLE IF NOT EXISTS t_envelopes_transaction_ets (
                    ets_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ets_name TEXT NOT NULL,
                    ets_amount DECIMAL(10,2) NOT NULL,
                    ets_date DATETIME DEFAULT (datetime('now')),
                    ets_envelope_id INTEGER NOT NULL REFERENCES t_envelope_evp(evp_id),
                    ets_account_id INTEGER NOT NULL REFERENCES t_account_act(act_id)
                )`, args: []},

                

                // Settings
                { sql: `CREATE TABLE IF NOT EXISTS t_settings_set (
                    set_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    set_name TEXT NOT NULL UNIQUE,
                    set_value TEXT NOT NULL
                )`,args: []}
                
            ], false, (err : any, resultSet) => {

                console.log(resultSet);
    
                if( err ) {
                    console.error('Database Init error', err);
                    reject(err);
                } else {

                    if( resultSet ) {
                        for(const item of resultSet) {
                            if( item.hasOwnProperty('error') ) {
                                const itemError = item as SQLite.ResultSetError;
                                // console.error(itemError.error);
                                reject(itemError.error);
                                return;
                            }
                        }
                    }


                    console.log('Database Init done');
                    resolve();
                }
                
            });
    
        });
    }

    public delete(): Promise<void> {

        return this.close().then( () => this.db.deleteAsync()).then(() => {
            console.log('Database removed');
            return this.open();
        });

    }
}

export const DB_MANAGER_SQLite = new DatabaseManagerSQLite();

export const sqlite_client = () : SQLite.WebSQLDatabase => {
    return DB_MANAGER_SQLite.client;
};
