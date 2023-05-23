import * as SQLite from 'expo-sqlite';
import { DATABASE_VERSION, SchemaAction } from './schema-sqlite';



const QUERIES = [
    {sql: `PRAGMA foreign_keys = ON;`, args: []},

    {sql: `CREATE TABLE IF NOT EXISTS t_account_acc (
        acc_id INTEGER PRIMARY KEY AUTOINCREMENT,
        acc_name VARCHAR(64) NOT NULL,
        acc_created_at DATETIME DEFAULT (datetime('now')),
        acc_description TEXT,
        acc_type VARCHAR(32) NOT NULL
      )`, args: []},
    {sql: `CREATE TABLE IF NOT EXISTS t_transaction_trn (
        trn_id INTEGER PRIMARY KEY AUTOINCREMENT,
        trn_date DATETIME NOT NULL DEFAULT (datetime('now')),
        trn_name VARCHAR(64)
      )`, args: []},
    {sql: `CREATE TABLE IF NOT EXISTS t_movement_mvt (
        mvt_id INTEGER PRIMARY KEY AUTOINCREMENT,
        mvt_debit DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
        mvt_credit DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
        mvt_transaction_id INTEGER NOT NULL REFERENCES t_transaction_trn(trn_id) ON DELETE CASCADE,
        mvt_account_id INTEGER NOT NULL REFERENCES t_account_acc(acc_id) ON DELETE CASCADE
      )`, args: []},
    {sql: `CREATE TABLE t_reconciliation_rec (
        rec_id INTEGER PRIMARY KEY AUTOINCREMENT,
        rec_mouvement_id INTEGER NOT NULL UNIQUE REFERENCES t_movement_mvt(mvt_id) ON DELETE CASCADE
    )`, args: []},
    {sql: `CREATE VIEW IF NOT EXISTS v_account_balance_abl AS
    SELECT
      acc.acc_id AS account_id,

      CASE WHEN mvt.mvt_account_id IS NULL THEN 0 ELSE mvt.mvt_debit - mvt.mvt_credit END as balance,
      0 as envelope_balance,
      CASE WHEN mvt_reconciled.mvt_account_id IS NULL THEN 0 ELSE mvt_reconciled.mvt_debit - mvt_reconciled.mvt_credit END as total_reconciled

    FROM t_account_acc AS acc
        LEFT JOIN (
            SELECT mvt_account_id, SUM(mvt_debit) as mvt_debit, SUM(mvt_credit) as mvt_credit
            FROM t_movement_mvt
            GROUP BY mvt_account_id
        ) as mvt
            ON mvt.mvt_account_id = acc_id
        LEFT JOIN (
            SELECT mvt_account_id, SUM(mvt_debit) as mvt_debit, SUM(mvt_credit) as mvt_credit
            FROM t_movement_mvt
                INNER JOIN t_reconciliation_rec
                    ON rec_mouvement_id = mvt_id
            GROUP BY mvt_account_id
        ) as mvt_reconciled
            ON mvt_reconciled.mvt_account_id = acc_id

    GROUP BY acc.acc_id`, args: []},

    {sql: `CREATE TABLE IF NOT EXISTS t_income_inc (
        inc_id INTEGER PRIMARY KEY AUTOINCREMENT,
        inc_amount DECIMAL(10, 2) NOT NULL,
        inc_expect_date DATE NOT NULL,
        inc_account_id INTEGER NOT NULL REFERENCES t_account_acc(acc_id)
      )`, args: []},
      /*
    {sql: `CREATE TABLE IF NOT EXISTS t_bank_account_bnk (
        bnk_id INTEGER PRIMARY KEY AUTOINCREMENT,
        bnk_name TEXT NOT NULL,
        bnk_description TEXT,
        bnk_account_id INTEGER NOT NULL REFERENCES t_account_acc(acc_id)
      )`, args: []},
      */
    {sql: `CREATE TABLE IF NOT EXISTS t_category_cat (
        cat_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cat_color TEXT NOT NULL,
        cat_icon TEXT NOT NULL,
        cat_account_id INTEGER NOT NULL REFERENCES t_account_acc(acc_id)
      )`, args: []},
    {sql: `CREATE TABLE IF NOT EXISTS t_envelope_evp (
        evp_id INTEGER PRIMARY KEY AUTOINCREMENT,
        evp_due_date DATE NOT NULL,
        evp_target_amount DECIMAL(10,2) NOT NULL,
        evp_target_period VARCHAR(16) NOT NULL,
        evp_category_id INTEGER NOT NULL REFERENCES t_category_cat(cat_id),
        evp_account_id INTEGER NOT NULL REFERENCES t_account_acc(acc_id)
      )`, args: []},
    {sql: `CREATE TABLE IF NOT EXISTS t_settings_set (
        set_id INTEGER PRIMARY KEY AUTOINCREMENT,
        set_name TEXT NOT NULL UNIQUE,
        set_value TEXT NOT NULL
      )`, args: []},


    {sql: `INSERT INTO t_account_acc (acc_name, acc_description, acc_type) VALUES ('Capital', '', 'Capital')`, args: []},
    {sql: `INSERT INTO t_account_acc (acc_name, acc_description, acc_type) VALUES ('Budget Used', '', 'Budget_Used')`, args: []},

    {sql: `INSERT OR IGNORE INTO t_settings_set (set_name, set_value)
        SELECT 'version', '1.0.0'
         WHERE NOT EXISTS (SELECT * FROM t_settings_set WHERE set_name = 'version')
    `, args: []},


    {sql: `INSERT INTO t_account_acc (acc_name, acc_type)
        SELECT 'Habitation' as acc_name, 'Category' as acc_type
        WHERE NOT EXISTS (SELECT * FROM t_account_acc WHERE acc_name = 'Habitation' AND acc_type = 'Category')
    `, args: []},
    {sql: `INSERT INTO t_category_cat (cat_color, cat_icon, cat_account_id )
        SELECT 'purple' as cat_color, 'home' as cat_icon, acc_id
        FROM t_account_acc
        WHERE acc_name = 'Habitation' AND NOT EXISTS (SELECT * FROM t_category_cat INNER JOIN t_account_acc ON acc_id = cat_account_id WHERE acc_name = 'Habitation')
    `, args: []},

    {sql: `INSERT INTO t_account_acc (acc_name, acc_type)
        SELECT 'Alimentation' as acc_name, 'Category' as acc_type
        WHERE NOT EXISTS (SELECT * FROM t_account_acc WHERE acc_name = 'Alimentation' AND acc_type = 'Category')
    `, args: []},
    {sql: `INSERT INTO t_category_cat (cat_color, cat_icon, cat_account_id )
        SELECT 'yellow' as cat_color, 'spoon' as cat_icon, acc_id
        FROM t_account_acc
        WHERE acc_name = 'Alimentation' AND NOT EXISTS (SELECT * FROM t_category_cat INNER JOIN t_account_acc ON acc_id = cat_account_id WHERE acc_name = 'Alimentation')
    `, args: []},

    {sql: `INSERT INTO t_account_acc (acc_name, acc_type)
        SELECT 'Loisirs' as acc_name, 'Category' as acc_type
        WHERE NOT EXISTS (SELECT * FROM t_account_acc WHERE acc_name = 'Loisirs' AND acc_type = 'Category')
    `, args: []},
    {sql: `INSERT INTO t_category_cat (cat_color, cat_icon, cat_account_id )
        SELECT 'cyan' as cat_color, 'beer' as cat_icon, acc_id
        FROM t_account_acc
        WHERE acc_name = 'Loisirs' AND NOT EXISTS (SELECT * FROM t_category_cat INNER JOIN t_account_acc ON acc_id = cat_account_id WHERE acc_name = 'Loisirs')
    `, args: []},

    {sql: `INSERT INTO t_account_acc (acc_name, acc_type)
        SELECT 'Banque' as acc_name, 'Category' as acc_type
        WHERE NOT EXISTS (SELECT * FROM t_account_acc WHERE acc_name = 'Banque' AND acc_type = 'Category')
    `, args: []},
    {sql: `INSERT INTO t_category_cat (cat_color, cat_icon, cat_account_id )
        SELECT 'orange' as cat_color, 'bank' as cat_icon, acc_id
        FROM t_account_acc
        WHERE acc_name = 'Banque' AND NOT EXISTS (SELECT * FROM t_category_cat INNER JOIN t_account_acc ON acc_id = cat_account_id WHERE acc_name = 'Banque')
    `, args: []},

    {sql: `INSERT INTO t_account_acc (acc_name, acc_type)
        SELECT 'Achats & Shopping' as acc_name, 'Category' as acc_type
        WHERE NOT EXISTS (SELECT * FROM t_account_acc WHERE acc_name = 'Achats & Shopping' AND acc_type = 'Category')
    `, args: []},
    {sql: `INSERT INTO t_category_cat (cat_color, cat_icon, cat_account_id )
        SELECT 'green' as cat_color, 'shopping-cart' as cat_icon, acc_id
        FROM t_account_acc
        WHERE acc_name = 'Achats & Shopping' AND NOT EXISTS (SELECT * FROM t_category_cat INNER JOIN t_account_acc ON acc_id = cat_account_id WHERE acc_name = 'Achats & Shopping')
    `, args: []},

    {sql: `INSERT INTO t_account_acc (acc_name, acc_type)
        SELECT 'Transport' as acc_name, 'Category' as acc_type
        WHERE NOT EXISTS (SELECT * FROM t_account_acc WHERE acc_name = 'Transport' AND acc_type = 'Category')
    `, args: []},
    {sql: `INSERT INTO t_category_cat (cat_color, cat_icon, cat_account_id )
        SELECT 'blue' as cat_color, 'car' as cat_icon, acc_id
        FROM t_account_acc
        WHERE acc_name = 'Transport' AND NOT EXISTS (SELECT * FROM t_category_cat INNER JOIN t_account_acc ON acc_id = cat_account_id WHERE acc_name = 'Transport')
    `, args: []},

    {sql: `INSERT INTO t_account_acc (acc_name, acc_type)
        SELECT 'Santé' as acc_name, 'Category' as acc_type
        WHERE NOT EXISTS (SELECT * FROM t_account_acc WHERE acc_name = 'Santé' AND acc_type = 'Category')
    `, args: []},
    {sql: `INSERT INTO t_category_cat (cat_color, cat_icon, cat_account_id )
        SELECT 'red' as cat_color, 'heart' as cat_icon, acc_id
        FROM t_account_acc
        WHERE acc_name = 'Santé' AND NOT EXISTS (SELECT * FROM t_category_cat INNER JOIN t_account_acc ON acc_id = cat_account_id WHERE acc_name = 'Santé')
    `, args: []},

    {sql: `INSERT INTO t_account_acc (acc_name, acc_type)
        SELECT 'Autres' as acc_name, 'Category' as acc_type
        WHERE NOT EXISTS (SELECT * FROM t_account_acc WHERE acc_name = 'Autres' AND acc_type = 'Category')
    `, args: []},
    {sql: `INSERT INTO t_category_cat (cat_color, cat_icon, cat_account_id )
        SELECT 'grey' as cat_color, 'home' as cat_icon, acc_id
        FROM t_account_acc
        WHERE acc_name = 'Autres' AND NOT EXISTS (SELECT * FROM t_category_cat INNER JOIN t_account_acc ON acc_id = cat_account_id WHERE acc_name = 'Autres')
    `, args: []},
    
];


