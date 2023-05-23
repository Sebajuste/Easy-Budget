import * as SQLite from 'expo-sqlite';
import { WebSQLDatabase } from "expo-sqlite";

import { DATABASE_VERSION, SchemaAction } from "./schema-sqlite";

/*
-- Create the "t_account_acc" table
CREATE TABLE t_account_acc (
    acc_id INTEGER PRIMARY KEY AUTOINCREMENT,
    acc_name VARCHAR(50) NOT NULL,
    acc_description VARCHAR(100),
    acc_type VARCHAR(20) NOT NULL
);

-- Create the "t_transaction_trn" table
CREATE TABLE t_transaction_trn (
    trn_id INTEGER PRIMARY KEY AUTOINCREMENT,
    trn_date DATE NOT NULL,
    trn_description VARCHAR(100)
);

-- Create the "t_movement_mvt" table
CREATE TABLE t_movement_mvt (
    mvt_id INTEGER PRIMARY KEY AUTOINCREMENT,
	mvt_transaction_id INTEGER NOT NULL,
    mvt_account_id INTEGER NOT NULL,
    mvt_debit DECIMAL(10, 2) NOT NULL,
    mvt_credit DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (mvt_transaction_id) REFERENCES t_transaction_trn(trn_id),
    FOREIGN KEY (mvt_account_id) REFERENCES t_account_acc(acc_id)
);


-- Create the trigger
CREATE TRIGGER tr_check_transaction_balance
BEFORE INSERT ON t_transaction_trn
FOR EACH ROW
BEGIN
    DECLARE debit_total DECIMAL(10, 2);
    DECLARE credit_total DECIMAL(10, 2);

    -- Calculate the total debit for the new transaction
    SELECT SUM(mvt_debit) INTO debit_total
    FROM t_movement_mvt
    WHERE mvt_trn_id = NEW.trn_id;

    -- Calculate the total credit for the new transaction
    SELECT SUM(mvt_credit) INTO credit_total
    FROM t_movement_mvt
    WHERE mvt_trn_id = NEW.trn_id;

    -- Check if the debit total is equal to the credit total
    IF debit_total != credit_total THEN
        -- Raise an error and prevent the transaction insertion
        SELECT RAISE(ABORT, 'The debit total is not equal to the credit total.');
    END IF;
END;



-- Create the "Balances" view
CREATE VIEW Balances AS
SELECT account_id, SUM(debit) - SUM(credit) AS balance
FROM Movements
GROUP BY account_id;


-- Create the "t_bank_account_bnk" table
CREATE TABLE t_bank_account_bnk (
    bnk_id INTEGER PRIMARY KEY AUTOINCREMENT,
    bnk_account_id INTEGER NOT NULL,
    bnk_name VARCHAR(50) NOT NULL,
    bnk_description VARCHAR(100),
    FOREIGN KEY (bnk_acc_acc_id) REFERENCES t_account_acc(acc_id)
);

-- Create the "t_envelope_env" table
CREATE TABLE t_envelope_evp (
    evp_id INTEGER PRIMARY KEY AUTOINCREMENT,
    evp_account_id INTEGER NOT NULL,
    evp_name VARCHAR(50) NOT NULL,
    evp_description VARCHAR(100),
    FOREIGN KEY (env_acc_acc_id) REFERENCES t_account_acc(acc_id)
);

-- Create the "t_category_cat" table
CREATE TABLE t_category_cat (
    cat_id INTEGER PRIMARY KEY AUTOINCREMENT,
    cat_account_id INTEGER NOT NULL,
    cat_name VARCHAR(50) NOT NULL,
    cat_description VARCHAR(100),
    FOREIGN KEY (cat_acc_acc_id) REFERENCES t_account_acc(acc_id)
);

-- Create the trigger for "t_bank_account_bnk"
CREATE TRIGGER tr_insert_account_bnk
AFTER INSERT ON t_bank_account_bnk
FOR EACH ROW
BEGIN
    INSERT INTO t_account_acc (acc_name, acc_description, acc_type)
    VALUES (NEW.bnk_name, NEW.bnk_description, 'Bank Account');
END;

-- Create the trigger for "t_envelope_evp"
CREATE TRIGGER tr_insert_account_evp
AFTER INSERT ON t_envelope_evp
FOR EACH ROW
BEGIN
    INSERT INTO t_account_acc (acc_name, acc_description, acc_type)
    VALUES (NEW.evp_name, NEW.evp_description, 'Envelope');
END;

-- Create the trigger for "t_category_cat"
CREATE TRIGGER tr_insert_account_cat
AFTER INSERT ON t_category_cat
FOR EACH ROW
BEGIN
    INSERT INTO t_account_acc (acc_name, acc_description, acc_type)
    VALUES (NEW.cat_name, NEW.cat_description, 'Category');
END;

*/


