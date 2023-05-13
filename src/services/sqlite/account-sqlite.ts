import * as SQLite from 'expo-sqlite';

import assert from "../../util/assert";
import { Account, AccountDao } from "../account";


export class AccountDaoSQLite extends AccountDao {

    private client : SQLite.WebSQLDatabase;

    constructor(client: SQLite.WebSQLDatabase) {
        super();
        assert( client );
        this.client = client;
    }
    
    addAll(entry: Account[]): Promise<string[] | number[] | undefined[]> {
        throw new Error("Method not implemented.");
    }

    load(): Promise<Account[]> {

        const SQL = `SELECT act_id as _id,
            act_name as name,
            temp_balance.total as balance,
            act_envelope_balance as envelope_balance,
            act_created_at as created_at,
            temp_reconciled.total as total_reconciled
        FROM t_account_act
            LEFT OUTER JOIN ( SELECT ats_account_id, SUM(ats_amount) as total
                FROM t_account_transaction_ats
                WHERE ats_reconciled = 1
                GROUP BY ats_account_id
            ) as temp_reconciled
                ON temp_reconciled.ats_account_id = act_id
            LEFT OUTER JOIN ( SELECT ats_account_id, SUM(ats_amount) as total
                FROM t_account_transaction_ats
                GROUP BY ats_account_id
            ) as temp_balance
                ON temp_balance.ats_account_id = act_id
        `;
        

        /*
        const SQL = `
        SELECT act_id as _id,
            act_name as name,
            act_balance as balance,
            act_envelope_balance as envelope_balance,
            act_created_at as created_at,
            ( IFNULL(outcome.total, 0) + IFNULL(income.total, 0) ) as total_reconciled
        FROM t_account_act
            LEFT OUTER JOIN (
                SELECT ats_account_id, SUM(-ats_amount) as total
                FROM t_account_transaction_ats
                WHERE ats_type = 'OUTCOME'
                    AND ats_reconciled = 1
                GROUP BY ats_account_id
            ) as outcome
                ON outcome.ats_account_id = act_id
            LEFT OUTER JOIN (
                SELECT ats_account_id, SUM(ats_amount) as total
                FROM t_account_transaction_ats
                WHERE ats_type = 'INCOME'
                    AND ats_reconciled = 1
                GROUP BY ats_account_id
            ) as income
                ON income.ats_account_id = act_id`;
        */

        return new Promise((resolve, reject) => {
            this.client.transaction(tx => {
                tx.executeSql(SQL, [], (_, { rows: {_array} }) => {
                    resolve(_array);
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });
    }

    find(selector: any) : Promise<Account|null> {

        const SQL = `
        SELECT act_id as _id,
            act_name as name,
            act_balance as balance,
            act_envelope_balance as envelope_balance,
            act_created_at as created_at
        FROM t_account_act
        WHERE act_id = ?`;

        return new Promise((resolve, reject) => {
            this.client.transaction(tx => {
                tx.executeSql(SQL, [selector], (_, { rows: {_array} }) => {
                    resolve(_array.length > 0 ? _array[0] : null);
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });

    };

    save(accounts: Account[]): Promise<void> {
        throw new Error("Method not implemented.");
    }

    add(account: Account) : Promise<string|number|undefined> {

        const SQL_ACCOUNT = `INSERT INTO t_account_act (
            act_name,
            act_balance,
            act_envelope_balance
        ) VALUES (?, ?, ?)`;

        const SQL_TRANSACTION = `INSERT INTO t_account_transaction_ats (
            ats_name, ats_type, ats_amount, ats_date, ats_account_id, ats_reconciled
        ) VALUES (
            ?, 'INCOME', ?, ?, ?, 1
        )`;

        const params = [account.name, account.balance, account.envelope_balance];

        return new Promise((resolve, reject) => {
            this.client.transaction(tx => {
                tx.executeSql(SQL_ACCOUNT, params, (_, { insertId }) => {

                    const transaction_params = [
                        account.name,
                        account.balance,
                        new Date().toISOString(),
                        insertId != undefined ? insertId : -1,
                    ];

                    tx.executeSql(SQL_TRANSACTION, transaction_params, () => {
                        resolve(insertId);
                    }, (tx, err) => {
                        reject(err);
                        return true;
                    });

                    
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });
    }

    update(account: Account) : Promise<void> {

        const SQL = `UPDATE t_account_act
            SET act_name = ?
            WHERE act_id = ?`;

        const params = [account.name, account._id];
        
        return new Promise((resolve, reject) => {
            this.client.transaction(tx => {
                tx.executeSql(SQL, params, (_, { rows: {_array} }) => {
                    console.log('account updated', account)
                    resolve();
                }, (tx, err) => {
                    console.error(err);
                    reject(err);
                    return true;
                });
            });
        });

    }

    remove(account: Account) : Promise<void> {

        /*
        const SQL = knex('t_account_act')
        .where('act_id', account._id)//
        .del()//
        .toString();
        */

        const SQL = 'DELETE FROM t_account_act WHERE act_id = ?';

        return new Promise((resolve, reject) => {
            this.client.transaction(tx => {
                tx.executeSql(SQL, [account._id], (_, { rows: {_array} }) => {
                    resolve();
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });
    }

}