export class InstallSQLite implements SchemaAction {

    action(client: SQLite.WebSQLDatabase): Promise<void> {
        
        return new Promise<void>( (resolve, reject) => {

            client.exec(QUERIES, false, (err : any, resultSet) => {

                if( err ) {
                    console.error('Database Init error', err); 
                    reject(err);
                } else {
                    console.log('resultSet: ', resultSet)
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

/*
export class InstallSQLiteOld implements SchemaAction {

    action(client: SQLite.WebSQLDatabase): Promise<void> {
        
        return new Promise<void>( (resolve, reject) => {

            client.exec([
                { sql: 'PRAGMA foreign_keys = ON;', args: [] },
    
                // Envelopes
                { sql: `CREATE TABLE IF NOT EXISTS t_category_cat (
                    cat_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    cat_name TEXT NOT NULL UNIQUE,
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
                                WHEN (SELECT SUM(evp_current_amount) FROM t_envelope_evp) > (SELECT SUM(act_balance) FROM t_account_act) 
                                    OR NEW.evp_current_amount < 0
                                THEN
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
                                WHEN (SELECT SUM(evp_current_amount) FROM t_envelope_evp) > (SELECT SUM(act_balance) FROM t_account_act)
                                    OR NEW.evp_current_amount < 0
                                THEN
                                    RAISE (ABORT, 'Total evp_current_amount must be less than total act_balance')
                            END;
                    END;`, args: []
                },
                { sql: `CREATE TRIGGER IF NOT EXISTS check_envelope_amount_delete
                    BEFORE DELETE
                    ON t_envelope_evp
                    FOR EACH ROW
                    BEGIN
                        SELECT
                            CASE
                                WHEN OLD.evp_current_amount > 0
                                THEN
                                    RAISE (ABORT, 'Cannot be deleted when evp_current_amount is not equals to 0')
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
                    rev_amount DECIMAL(10,2) NOT NULL,
                    rev_expect_date DATE NOT NULL
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
                    ats_type TEXT NOT NULL,
                    ats_amount DECIMAL(10,2) NOT NULL,
                    ats_date DATETIME DEFAULT (datetime('now')),
                    ats_reconciled BOOLEAN DEFAULT FALSE,
                    ats_category_id INTEGER CONSTRAINT "fk__ats_category_id" REFERENCES t_category_cat(cat_id) ON DELETE SET NULL DEFAULT NULL,
                    ats_envelope_id INTEGER CONSTRAINT "fk__ats_envelope_id" REFERENCES t_envelope_evp(evp_id) ON DELETE SET NULL DEFAULT NULL,
                    ats_account_id INTEGER NOT NULL CONSTRAINT "fk__ats_account_id" REFERENCES t_account_act(act_id) ON DELETE CASCADE
                )`, args: []},
                { sql: `CREATE TRIGGER IF NOT EXISTS check_ats_type_insert
                    BEFORE INSERT
                    ON t_account_transaction_ats
                    FOR EACH ROW
                    BEGIN
                        SELECT 
                            CASE
                                WHEN NEW.ats_type NOT IN ('INCOME', 'OUTCOME') THEN
                                    RAISE (ABORT, 'ats_type must be INCOME or OUTCOME')
                            END;
                    END;
                `, args: []},
                { sql: `CREATE TRIGGER IF NOT EXISTS check_ats_type_update
                BEFORE UPDATE
                ON t_account_transaction_ats
                FOR EACH ROW
                BEGIN
                    SELECT 
                        CASE
                            WHEN NEW.ats_type NOT IN ('INCOME', 'OUTCOME') THEN
                                RAISE (ABORT, 'ats_type must be INCOME or OUTCOME')
                        END;
                END;`, args: []},
                
                { sql: `CREATE TABLE IF NOT EXISTS t_envelopes_transaction_ets (
                    ets_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ets_name TEXT NOT NULL,
                    ets_amount DECIMAL(10,2) NOT NULL,
                    ets_date DATETIME DEFAULT (datetime('now')),
                    ets_envelope_id INTEGER NOT NULL CONSTRAINT "fk__ets_envelope_id" REFERENCES t_envelope_evp(evp_id) ON DELETE CASCADE,
                    ets_account_id INTEGER NOT NULL CONSTRAINT "fk__ets_account_id" REFERENCES t_account_act(act_id) ON DELETE CASCADE
                )`, args: []},

                { sql: `CREATE TABLE IF NOT EXISTS tj_envelope_transaction_evt (
                    evt_envelope_id INTEGER NOT NULL REFERENCES t_envelope_evp(evp_id) ON DELETE CASCADE,
                    evt_transaction_id INTEGER NOT NULL t_account_transaction_ats(ats_id) ON DELETE CASCADE,
                    PRIMARY KEY(evt_envelope_id, evt_transaction_id)
                )`, args: []},
    
                // Settings
                { sql: `CREATE TABLE IF NOT EXISTS t_settings_set (
                    set_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    set_name TEXT NOT NULL UNIQUE,
                    set_value TEXT NOT NULL
                )`,args: []},
    
                { sql: `INSERT OR IGNORE INTO t_settings_set (set_name, set_value)
                    SELECT 'version', '${DATABASE_VERSION}'
                    WHERE NOT EXISTS (SELECT * FROM t_settings_set WHERE set_name = 'version')
                `, args: []},
    
                // Default categories
                {sql: `INSERT INTO t_category_cat (cat_name, cat_color, cat_icon )
                    SELECT 'Habitation' as cat_name, 'purple' as cat_color, 'home' as cat_icon
                    WHERE NOT EXISTS (SELECT * FROM t_category_cat WHERE cat_name = 'Habitation')
                `,
                args: []},
                {sql: `INSERT INTO t_category_cat (cat_name, cat_color, cat_icon )
                    SELECT 'Alimentation' as cat_name, 'yellow' as cat_color, 'spoon' as cat_icon
                    WHERE NOT EXISTS (SELECT * FROM t_category_cat WHERE cat_name = 'Alimentation')
                `,
                args: []},
                {sql: `INSERT INTO t_category_cat (cat_name, cat_color, cat_icon )
                    SELECT 'Loisirs' as cat_name, 'cyan' as cat_color, 'beer' as cat_icon
                    WHERE NOT EXISTS (SELECT * FROM t_category_cat WHERE cat_name = 'Loisirs')
                `,
                args: []},
                {sql: `INSERT INTO t_category_cat (cat_name, cat_color, cat_icon )
                    SELECT 'Banque' as cat_name, 'orange' as cat_color, 'bank' as cat_icon
                    WHERE NOT EXISTS (SELECT * FROM t_category_cat WHERE cat_name = 'Banque')
                `,
                args: []},
                {sql: `INSERT INTO t_category_cat (cat_name, cat_color, cat_icon )
                    SELECT 'Achats & Shopping' as cat_name, 'red' as cat_color, 'shopping-cart' as cat_icon
                    WHERE NOT EXISTS (SELECT * FROM t_category_cat WHERE cat_name = 'Achats & Shopping')
                `,
                args: []},
                {sql: `INSERT INTO t_category_cat (cat_name, cat_color, cat_icon )
                    SELECT 'Transport' as cat_name, 'blue' as cat_color, 'car' as cat_icon
                    WHERE NOT EXISTS (SELECT * FROM t_category_cat WHERE cat_name = 'Transport')
                `,
                args: []},
                {sql: `INSERT INTO t_category_cat (cat_name, cat_color, cat_icon )
                    SELECT 'Santé' as cat_name, 'green' as cat_color, 'heart' as cat_icon
                    WHERE NOT EXISTS (SELECT * FROM t_category_cat WHERE cat_name = 'Santé')
                `,
                args: []},
                {sql: `INSERT INTO t_category_cat (cat_name, cat_color, cat_icon )
                    SELECT 'Autres' as cat_name, 'grey' as cat_color, 'home' as cat_icon
                    WHERE NOT EXISTS (SELECT * FROM t_category_cat WHERE cat_name = 'Autres')
                `,
                args: []}
                
                
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
*/
