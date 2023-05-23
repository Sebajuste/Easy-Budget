import * as SQLite from 'expo-sqlite';
import _ from "lodash";

import { Envelope, EnvelopeDao, Period } from "../envelope";
import assert from '../../util/assert';


export class EnvelopeSQLiteDao extends EnvelopeDao {

    private client : SQLite.WebSQLDatabase;

    constructor(client: SQLite.WebSQLDatabase) {
        super();
        assert( client );
        this.client = client;
    }

    addAll(entry: Envelope[]): Promise<string[] | number[] | undefined[]> {
        throw new Error("Method not implemented.");
    }

    load(): Promise<Envelope[]> {
        return new Promise((resolve, reject) => {

            const SQL = `SELECT evp_id as _id,
                acc_evp.acc_name as name,
                CASE WHEN mvt.mvt_account_id IS NULL THEN 0 ELSE (total_debit - total_credit) END as funds,
                CASE WHEN mvt.total_debit IS NULL THEN 0 ELSE total_debit END as debit_amount,
                CASE WHEN mvt.total_credit IS NULL THEN 0 ELSE total_credit END as credit_amount,
                evp_target_amount as amount,
                CASE evp_target_period
                    WHEN 'MONTHLY' THEN '${Period.MONTHLY}'
                    WHEN 'TRIMESTER' THEN '${Period.TRIMESTER}'
                    WHEN 'SEMESTER' THEN '${Period.SEMESTER}'
                    WHEN 'YEARLY' THEN '${Period.YEARLY}'
                    ELSE '${Period.MONTHLY}'
                END AS period,
                evp_due_date as dueDate,
                evp_category_id as category_id,
                acc_cat.acc_name as category,
                acc_evp.acc_id as account_id
            FROM t_envelope_evp
                INNER JOIN t_account_acc as acc_evp
                    ON acc_evp.acc_id = evp_account_id
                INNER JOIN t_category_cat
                    ON cat_id = evp_category_id
                INNER JOIN t_account_acc as acc_cat
                    ON acc_cat.acc_id = cat_account_id
                LEFT JOIN (
                    SELECT mvt_account_id,
                        SUM(mvt_debit) as total_debit,
                        SUM(mvt_credit) as total_credit
                    FROM t_movement_mvt
                    GROUP BY mvt_account_id
                ) AS mvt
                    ON mvt.mvt_account_id = acc_evp.acc_id
            `;
                

            /*
            const SQL = `
            SELECT evp_id as _id,
                evp_name as name,
                (CASE WHEN debit.amount IS NULL THEN 0 ELSE debit.amount END - CASE WHEN credit.amount IS NULL THEN 0 ELSE credit.amount END) as funds,
                CASE WHEN debit.amount IS NULL THEN 0 ELSE debit.amount END as debit_amount,
                CASE WHEN credit.amount IS NULL THEN 0 ELSE credit.amount END as credit_amount,
                evp_target_amount as amount,
                CASE evp_target_period
                    WHEN 'MONTHLY' THEN '${Period.MONTHLY}'
                    WHEN 'TRIMESTER' THEN '${Period.TRIMESTER}'
                    WHEN 'SEMESTER' THEN '${Period.SEMESTER}'
                    WHEN 'YEARLY' THEN '${Period.YEARLY}'
                    ELSE '${Period.MONTHLY}'
                END AS period,
                evp_due_date as dueDate,
                evp_category_id as category_id,
                cat_name as category
            FROM t_envelope_evp
                INNER JOIN t_category_cat
                    ON cat_id = evp_category_id
                LEFT OUTER JOIN (
                    SELECT evt_envelope_id, -SUM(ats_amount) as amount
                    FROM tj_envelope_transaction_evt
                        INNER JOIN t_account_transaction_ats
                            ON ats_id = evt_transaction_id
                    GROUP BY evt_envelope_id
                ) as credit ON credit.evt_envelope_id = evp_id
                LEFT OUTER JOIN (
                    SELECT ets_envelope_id, SUM(ets_amount) as amount
                    FROM t_envelopes_transaction_ets
                    GROUP BY ets_envelope_id
                ) as debit ON debit.ets_envelope_id = evp_id
            `;
            */

            this.client.transaction(tx => {
                tx.executeSql(SQL, [], (_, { rows: {_array} }) => {

                    resolve( _array.map(item => {
                        item.dueDate = new Date(item.dueDate);
                        if( item.funds == null ) item.funds = 0;
                        return item;
                    }) );
                    
                   // resolve( _array );

                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });

        });
    }

    find(selector: any) : Promise<Envelope|null> {
        return new Promise((resolve, reject) => {

            const SQL = `SELECT evp_id as _id,
                acc_evp.acc_name as name,
                CASE WHEN mvt.mvt_account_id IS NULL THEN 0 ELSE (total_debit - total_credit) END as funds,
                CASE WHEN mvt.total_debit IS NULL THEN 0 ELSE total_debit END as debit_amount,
                CASE WHEN mvt.total_credit IS NULL THEN 0 ELSE total_credit END as credit_amount,
                CASE evp_target_period
                    WHEN 'MONTHLY' THEN '${Period.MONTHLY}'
                    WHEN 'TRIMESTER' THEN '${Period.TRIMESTER}'
                    WHEN 'SEMESTER' THEN '${Period.SEMESTER}'
                    WHEN 'YEARLY' THEN '${Period.YEARLY}'
                    ELSE '${Period.MONTHLY}'
                END AS period,
                evp_due_date as dueDate,
                evp_category_id as category_id,
                acc_cat.acc_name as category,
                acc_evp.acc_id as account_id
            FROM t_envelope_evp
                INNER JOIN t_account_acc as acc_evp
                    ON acc_evp.acc_id = evp_account_id
                INNER JOIN t_category_cat
                    ON cat_id = evp_category_id
                INNER JOIN t_account_acc as acc_cat
                    ON acc_cat.acc_id = cat_account_id
                LEFT JOIN (
                    SELECT mvt_account_id,
                        SUM(mvt_debit) as total_debit,
                        SUM(mvt_credit) as total_credit
                    FROM t_movement_mvt
                    GROUP BY mvt_account_id
                ) AS mvt
                    ON mvt.mvt_account_id = acc_evp.acc_id
            WHERE evp_id = ?
            `;

            /*
            const SQL = `
            SELECT evp_id as _id,
                evp_name as name,
                (CASE WHEN debit.amount IS NULL THEN 0 ELSE debit.amount END - CASE WHEN credit.amount IS NULL THEN 0 ELSE credit.amount END) as funds,
                debit.amount as debit_amount,
                credit.amount as credit_amount,
                evp_target_amount as amount,
                CASE evp_target_period
                    WHEN 'MONTHLY' THEN '${Period.MONTHLY}'
                    WHEN 'TRIMESTER' THEN '${Period.TRIMESTER}'
                    WHEN 'SEMESTER' THEN '${Period.SEMESTER}'
                    WHEN 'YEARLY' THEN '${Period.YEARLY}'
                    ELSE '${Period.MONTHLY}'
                END AS period,
                evp_due_date as dueDate,
                evp_category_id as category_id
            FROM t_envelope_evp
                LEFT OUTER JOIN (
                    SELECT evt_envelope_id, -SUM(ats_amount) as amount
                    FROM tj_envelope_transaction_evt
                        INNER JOIN t_account_transaction_ats
                            ON ats_id = evt_transaction_id
                    GROUP BY evt_envelope_id
                ) as credit ON credit.evt_envelope_id = evp_id
                LEFT OUTER JOIN (
                    SELECT ets_envelope_id, SUM(ets_amount) as amount
                    FROM t_envelopes_transaction_ets
                    GROUP BY ets_envelope_id
                ) as debit ON debit.ets_envelope_id = evp_id
            WHERE evp_id = ?
            `;
            */

            this.client.transaction(tx => {
                tx.executeSql(SQL, [selector], (tx2, { rows: {_array} }) => {

                    if( _array.length > 0 ) {
                        resolve( _.head(_array.map(item => {
                            item.dueDate = new Date(item.dueDate);
                            if( item.funds == null ) item.funds = 0;
                            return item;
                        }) ) );
                    } else {
                        resolve(null);
                    }
                    
                   // resolve( _array );

                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });

        });
    }

    add(envelope: Envelope): Promise<string|number|undefined> {

        const SQL_ACCOUNT = `INSERT INTO t_account_acc (acc_name, acc_type) VALUES (?, 'Envelope')`;

        const SQL_ENVELOPE = `INSERT INTO t_envelope_evp (
            evp_target_amount,
            evp_target_period,
            evp_due_date,
            evp_category_id,
            evp_account_id
        ) VALUES (
            ?, ?, ?, ?, ?
        )`;

        return new Promise((resolve, reject) => {
            this.client.transaction(tx => {

                tx.executeSql(SQL_ACCOUNT, [envelope.name], (_, { insertId }) => {
                    // resolve(insertId);

                    if( insertId ) {
                        const params = [envelope.amount, envelope.period.toString(), envelope.dueDate.toISOString(), envelope.category_id, insertId];

                        tx.executeSql(SQL_ENVELOPE, params, (_, { insertId }) => {
                            resolve(insertId);
                        }, (tx, err) => {
                            reject(err);
                            return true;
                        });
                    } else {
                        throw new Error(`Cannot insert envelope account`);
                    }

                }, (tx, err) => {
                    reject(err);
                    return true;
                });

                
            });
        });
    }

    update(envelope: Envelope): Promise<void> {

        const SQL = `
            UPDATE t_envelope_evp
            SET evp_name = ?,
                evp_current_amount = ?,
                evp_target_amount = ?,
                evp_target_period = ?,
                evp_due_date = ?,
                evp_category_id = ?
            WHERE evp_id = ?
        `;

        const params = [envelope.name, envelope.funds, envelope.amount,  envelope.period.toString(), envelope.dueDate.toISOString(), envelope.category_id, envelope._id];

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

    remove(envelope: Envelope): Promise<void> {

        const SQL = `DELETE FROM t_envelope_evp WHERE evp_id = ?`;

        return new Promise((resolve, reject) => {
            this.client.transaction(tx => {
                tx.executeSql(SQL, [envelope._id], (_, { rows: {_array} }) => {
                    resolve();
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });
    }

}