export class UpgradeSQLite_1_0_2 implements SchemaAction {

    action(client: WebSQLDatabase): Promise<void> {

        return new Promise<void>( (resolve, reject) => {
            client.exec([

                // Create new transaction system
                { sql: `CREATE TABLE IF NOT EXISTS t_account_acc (
                    acc_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    acc_name VARCHAR(50) NOT NULL,
                    acc_description TEXT,
                    acc_type VARCHAR(20) NOT NULL
                )`, args: [] },

                { sql: `CREATE TABLE IF NOT EXISTS t_transaction_trn (
                    trn_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    trn_date DATETIME NOT NULL DEFAULT (datetime('now')),
                    trn_name TEXT NOT NULL
                )`, args: [] },

                { sql: `CREATE TABLE IF NOT EXISTS t_movement_mvt (
                    mvt_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    mvt_transaction_id INTEGER NOT NULL,
                    mvt_account_id INTEGER NOT NULL,
                    mvt_debit DECIMAL(10, 2) NOT NULL,
                    mvt_credit DECIMAL(10, 2) NOT NULL,
                    FOREIGN KEY (mvt_transaction_id) REFERENCES t_transaction_trn(trn_id) ON DELETE CASCADE,
                    FOREIGN KEY (mvt_account_id) REFERENCES t_account_acc(acc_id)
                )`, args: [] },
                { sql: `CREATE TABLE IF NOT EXISTS t_reconciliation_rec (
                    rec_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    rec_movement_id INTEGER NOT NULL REFERENCES t_movement_mvt(mvt_id) ON DELETE CASCADE
                );`, args: []},

                { sql: `CREATE VIEW IF NOT EXISTS v_account_balance_abl AS
                    SELECT
                        acc.acc_id AS account_id,
                        acc.acc_name AS account_name,
                        SUM(mvt.mvt_debit) AS total_debit,
                        SUM(mvt.mvt_credit) AS total_credit,
                        SUM(mvt.mvt_debit) - SUM(mvt.mvt_credit) AS total_balance,
                        SUM(mvt_reconciled.mvt_debit) AS total_debit_reconciled,
                        SUM(mvt_reconciled.mvt_credit) AS total_credit_reconciled,
                        SUM(mvt_reconciled.mvt_debit) - SUM(mvt_reconciled.mvt_credit) AS total_balance_reconciled,
                    FROM t_account_acc AS acc
                        LEFT JOIN t_movement_mvt AS mvt ON mvt.mvt_account_id = acc.acc_id
                        LEFT JOIN (
                            SELECT
                                mvt_account_id,
                                mvt_debit,
                                mvt_credit,
                            FROM t_reconciliation_rec
                                INNER JOIN t_movement_mvt ON mvt_id = rec_movement_id
                        ) as mvt_reconciled ON mvt_reconciled.mvt_account_id = acc.acc_id
                    GROUP BY acc.acc_id, acc.acc_name
                `, args: [] },

                // 
                // Create tables for user help, using transaction system
                //

                // Bank
                { sql: `CREATE TABLE IF NOT EXISTS t_bank_account_bnk (
                    bnk_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    bnk_name TEXT NOT NULL,
                    bnk_description TEXT,
                    bnk_account_id INTEGER NOT NULL REFERENCES t_account_acc(acc_id)
                )`, args: [] },
                { sql: `CREATE TRIGGER IF NOT EXISTS tr_insert_bank_accoun_bnk
                    AFTER INSERT ON t_bank_account_bnk
                    FOR EACH ROW
                    BEGIN
                        INSERT INTO t_account_acc (acc_name, acc_description, acc_type)
                        VALUES (NEW.bnk_name, NEW.bnk_description, 'Bank_Account');

                        UPDATE t_bank_account_bnk
                        SET bnk_account_id = (SELECT acc_id FROM t_account_acc ORDER BY acc_id DESC LIMIT 1)
                        WHERE bnk_id = NEW.cat_id;
                    END
                `, args: [] },
                { sql: `CREATE TABLE IF NOT EXISTED`, args: [] },

                // Categories
                { sql: `ALTER TABLE t_category_cat RENAME TO t_category_cat_backup`, args: [] },
                { sql: `CREATE TABLE IF NOT EXISTS t_category_cat (
                    cat_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    cat_name TEXT NOT NULL,
                    cat_color TEXT NOT NULL,
                    cat_icon TEXT NOT NULL,
                    cat_description TEXT,
                    cat_account_id INTEGER NOT NULL REFERENCES t_account_acc(acc_id)
                )`, args: [] },
                { sql: `CREATE TRIGGER IF NOT EXISTS tr_insert_category_cat
                    AFTER INSERT ON t_category_cat
                    FOR EACH ROW
                    BEGIN
                        -- Insert a new entry in "t_account_acc"
                        INSERT INTO t_account_acc (acc_name, acc_description, acc_type)
                        VALUES (NEW.cat_name, NEW.cat_description, 'Category');
                    
                        -- Get the id of the newly inserted entry in "t_account_acc"
                        -- and update the foreign key in "t_category_cat"
                        UPDATE t_category_cat
                        SET cat_account_id = (SELECT acc_id FROM t_account_acc ORDER BY acc_id DESC LIMIT 1)
                        WHERE cat_id = NEW.cat_id;
                    END
                `, args: [] },
                { sql: `INSERT INTO t_category_cat (cat_name, cat_color, cat_icon, cat_description)
                    SELECT cat_name, cat_color, cat_icon, '' as cat_description
                    FROM t_category_cat_backup
                `, args: [] },
                { sql: `DROP TABLE t_category_cat_backup`, args: [] },

                // Envelopes
                { sql: `ALTER TABLE t_envelope_evp RENAME TO t_envelope_evp_backup`, args: [] },
                { sql: `CREATE TABLE IF NOT EXISTS t_envelope_evp (
                    evp_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    evp_name TEXT NOT NULL,
                    evp_due_date DATE NOT NULL,
                    evp_target_amount DECIMAL(10,2) NOT NULL,
                    evp_target_period TEXT NOT NULL,
                    evp_description TEXT,
                    evp_category_id INTEGER NOT NULL REFERENCES t_category_cat(cat_id),
                    evp_account_id INTEGER NOT NULL REFERENCES t_account_acc(acc_id)
                )`, args: [] },
                { sql: `CREATE TRIGGER IF NOT EXISTS tr_insert_envelope_evp
                    AFTER INSERT ON t_envelope_evp
                    FOR EACH ROW
                    BEGIN
                        INSERT INTO t_account_acc (acc_name, acc_description, acc_type)
                        VALUES (NEW.evp_name, NEW.evp_description, 'Envelope');

                        UPDATE t_envelope_evp
                        SET evp_account_id = (SELECT acc_id FROM t_account_acc ORDER BY acc_id DESC LIMIT 1)
                        WHERE evp_id = NEW.evp_id;
                    END
                `, args: [] },

                
            


                { sql: `INSERT INTO t_account_acc (acc_name, acc_description, acc_type) VALUES ('Budget Used', '', 'Budget_Used')`, args: [] },

                // Revenues
                // t_revenue_rev
                {sql: ``, args: []},
                {sql: ``, args: []},
                {sql: ``, args: []},

            
                //
                // Migration
                //

                { sql: `INSERT INTO t_envelope_evp (evp_name, evp_due_date, evp_target_amount, evp_target_period, evp_description, evp_category_id)
                SELECT evp_name, evp_due_date, evp_target_amount, evp_target_period, '', evp_category_id
                FROM t_envelope_evp_backup`, args: [] },

                {sql: `INSERT INTO t_bank_account_bnk (bnk_name) SELECT act_name FROM t_account_act`, args: []}, // bank account

                // bank transaction
                {sql: `INSERT INTO t_transaction_trn (trn_name, trn_date)
                    SELECT ats_name, ats_date
                    FROM t_account_transaction_ats
                `, args: []},

                // Insert debit for bank transaction
                {sql: `INSERT INTO t_movement_mvt (mvt_transaction_id, mvt_account_id, mvt_debit, mvt_credit)
                    SELECT trn_id, evp_account_id, ats_amount, 0
                    FROM t_account_transaction_ats
                        INNER JOIN t_transaction_trn
                            ON trn_name = ats_name AND trn_date = ats_date
                        INNER JOIN t_envelope_evp_backup as evp_bkp
                            ON evp_bkp.evp_id = ats_envelope_id
                        INNER JOIN t_envelope_evp
                            ON evp_name = evp_bkp.evp_name
                    WHERE ats_type = 'INCOME'
                `, args: []},
                // Insert credit for bank transaction
                {sql: `INSERT INTO t_movement_mvt (mvt_transaction_id, mvt_account_id, mvt_debit, mvt_credit)
                    SELECT trn_id, bnk_account_id, 0, ats_amount
                    FROM t_account_transaction_ats
                        INNER JOIN t_transaction_trn
                            ON trn_name = ats_name AND trn_date = ats_date
                        INNER JOIN t_account_act
                            ON act_id = ats_account_id
                        INNER JOIN t_bank_account_bnk
                            ON bnk_name = act_name
                    WHERE ats_type = 'INCOME'
                `, args: []},
                
                // envelope transaction
                {sql: `INSERT INTO t_transaction_trn (trn_name, trn_date)
                SELECT ets_name, ets_date
                FROM t_envelopes_transaction_ets
                `, args: []},

                // Insert debit for envelope transaction
                {sql: `INSERT INTO t_movement_mvt (mvt_transaction_id, mvt_account_id, mvt_debit, mvt_credit)
                    SELECT trn_id, evp_account_id, ets_amount, 0
                    FROM t_envelopes_transaction_ets
                        INNER JOIN t_transaction_trn
                            ON trn_name = ats_name AND trn_date = ats_date
                        INNER JOIN t_envelope_evp_backup as evp_bkp
                            ON evp_bkp.evp_id = ats_envelope_id
                        INNER JOIN t_envelope_evp
                            ON evp_name = evp_bkp.evp_name
                `, args: []},
                // Insert credit for envelope transaction
                {sql: `INSERT INTO t_movement_mvt (mvt_transaction_id, mvt_account_id, mvt_debit, mvt_credit)
                    SELECT trn_id, acc_id, 0, ets_amount
                    FROM t_envelopes_transaction_ets
                        INNER JOIN t_transaction_trn
                            ON trn_name = ats_name AND trn_date = ats_date
                        t_account_acc
                    WHERE acc_type = 'Budget_Used'
                `, args: []},

                // { sql: `INSERT INTO t_account_acc (acc_name, acc_description, acc_type) VALUES ('Budget Used', '', 'Budget_Used')`, args: [] },


                {sql: ``, args: []},
                {sql: ``, args: []},
                {sql: ``, args: []},
                {sql: ``, args: []},
                {sql: ``, args: []},
                {sql: ``, args: []},



                { sql: `DROP TABLE t_envelope_evp_backup`, args: [] },


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
