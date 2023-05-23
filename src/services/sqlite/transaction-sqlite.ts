import * as SQLite from 'expo-sqlite';
import _ from "lodash";

import { Envelope } from "../envelope";
import { AccountTransaction, AccountTransactionDao, EnvelopeTransaction, EnvelopeTransactionDao, Movement, MovementDao, Transaction, TransactionAccount, TransactionAccountDao, TransactionDao, TransactionType } from "../transaction";
import assert from '../../util/assert';
import { DAO } from '../dao';


export class TransactionAccountDaoSQLite extends TransactionAccountDao {

    private client : SQLite.WebSQLDatabase;

    constructor(client: SQLite.WebSQLDatabase) {
        super();
        assert( client );
        this.client = client;
    }

    load(): Promise<TransactionAccount[]> {
        throw new Error('Method not implemented.');
    }

    find(selector: any): Promise<TransactionAccount | null> {

        const {name, type} = selector;

        const SQL = `SELECT acc_id as _id,
            acc_name as name,
            acc_description as description,
            acc_type as type
        FROM t_account_acc
        WHERE acc_name = ? AND acc_type = ?`;

        return new Promise((resolve, reject) => {
            this.client.transaction(tx => {

                tx.executeSql(SQL, [name, type], (_tx, { rows: {_array} }) => {
                    if( _array.length > 0) {
                        resolve( _.head(_array) );
                    } else {
                        resolve(null);
                    }
                    
                }, (tx, err) => {
                    reject(err);
                    return true;
                });

            });

        });
    }

    add(entry: TransactionAccount): Promise<string | number | undefined> {
        throw new Error('Method not implemented.');
    }

    addAll(entry: TransactionAccount[]): Promise<(string | number | undefined)[]> {
        throw new Error('Method not implemented.');
    }

    update(entry: TransactionAccount): Promise<void> {
        throw new Error('Method not implemented.');
    }

    remove(entry: TransactionAccount): Promise<void> {
        throw new Error('Method not implemented.');
    }

}


export class TransactionDaoSQLite extends TransactionDao {

    private client : SQLite.WebSQLDatabase;

    private movementDao : MovementDaoSQLite;

    constructor(client: SQLite.WebSQLDatabase) {
        super();
        assert( client );
        this.client = client;
        this.movementDao = new MovementDaoSQLite(client);
    }

