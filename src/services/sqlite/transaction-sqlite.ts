import _ from "lodash";
import { Envelope } from "../envelope";
import { AccountTransaction, AccountTransactionDao, EnvelopeTransaction, EnvelopeTransactionDao, TransactionType } from "../transaction";
import { sqlite_client, sqlite_client_async } from "./database-manager-sqlite";


function getEditBalance(transaction : AccountTransaction) {

    if(transaction.type == TransactionType.OUTCOME) {
        return transaction.amount;
    }
    if( transaction.type == TransactionType.TRANSFER ) {
        return transaction.amount;
    }

    // If TransactionType.INCOME
    return -transaction.amount;
}

function getEditEnvelopeBalance(transaction : AccountTransaction) {

    if( transaction.type == TransactionType.OUTCOME ) {
        return 0;
    }
    if( transaction.type == TransactionType.TRANSFER ) {
        return transaction.amount
    }

    // If TransactionType.INCOME
    return -transaction.amount

}

export class AccountTransactionDaoSQLite extends AccountTransactionDao {
    
    load(): Promise<AccountTransaction[]> {

        const SQL = `SELECT ats_id as _id,
            ats_name as name,
            ats_amount as amount,
            ats_envelope_id as envelope_id,
            ats_account_id as account_id,
            ats_category_id as category_id,
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
            LEFT OUTER JOIN t_category_cat
                ON cat_id = ats_category_id
            LEFT OUTER JOIN t_envelope_evp
                ON evp_id = ats_envelope_id
        ORDER BY ats_date DESC`;

        return new Promise((resolve, reject) => {
            sqlite_client().transaction(tx => {
                tx.executeSql(SQL, [], (_tx, { rows: {_array} }) => {

                    _array = _.map(_array, item => {
                        item.reconciled = item.reconciled == 'true' || item.reconciled == 'TRUE' || item.reconciled === 1;
                        return item;
                    });

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
            ats_name, ats_type, ats_amount, ats_date, ats_category_id, ats_envelope_id, ats_account_id
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
            transaction.type == TransactionType.TRANSFER ? TransactionType.OUTCOME.toString() : transaction.type.toString(),
            transaction.type == TransactionType.INCOME ? transaction.amount : -transaction.amount,
            transaction.date.toISOString(),
            transaction.category_id == '' ? null : transaction.category_id,
            transaction.envelope_id == '' ? null : transaction.envelope_id,
            transaction.account_id,
        ];

        return new Promise((resolve, reject) => {

            let insertId = 0;

            sqlite_client().transaction(async tx => {

                if( transaction.type == TransactionType.OUTCOME && transaction.envelope_id !== '') {
                    await tx.executeSql(SQL_ENVELOPE, [transaction.amount, transaction.envelope_id], (_, { insertId }) => {
                    }, (tx, err) => {
                        console.error('Error update envelope', err);
                        console.error(err);
                        return true;
                    });
                }

                const editBalance = getEditBalance(transaction);
                const editEnvelopeBalance = getEditEnvelopeBalance(transaction);

                const accountParams = [
                    editBalance,
                    editEnvelopeBalance,
                    transaction.account_id
                ];

                await tx.executeSql(SQL_ACCOUNT, accountParams, (_, { insertId }) => {
                }, (tx, err) => {
                    console.error('Error update account', accountParams, err);
                    console.error(err);
                    return true;
                });

                await tx.executeSql(SQL_TRANSACTION, params, (_, { result } : any) => {
                    insertId = result;
                }, (tx, err) => {
                    console.error('Error insert transaction', params, err);
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
            ats_category_id = ?,
            ats_date = ?,
            ats_reconciled = ?
        WHERE ats_id = ?`;

        const params = [transaction.name, transaction.type, transaction.amount, transaction.envelope_id, transaction.account_id, transaction.category_id, transaction.date, transaction.reconciled ? 1 : 0, transaction._id];

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

    statsForMonth(year: number, month: number): Promise<any[]> {

        const SQL = `SELECT cat_id as categoryID, cat_name as category, cat_color as color, cat_icon as icon,  date, amount
            FROM (
                SELECT ats_category_id, strftime('%Y-%m', ats_date) as date, SUM(ats_amount) as amount
                FROM t_account_transaction_ats
                GROUP BY ats_category_id, strftime('%Y-%m', ats_date)
            ) as temp
                INNER JOIN t_category_cat
                    ON cat_id = ats_category_id
            WHERE date = ?
            ORDER BY amount DESC`;

        const monthStr = `${month}`;

        const params = [`${year}-${monthStr.length == 1 ? '0'+monthStr : monthStr}`]; // [`${year}-${month}`];

        return new Promise((resolve, reject) => {
            sqlite_client().transaction(tx => {
                tx.executeSql(SQL, params, (_, { rows: {_array} }) => {
                    resolve(_array);
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });

    }

    statsCategoryForMonth(year: number, month: number, categoryID: string | number) : Promise<any> {

        const SQL = `SELECT cat_name as category, cat_color as color, cat_icon as icon, ats_name as name, ats_date as date, ats_amount as amount
            FROM t_account_transaction_ats
                INNER JOIN t_category_cat
                    ON cat_id = ats_category_id
            WHERE strftime('%Y-%m', ats_date) = ?
                AND ats_category_id = ?
            ORDER BY ats_date DESC`

        const monthStr = `${month}`;

        const params = [`${year}-${monthStr.length == 1 ? '0'+monthStr : monthStr}`, categoryID];

        return new Promise((resolve, reject) => {
            sqlite_client().transaction(tx => {
                tx.executeSql(SQL, params, (_, { rows: {_array} }) => {
                    resolve(_array);
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

    async range(envelope:Envelope, from:Date, to:Date) : Promise<EnvelopeTransaction[]> {

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
                ats_reconciled as reconciled
            FROM t_account_transaction_ats
            WHERE ats_envelope_id = ?
                AND ats_date >= ?
                AND ats_date < ?`;


        const client = await sqlite_client_async();

        return new Promise((resolve, reject) => {

            client.transaction(tx => {

                tx.executeSql(SQL, [envelope._id, from.toISOString(), to.toISOString()], (_, {rows: {_array}}) => {
                    resolve(_array);
                }, (tx, err) => {
                    reject(err);
                    return true;
                });

            }, reject);

        });

    }

    find(selector: any) : Promise<EnvelopeTransaction|null> {
        throw new Error("Method not implemented.");
    }

    public add(transaction: EnvelopeTransaction): Promise<string | number | undefined> {

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

    public remove(transaction: EnvelopeTransaction): Promise<void> {
        
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
