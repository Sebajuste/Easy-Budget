import { Envelope, EnvelopeDao, Period } from "../envelope";
import { sqlite_client } from "./database-manager-sqlite";
import _ from "lodash";

export class EnvelopeSQLiteDao extends EnvelopeDao {

    addAll(entry: Envelope[]): Promise<string[] | number[] | undefined[]> {
        throw new Error("Method not implemented.");
    }

    load(): Promise<Envelope[]> {
        return new Promise((resolve, reject) => {

            const SQL = `
            SELECT evp_id as _id,
                evp_name as name,
                evp_current_amount as funds,
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
            `;

            sqlite_client().transaction(tx => {
                tx.executeSql(SQL, [], (_, { rows: {_array} }) => {

                    
                    resolve( _array.map(item => {
                        item.dueDate = new Date(item.dueDate);
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

            const SQL = `
            SELECT evp_id as _id,
                evp_name as name,
                evp_current_amount as funds,
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
            WHERE evp_id = ?
            `;

            sqlite_client().transaction(tx => {
                tx.executeSql(SQL, [selector], (tx2, { rows: {_array} }) => {

                    if( _array.length > 0 ) {
                        resolve( _.head(_array.map(item => {
                            item.dueDate = new Date(item.dueDate);
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

        const SQL = `INSERT INTO t_envelope_evp (
            evp_name,
            evp_current_amount,
            evp_target_amount,
            evp_target_period,
            evp_due_date,
            evp_category_id
        ) VALUES (
            ?, ?, ?, ?, ?, ?
        )`;

        const params = [envelope.name, envelope.funds, envelope.amount, envelope.period.toString(), envelope.dueDate.toISOString(), envelope.category_id];
        
        return new Promise((resolve, reject) => {
            sqlite_client().transaction(tx => {
                tx.executeSql(SQL, params, (_, { insertId }) => {
                    resolve(insertId);
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });
    }

    update(envelope: Envelope): Promise<void> {
        /*
        const SQL = knex('t_envelope_evp')//
            .update({
                evp_name: envelope.name,
                evp_current_amount: envelope.funds,
                evp_target_amount: envelope.amount,
                evp_target_period: envelope.period.toString(),
                evp_due_date: envelope.dueDate,
                evp_category_id: envelope.category_id,
            })//
            .where('evp_id', envelope._id)
            .toString();
        */

        console.log('Update ', envelope.period.toString() );

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

    remove(envelope: Envelope): Promise<void> {
        /*
        const SQL = knex('t_envelope_evp')
        .where('evp_id', envelope._id)//
        .del()//
        .toString();
        */
        const SQL = `DELETE FROM t_envelope_evp WHERE evp_id = ?`;

        return new Promise((resolve, reject) => {
            sqlite_client().transaction(tx => {
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