    async load() : Promise<Transaction[]> {

        const SQL = `SELECT trn_id, trn_name, trn_date, mvt_id, mvt_debit, mvt_credit, mvt_account_id
        FROM t_transaction_trn
            LEFT OUTER JOIN t_movement_mvt
                ON mvt_transaction_id = trn_id`;

        return new Promise((resolve, reject) => {
            this.client.transaction(tx => {
                tx.executeSql(SQL, [], (_tx, { rows: {_array} }) => {

                    const groupedResults = _.groupBy(_array, ['trn_id']);

                    // Construction des objets Transaction avec leurs mouvements associés
                    const transactions: Transaction[] = _.map(groupedResults, (rows: any[]) => {
                        const { trn_id, trn_name, trn_date } = rows[0];
                        const movements = _.map(rows, (row: any) => ({
                            _id: row.mvt_id,
                            account_id: row.mvt_account_id,
                            debit: row.mvt_debit,
                            credit: row.mvt_credit
                        }));

                        return {
                            _id: trn_id,
                            name: trn_name,
                            date: new Date(trn_date),
                            movements
                        } as Transaction;
                    });

                    resolve(transactions);
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });

    }

    

    async find(selector: any): Promise<Transaction | null> {
        throw new Error('Method not implemented.');
    }
    
    async add(entry : Transaction) : Promise<string|number|undefined> {
        const { date, name, movements } = entry;

        console.log('add transaction')

        return new Promise((resolve, reject) => {

            // Début de la transaction SQL
            this.client.transaction(async (tx) => {

                // Insertion de la transaction
                const insertTransactionSql = `
                    INSERT INTO t_transaction_trn (trn_name, trn_date)
                    VALUES (?, ?)
                `;
                tx.executeSql(insertTransactionSql, [
                    name,
                    date.toISOString()
                ], (_, { insertId } : any) => {
                    
                    const transactionId = insertId;

                    if (movements.length > 0 && transactionId ) {
                        // Construction des valeurs pour l'insertion des mouvements
                        const movementValues = movements.map((movement) => `(${transactionId}, ${movement.account_id}, ${movement.debit}, ${movement.credit})`)//
                            .join(',');
        
                        // Insertion des mouvements associés à la transaction
                        const insertMovementSql = `
                        INSERT INTO t_movement_mvt (mvt_transaction_id, mvt_account_id, mvt_debit, mvt_credit)
                        VALUES ${movementValues}
                        `;
                        tx.executeSql(insertMovementSql, [], (_, result: any) => {
                            console.log('movement added result : ', result, ' for sql ', insertMovementSql);
                            resolve(transactionId);
                        }, (tx, err) => {
                            reject(err);
                            return true;
                        });
                    } else {
                        // reject(transactionId);
                        throw new Error(`Cannot create transaction`);
                    }

                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });     
     
    }

    async addAll(entry: Transaction[]): Promise<(string | number | undefined)[]> {
        throw new Error('Method not implemented.');
    }
  
    async update(entry : Transaction) : Promise<void> {
        const { _id, date, movements } = entry;

        return new Promise((resolve, reject) => {
            // Début de la transaction SQL
            this.client.transaction((tx) => {
            // Mise à jour de la transaction
            const updateTransactionSql = `
                UPDATE t_transaction_trn
                SET trn_date = ?
                WHERE trn_id = ?
            `;
            tx.executeSql(
                updateTransactionSql,
                [date.toISOString(), _id],
                (_, result: any) => {
                    if (movements.length > 0) {
                        // Suppression des mouvements associés à la transaction
                        const deleteMovementsSql = `
                        DELETE FROM t_movement_mvt
                        WHERE mvt_transaction_id = ?
                        `;
                        tx.executeSql(
                        deleteMovementsSql,
                        [_id],
                        () => {
                            // Construction des valeurs pour l'insertion des mouvements
                            const movementValues = movements
                            .map(
                                (movement) =>
                                `(${_id}, ${movement.account_id}, ${movement.debit}, ${movement.credit})`
                            )
                            .join(',');

                            // Insertion des nouveaux mouvements associés à la transaction
                            const insertMovementSql = `
                            INSERT INTO t_movement_mvt (mvt_transaction_id, mvt_account_id, mvt_debit, mvt_credit)
                            VALUES ${movementValues}
                            `;
                            tx.executeSql(
                            insertMovementSql,
                            [],
                            (_, result: any) => {
                                resolve();
                            },
                            (tx, err) => {
                                reject(err);
                                return true;
                            }
                            );
                        },
                        (tx, err) => {
                            reject(err);
                            return true;
                        }
                        );
                    } else {
                        resolve();
                    }
                },
                (tx, err) => {
                    reject(err);
                    return true;
                }
            );
            });
        });
    }
  
    async remove(entry : Transaction) : Promise<void> {
        const { _id } = entry;

        return new Promise((resolve, reject) => {
            // Début de la transaction SQL
            this.client.transaction((tx) => {
                // Suppression de la transaction
                const deleteTransactionSql = `
                    DELETE FROM t_transaction_trn
                    WHERE trn_id = ?
                `;
                tx.executeSql(
                    deleteTransactionSql,
                    [_id],
                    () => {
                        resolve();
                    },
                    (tx, err) => {
                        reject(err);
                        return true;
                    }
                );
            });
        });
    }

}


export class MovementDaoSQLite extends MovementDao {

    private client : SQLite.WebSQLDatabase;

    constructor(client: SQLite.WebSQLDatabase) {
        super();
        assert( client );
        this.client = client;
    }

    load(): Promise<Movement[]> {
        
        const SQL = `SELECT mvt_id as _id,
            trn_name as name,
            trn_date as date,
            mvt_debit as debit,
            mvt_credit as credit,
            acc_id as account_id,
            mvt_transaction_id as transaction_id
        FROM t_movement_mvt as mvt
            INNER JOIN t_transaction_trn
                ON trn_id = mvt_transaction_id
            INNER JOIN t_account_acc
                ON acc_id = mvt_account_id
        ORDER BY mvt_transaction_id ASC`;

        return new Promise((resolve, reject) => {

            this.client.transaction(tx => {

                tx.executeSql(SQL, [], (_, {rows: {_array}}) => {
                    resolve(_array);
                }, (tx, err) => {
                    reject(err);
                    return true;
                })

            });

        });

    }

    loadFilter(selector: {account_type?:string, account_id?:string|number}): Promise<Movement[]> {
        
        const where_clause = selector['account_type'] ? `acc_type = ?` : `mvt_account_id = ?`;

        const SQL = `SELECT mvt_id as _id,
            trn_name as name,
            trn_date as date,
            mvt_debit as debit,
            mvt_credit as credit,
            CASE WHEN rec_mouvement_id IS NULL THEN 0 ELSE 1 END as reconciled,
            acc_id as account_id,
            mvt_transaction_id as transaction_id
        FROM t_movement_mvt
            INNER JOIN t_transaction_trn
                ON trn_id = mvt_transaction_id
            INNER JOIN t_account_acc
                ON acc_id = mvt_account_id
            LEFT JOIN t_reconciliation_rec
                ON rec_mouvement_id = mvt_id
        WHERE ${where_clause}`;

        return new Promise((resolve, reject) => {

            this.client.transaction(tx => {

                tx.executeSql(SQL, [ selector?.account_type || selector?.account_id || null], (_tx, { rows: {_array} }) => {
                    resolve(_array);
                }, (tx, err) => {
                    reject(err);
                    return false;
                });

            });

        }).then(movements => _.map(movements as any[], movement => Object.assign({}, movement, {reconciled: (movement.reconciled === 'TRUE' || movement.reconciled === 1)}) ));
    }

    find(selector: any): Promise<Movement | null> {
        throw new Error('Method not implemented.');
    }
    add(entry: Movement): Promise<string | number | undefined> {
        throw new Error('Method not implemented.');
    }
    addAll(entry: Movement[]): Promise<(string | number | undefined)[]> {
        throw new Error('Method not implemented.');
    }
    
    update(entry : Movement) : Promise<void> {
        const { _id, reconciled } = entry;

        return new Promise((resolve, reject) => {

            this.client.transaction((tx) => {
                
                if( reconciled ) {
                    // Ajouter une entrée de réconciliation pour ce mouvement
                    const addReconciliationSql = `
                    INSERT INTO t_reconciliation_rec (rec_mouvement_id)
                    SELECT ? as rec_mouvement_id
                    WHERE NOT EXISTS (SELECT * FROM t_reconciliation_rec WHERE rec_mouvement_id = ?)
                    `;
                    tx.executeSql(addReconciliationSql, [_id, _id], () => {
                        resolve();
                    }, (tx, err) => {
                        reject(err);
                        return true;
                    });
                } else {
                    console.log('must be deleted')
                    // Supprimer les entrées de réconciliation existantes pour ce mouvement
                    const deleteReconciliationSql = `
                    DELETE FROM t_reconciliation_rec
                    WHERE rec_mouvement_id = ?
                    `;

                    tx.executeSql(deleteReconciliationSql, [_id], () => {
                        resolve();
                    }, (tx, err) => {
                        reject(err);
                        return true;
                    });

                }
            });
        });
    }

    remove(entry: Movement): Promise<void> {
        throw new Error('Method not implemented.');
    }

}






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


/** @deprecated */
export class AccountTransactionDaoSQLite extends AccountTransactionDao {
    
    private client : SQLite.WebSQLDatabase;

    constructor(client: SQLite.WebSQLDatabase) {
        super();
        assert( client );
        this.client = client;
    }

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
            this.client.transaction(tx => {
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

        // const SQL_ENVELOPE = `UPDATE t_envelope_evp SET evp_current_amount = evp_current_amount - ? WHERE evp_id = ?`;
        const SQL_ENVELOPE = `INSERT INTO tj_envelope_transaction_evt (evt_envelope_id, evt_transaction_id) VALUES (?, ?)`;

        
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

        const client = this.client;

        return new Promise((txResolve, txReject) => {

            let transactionId = 0;

            this.client.transaction(tx => {

                const editBalance = getEditBalance(transaction);
                const editEnvelopeBalance = getEditEnvelopeBalance(transaction);

                const accountParams = [
                    editBalance,
                    editEnvelopeBalance,
                    transaction.account_id
                ];

                // Could be removed
                /*
                tx.executeSql(SQL_ACCOUNT, accountParams, (_, { insertId }) => {
                }, (tx, err) => {
                    console.error('Error update account', accountParams, err);
                    console.error(err);
                    return true;
                });
                */

                tx.executeSql(SQL_TRANSACTION, params, (_, { insertId } : any) => {
                    // transactionId = insertId;
                    console.log('account transaction added');
                    //resolve(insertId);

                    if( transaction.type == TransactionType.OUTCOME && transaction.envelope_id !== '') {
                        console.log('must insert envelope transaction');
                        tx.executeSql(SQL_ENVELOPE, [transaction.envelope_id, insertId], (_, { insertId }) => {
                            console.log('envelope transaction added');
                            // resolve(transactionId);
                        }, (tx, err) => {
                            console.error('Error update envelope');
                            console.error(err);
//                            reject(err);
                            return true;
                        });
                    }

                }, (tx, err) => {
                    console.error('Error insert transaction', params, err);
                    //reject(err);
                    return true;
                });


                /*
                new Promise((resolve, reject) => {
                    tx.executeSql(SQL_TRANSACTION, params, (_, { insertId } : any) => {
                        // transactionId = insertId;
                        console.log('account transaction added');
                        resolve(insertId);
                    }, (tx, err) => {
                        console.error('Error insert transaction', params, err);
                        reject(err);
                        return true;
                    });
                }).then( (transactionId: any) => {
                    console.log('transactionId: ', transactionId);
                    console.log('transaction: ', transaction);

                    if( transaction.type == TransactionType.OUTCOME && transaction.envelope_id !== '') {
                        console.log('must insert envelope transaction');
                        return new Promise((resolve, reject) => {
                            console.log('start insert envelope transaction');
                            tx.executeSql(SQL_ENVELOPE, [transaction.envelope_id, transactionId], (_, { insertId }) => {
                                console.log('envelope transaction added');
                                resolve(transactionId);
                            }, (tx, err) => {
                                console.error('Error update envelope');
                                console.error(err);
                                reject(err);
                                return true;
                            });
                        });
                    }

                    return transactionId;

                }).then(result => {
                    transactionId = result;
                }).catch(err => {
                    console.error(err);
                    txReject(err);
                });
                */

            }, err => {
                console.error(err);
                txReject(err);
            }, () => {
                console.log('TransactionDao add finished');
                txResolve(transactionId);
            });

        });
    }

    addAll(transactions: AccountTransaction[]): Promise<(string|number|undefined)[]> {

        return Promise.all( transactions.map(transaction => this.add(transaction) ) );
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

        const params = [transaction.name, transaction.type, transaction.amount, transaction.envelope_id, transaction.account_id, transaction.category_id, transaction.date.toString(), transaction.reconciled ? 1 : 0, transaction._id];

        return new Promise((resolve, reject) => {
            this.client.transaction(tx => {
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
            this.client.transaction(tx => {
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

        const SQL = `SELECT cat_id as categoryID, cat_name as category, cat_color as color, cat_icon as icon, date, amount
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
            this.client.transaction(tx => {
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
            this.client.transaction(tx => {
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

/** @deprecated */
export class EnvelopeTransactionDaoSQLite extends EnvelopeTransactionDao {

    private client : SQLite.WebSQLDatabase;

    constructor(client: SQLite.WebSQLDatabase) {
        super();
        assert( client );
        this.client = client;
    }

    public load(): Promise<EnvelopeTransaction[]> {

        const SQL = `SELECT ets_id as _id,
            ets_name as name,
            ets_amount as amount,
            ets_envelope_id as envelope_id,
            ets_account_id as account_id,
            ets_date as date
        FROM t_envelopes_transaction_ets`;

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


        // const client = await sqlite_client_async();

        return new Promise((resolve, reject) => {

            this.client.transaction(tx => {

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
            this.client.transaction(async tx => {

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
            this.client.transaction(tx => {
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
            this.client.transaction(tx => {
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
