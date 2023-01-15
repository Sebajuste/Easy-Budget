import SQLite from 'expo-sqlite';
import { AccountDao } from '../account';
import { SettingsDaoStorage } from '../async_storage/settings_async_storage';
import { DatabaseManager } from '../dao-manager';
import { EnvelopeCategoryDao, EnvelopeDao } from '../envelope';
import { SettingsDao } from '../settings';
import { AccountDaoSQLite } from './account-sqlite';
import { EnvelopeCategorySQLiteDao, EnvelopeSQLiteDao } from './envelope-sqlite';

const SQLITE_VERSION = "1.0";

// const db = SQLite.openDatabase('easy_budget', SQLITE_VERSION, "", 1, (db) => {});

export const sqlite_client = null;



class DatabaseManagerSQLite extends DatabaseManager {

    private db: any;

    constructor(sqlite: SQLite.WebSQLDatabase | null) {
        super();
        this.db = sqlite;
    }

    init(): Promise<void> {
        return new Promise((resolve, reject) => {

            this.db.exec([
                { sql: 'PRAGMA foreign_keys = ON;', args: [] },
    
                { sql: 'DROP TABLE t_account_act', args: []},
                { sql: 'DROP TABLE t_category_cat', args: []},
                { sql: 'DROP TABLE t_envelope_evp', args: []},
                
                { sql: 'DROP TABLE t_transaction_tst', args: []},
    
                // Accounts
                { sql: `CREATE TABLE t_account_act (
                    act_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    act_name TEXT NOT NULL,
                    act_balance DECIMAL(10,2) NOT NULL,
                    act_envelope_balance DECIMAL(10,2) NOT NULL,
                    act_created_at DATETIME DEFAULT (datetime('now'))
                )`, args: []},
    
                { sql: `CREATE TABLE t_account_transaction_ats (
                    ats_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ats_name TEXT NOT NULL,
                    ats_amount DECIMAL(10,2) NOT NULL,
                    ats_envelope_id INTEGER,
                    ats_account_id INTEGER NOT NULL,
                    ats_date DATETIME DEFAULT (datetime('now')),
                    ats_reconciled BOOLEAN DEFAULT FALSE,
                    FOREIGN KEY(ats_envelope_id) REFERENCES t_envelopes_evp(evp_id),
                    FOREIGN KEY(ats_account_id) REFERENCES t_account_act(act_id)
                )`, args: []},
                
    
                // Envelopes
                { sql: `CREATE TABLE IF NOT EXISTS t_category_cat (
                    cat_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    cat_name TEXT NOT NULL,
                    cat_color TEXT NOT NULL
                )`, args: [] },
                { sql: `CREATE TABLE t_envelopes_evp (
                    evp_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    evp_name TEXT NOT NULL,
                    evp_current_amount DECIMAL(10,2) NOT NULL,
                    evp_due_date DATE NOT NULL,
                    evp_target_amount DECIMAL(10,2) NOT NULL,
                    evp_target_period TEXT NOT NULL,
                    evp_category_id INTEGER NOT NULL,
                    FOREIGN KEY(evp_category_id) REFERENCE t_category_cat(cat_id)
                )`, args: []},
    
                { sql: `CREATE TRIGGER check_envelope_amount
                    BEFORE INSERT OR UPDATE ON t_envelopes_evp
                    FOR EACH ROW
                    BEGIN
                        SELECT
                            CASE
                                WHEN (SELECT SUM(evp_current_amount) FROM t_envelopes_evp) > (SELECT SUM(act_balance) FROM t_account_act) THEN
                                    RAISE (ABORT, 'Total evp_current_amount must be less than total act_balance')
                            END;
                    END;`, args: []
                },
    
                { sql: `CREATE TRIGGER check_evp_target_period
                BEFORE INSERT OR UPDATE ON t_envelopes_evp
                FOR EACH ROW
                BEGIN
                    SELECT
                        CASE
                            WHEN NEW.evp_target_period NOT IN ('MONTHLY', 'TRIMESTER', 'SEMESTER', 'YEARLY') THEN
                                RAISE (ABORT, 'evp_target_period must be MONTHLY, TRIMESTER, SEMESTER or YEARLY')
                        END;
                END;`, args: []},
    
                { sql: `CREATE TABLE t_envelopes_transaction_ets (
                    ets_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ats_name TEXT NOT NULL,
                    ats_amount DECIMAL(10,2) NOT NULL,
                    ats_envelope_id INTEGER NOT NULL,
                    ats_account_id INTEGER NOT NULL,
                    ats_date DATETIME DEFAULT (datetime('now')),
                    FOREIGN KEY(ats_envelope_id) REFERENCES t_envelopes_evp(evp_id),
                    FOREIGN KEY(ats_account_id) REFERENCES t_account_act(act_id)
                )`, args: []},
    
                
            ], false, (err : any) => {
    
                console.log('Init database done');
    
                if( err ) {
                    reject(err);
                } else {
                    resolve();
                }
                
            });
    
        });
    }

    delete(): Promise<void> {
        return this.db.deleteAsync();
    }
}

export const SQLITE_DAO = {
    [DatabaseManager.name]: new DatabaseManagerSQLite(null),
    [AccountDao.name]: new AccountDaoSQLite(),
    [EnvelopeCategoryDao.name]: new EnvelopeCategorySQLiteDao(),
    [EnvelopeDao.name]: new EnvelopeSQLiteDao(),
    [SettingsDao.name]: new SettingsDaoStorage(),
    // [TransactionDao.name]: new TransactionDaoStorage()

};


