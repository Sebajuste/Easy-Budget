import _ from "lodash";
import { AccountTransaction, AccountTransactionDao, EnvelopeTransaction, EnvelopeTransactionDao, TransactionType } from "../transaction";
import { sqlite_client } from "./database-manager-sqlite";



export class AccountTransactionDaoSQLite extends AccountTransactionDao {
    
    load(): Promise<AccountTransaction[]> {

        const SQL = `SELECT ats_id as _id,
            ats_name as name,
            ats_amount as amount,
            ats_envelope_id as envelope_id,
            ats_account_id as account_id,
            CASE ats_type
                    WHEN 'INCOME' THEN '${TransactionType.INCOME}'
                    WHEN 'OUTCOME' THEN '${TransactionType.OUTCOME}'
                    ELSE '${TransactionType.OUTCOME}'
                END AS type,
            ats_date as date,
            ats_reconciled as reconciled,
            evp_name as envelope_name,
            cat_name as category_name,
            cat_color as color,
            cat_icon as icon
        FROM t_account_transaction_ats
            LEFT OUTER JOIN t_envelope_evp
                ON evp_id = ats_envelope_id
            LEFT OUTER JOIN t_category_cat
                ON cat_id = evp_category_id
        ORDER BY ats_date DESC`;

        return new Promise((resolve, reject) => {
            sqlite_client().transaction(tx => {
                tx.executeSql(SQL, [], (_, { rows: {_array} }) => {
                    resolve(_array);
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });
    }

    find(selector: any) : Promise<AccountTransaction|null> {
        throw new Error("Method not implemented.");
    }

    add(transaction: AccountTransaction): Promise<string | number | undefined> {

        const SQL_TRANSACTION = `INSERT INTO t_account_transaction_ats (
            ats_name, ats_type, ats_amount, ats_envelope_id, ats_account_id, ats_date, ats_reconciled
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?
        )`;

        const SQL_ENVELOPE = `UPDATE t_envelope_evp SET evp_current_amount = evp_current_amount - ? WHERE evp_id = ?`;

        const SQL_ACCOUNT = `UPDATE t_account_act
            SET act_balance = act_balance - ?,
            act_envelope_balance = act_envelope_balance - ?
            WHERE act_id = ?`;

        const params = [
            transaction.name,
            transaction.type.toString(),
            transaction.amount,
            transaction.envelope_id == '' ? null : transaction.envelope_id,
            transaction.account_id,
            transaction.date.toISOString(),
            transaction.reconciled ? 1 : 0
        ];

        console.info('params : ', params);

        return new Promise((resolve, reject) => {

            let insertId = 0;

            sqlite_client().transaction(async tx => {

                if( transaction.type == TransactionType.OUTCOME ) {
                    await tx.executeSql(SQL_ENVELOPE, [transaction.amount, transaction.envelope_id], (_, { insertId }) => {
                    }, (tx, err) => {
                        console.error('Error update envelope', err);
                        console.error(err);
                        return true;
                    });
                }

                const accountParams = [
                    (transaction.type == TransactionType.OUTCOME ? transaction.amount : -transaction.amount),
                    (transaction.type == TransactionType.OUTCOME ? 0 : -transaction.amount),
                    transaction.account_id
                ];

                await tx.executeSql(SQL_ACCOUNT, accountParams, (_, { insertId }) => {
                }, (tx, err) => {
                    console.error('Error update account', err);
                    console.error(err);
                    return true;
                });

                await tx.executeSql(SQL_TRANSACTION, params, (_, { result } : any) => {
                    insertId = result;
                }, (tx, err) => {
                    console.error('Error insert transaction', err);
                    return true;
                });
            }, err => {
                reject(err);
            }, () => {
                resolve(insertId);
            });
        });
    }

    addAll(transactions: AccountTransaction[]): Promise<(string|number|undefined)[]> {
        
        return Promise.all( transactions.map(this.add) );

    }

    update(transaction: AccountTransaction): Promise<void> {

        const SQL = `UPDATE t_account_transaction_ats
        SET ats_name = ?,
            ats_type = ?,
            ats_amount = ?,
            ats_envelope_id = ?,
            ats_account_id = ?,
            ats_date = ?,
            ats_reconciled = ?
        WHERE ats_id = ?`;

        const params = [transaction.name, transaction.type, transaction.amount, transaction.envelope_id, transaction.account_id, transaction.date.toISOString(), transaction.reconciled ? 1 : 0, transaction._id];

        return new Promise((resolve, reject) => {
            sqlite_client().transaction(tx => {
                tx.executeSql(SQL, params, (_, { rows: {_array} }) => {
                    resolve();
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });
    }

    remove(transaction: AccountTransaction): Promise<void> {
        
        const SQL = `DELETE FROM t_account_transaction_ats WHERE ats_id = ?`;

        return new Promise((resolve, reject) => {
            sqlite_client().transaction(tx => {
                tx.executeSql(SQL, [transaction._id], (_, { rows: {_array} }) => {
                    resolve();
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });
    }

}


export class EnvelopeTransactionDaoSQLite extends EnvelopeTransactionDao {

    public load(): Promise<EnvelopeTransaction[]> {

        const SQL = `SELECT ets_id as _id,
            ets_name as name,
            ets_amount as amount,
            ets_envelope_id as envelope_id,
            ets_account_id as account_id,
            ets_date as date
        FROM t_envelopes_transaction_ets`;

        return new Promise((resolve, reject) => {
            sqlite_client().transaction(tx => {
                tx.executeSql(SQL, [], (_, { rows: {_array} }) => {
                    resolve(_array);
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });
    }

    find(selector: any) : Promise<EnvelopeTransaction|null> {
        throw new Error("Method not implemented.");
    }

    public add(transaction: EnvelopeTransaction): Promise<string | number | undefined> {

        console.log(`Add transaction `, transaction);

        const SQL_TRANSACTION = `INSERT INTO t_envelopes_transaction_ets (
            ets_name, ets_amount, ets_envelope_id, ets_account_id, ets_date
        ) VALUES (
            ?, ?, ?, ?, ?
        )`;

        const SQL_ENVELOPE = `UPDATE t_envelope_evp SET evp_current_amount = evp_current_amount + ? WHERE evp_id = ?`;

        const SQL_ACCOUNT = `UPDATE t_account_act SET act_envelope_balance = act_envelope_balance - ? WHERE act_id = ?`;

        const params = [transaction.name, transaction.amount, transaction.envelope_id, transaction.account_id, transaction.date.toISOString()];

        return new Promise((resolve, reject) => {
            sqlite_client().transaction(async tx => {

                await tx.executeSql(SQL_ENVELOPE, [transaction.amount, transaction.envelope_id], (_) => {

                }, (_, err) => {
                    return true;
                });

                await tx.executeSql(SQL_ACCOUNT, [transaction.amount, transaction.account_id], (_) => {

                }, (_, err) => {
                    return true;
                });

                await tx.executeSql(SQL_TRANSACTION, params, (_, { insertId }) => {
                    resolve(insertId);
                }, (_, err) => {
                    reject(err);
                    return true;
                });
            }, err => {
                reject(err);
            }, () => {

            });
        });
    }

    public addAll(transactions: EnvelopeTransaction[]): Promise<(string|number|undefined)[]> {
        const futures = _.map(transactions, transaction => this.add(transaction) );
        return Promise.all( futures );
    }

    public update(transaction: EnvelopeTransaction): Promise<void> {
        
        const SQL = `UPDATE t_envelopes_transaction_ets
        SET ets_name = ?,
            ets_amount = ?,
            ets_envelope_id = ?,
            ets_account_id = ?,
            ets_date = ?
        WHERE ets_id = ?`;

        const params = [transaction.name, transaction.amount, transaction.envelope_id, transaction.account_id, transaction.date.toISOString(), transaction._id];

        return new Promise((resolve, reject) => {
            sqlite_client().transaction(tx => {
                tx.executeSql(SQL, params, (_, { rows: {_array} }) => {
                    resolve();
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });

    }

    public remove(transaction: AccountTransaction): Promise<void> {
        
        const SQL = `DELETE FROM t_envelopes_transaction_ets WHERE ets_id = ?`;

        return new Promise((resolve, reject) => {
            sqlite_client().transaction(tx => {
                tx.executeSql(SQL, [transaction._id], (_, { rows: {_array} }) => {
                    resolve();
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });
    }

}
