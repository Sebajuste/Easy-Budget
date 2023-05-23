import * as SQLite from 'expo-sqlite';
import _ from 'lodash';

import assert from "../../util/assert";
import { BankAccount, BankAccountDao } from "../account";
import { TransactionDaoSQLite } from './transaction-sqlite';
import { Movement, MovementDao, Transaction } from '../transaction';


async function getCapitalAccountID(client : SQLite.WebSQLDatabase) {

    return new Promise((resolve, reject) => {

        client.transaction(tx => {
            tx.executeSql(`SELECT acc_id FROM t_account_acc WHERE acc_name = 'Capital' AND acc_type = 'Capital'`, [], (_, { rows: {_array} }) => {
                resolve(_array.length > 0 ? _array[0].acc_id : '');
            }, (tx, err) => {
                reject(err);
                return true;
            });
        });

    });

}

export function getBankTotalAvailabity(movementDao : MovementDao) : Promise<number> {

    return movementDao.loadFilter({account_type: 'Bank_Account'})//
    .then(movements => _.reduce(movements, (acc, movement) => acc + (movement.debit - movement.credit), 0) ) //
    .then(total => {
        return movementDao.loadFilter({account_type: 'Envelope'})//
            .then( movements => _.reduce(movements, (acc, movement) => acc + (movement.debit - movement.credit), 0) )//
            .then(totalEnvelope => total - totalEnvelope);
    });

}

export class BankAccountDaoSQLite extends BankAccountDao {

    private client : SQLite.WebSQLDatabase;

    constructor(client: SQLite.WebSQLDatabase) {
        super();
        assert( client );
        this.client = client;
    }
    
    addAll(entry: BankAccount[]): Promise<string[] | number[] | undefined[]> {
        throw new Error("Method not implemented.");
    }

    load(): Promise<BankAccount[]> {

        const SQL = `SELECT
            acc_id as _id,
            acc_name as name,
            acc_created_at as created_at,
            CASE WHEN mvt.mvt_account_id IS NULL THEN 0 ELSE mvt.mvt_debit - mvt.mvt_credit END as balance,
            0 as envelope_balance,
            CASE WHEN mvt_reconciled.mvt_account_id IS NULL THEN 0 ELSE mvt_reconciled.mvt_debit - mvt_reconciled.mvt_credit END as total_reconciled
        FROM t_account_acc
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
        WHERE acc_type = 'Bank_Account'`;

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

    find(selector: any) : Promise<BankAccount|null> {

        const SQL = `
        SELECT acc_id as _id,
            acc_name as name,
            acc_description as description,
            act_balance as balance,
            acc_created_at as created_at,
            CASE WHEN total_balance IS NULL THEN 0 ELSE total_balance END as balance,
            0 as envelope_balance,
            0 as total_reconciled
        FROM t_account_acc
            INNER JOIN v_account_balance_abl
                ON account_id = acc_id
        WHERE bnk_id = ?
            AND acc_type = 'Bank_Account'`;

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

    save(accounts: BankAccount[]): Promise<void> {
        throw new Error("Method not implemented.");
    }

    add(account: BankAccount) : Promise<string|number|undefined> {

        const SQL_ACCOUNT = `INSERT INTO t_account_acc (
            acc_name, acc_type
        ) VALUES (?, 'Bank_Account')`;

        /*
        const SQL_TRANSACTION = `INSERT INTO t_account_transaction_ats (
            ats_name, ats_type, ats_amount, ats_date, ats_account_id, ats_reconciled
        ) VALUES (
            ?, 'INCOME', ?, ?, ?, 1
        )`;
        */

        const transactionDao = new TransactionDaoSQLite(this.client);

        // const params = [account.name, account.balance, account.envelope_balance];

        return getCapitalAccountID(this.client).then(capitalID => {

            return new Promise((resolve, reject) => {

                this.client.transaction(tx => {

                    tx.executeSql(SQL_ACCOUNT, [account.name], (_, { insertId }) => {

                        /*
                        const transaction_params = [
                            account.name,
                            account.balance,
                            new Date().toISOString(),
                            insertId != undefined ? insertId : -1,
                        ];
                        */

                        const movement_debit = {
                            account_id: insertId,
                            debit: account.balance,
                            credit: 0
                        } as Movement;

                        const movement_credit = {
                            account_id: capitalID,
                            debit: 0,
                            credit: account.balance
                        } as Movement;

                        const transaction = {
                            _id: 0,
                            name: account.name,
                            date: new Date(),
                            movements: [movement_debit, movement_credit]
                        } as Transaction;


                        transactionDao.add(transaction).then(resolve).catch(reject);

                        /*
                        tx.executeSql(SQL_TRANSACTION, transaction_params, () => {
                            resolve(insertId);
                        }, (tx, err) => {
                            reject(err);
                            return true;
                        });
                        */

                        
                    }, (tx, err) => {
                        reject(err);
                        return true;
                    });
                });
            });
        });
    }

    update(account: BankAccount) : Promise<void> {

        const SQL = `UPDATE t_account_acc
            SET acc_name = ?
            WHERE acc_id = ?`;

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

    remove(account: BankAccount) : Promise<void> {

        const SQL = 'DELETE FROM t_account_acc WHERE acc_id = ?';

        return new Promise((resolve, reject) => {
            this.client.transaction(tx => {

                tx.executeSql(`DELETE FROM t_transaction_trn WHERE trn_id = (SELECT mvt_transaction_id FROM t_movement_mvt WHERE mvt_account_id = ?)`, [account._id], (_, { rows: {_array} }) => {

                    tx.executeSql(SQL, [account._id], (_, { rows: {_array} }) => {
                        resolve();
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

}
