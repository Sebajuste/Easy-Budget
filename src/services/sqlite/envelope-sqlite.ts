import { Envelope, EnvelopeCategory, EnvelopeCategoryDao, EnvelopeDao, Period } from "../envelope";
import { sqlite_client } from "./database-manager-sqlite";

export class EnvelopeCategorySQLiteDao extends EnvelopeCategoryDao {
    
    addAll(entry: EnvelopeCategory[]): Promise<string[] | number[] | undefined[]> {
        throw new Error("Method not implemented.");
    }

    load(): Promise<EnvelopeCategory[]> {
        
        return new Promise((resolve, reject) => {

            /*
            const SQL = knex.select([
                "cat_id as _id",
                "cat_name as name",
            ]).from("t_category_cat")//
            .toString();
            */
            const SQL = `SELECT cat_id as _id, cat_name as name FROM t_category_cat`;

            sqlite_client.transaction(tx => {
                tx.executeSql(SQL, [], (_, { rows: {_array} }) => {
                    resolve(_array);
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });

        });

    }

    add(category: EnvelopeCategory): Promise<string|number|undefined> {
        /*
        const SQL = knex('t_category_cat')//
            .insert({
                 act_name: category.name
            })//
            .toString();
        */

        const SQL = 'INSERT INTO t_category_cat (act_name) VALUES (?';

        return new Promise((resolve, reject) => {
            sqlite_client.transaction(tx => {
                tx.executeSql(SQL, [category.name], (_, { insertId }) => {
                    resolve(insertId);
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });
    }

    update(category: EnvelopeCategory): Promise<void> {
        /*
        const SQL = knex('t_category_cat')//
            .update({
                act_name: category.name
            })//
            .where('cat_id', category._id)
            .toString();
        */

        const SQL = `UPDATE t_category_cat SET act_name = ? WHERE cat_id = ?`;

        const params = [category.name, category._id];

        return new Promise((resolve, reject) => {
            sqlite_client.transaction(tx => {
                tx.executeSql(SQL, params, (_, { rows: {_array} }) => {
                    resolve();
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });
    }

    remove(category: EnvelopeCategory): Promise<void> {
        /*
        const SQL = knex('t_account_act')
        .where('cat_id', category._id)//
        .del()//
        .toString();
        */
        const SQL = `DELETE FROM t_account_act WHERE cat_id = ?`;

        return new Promise((resolve, reject) => {
            sqlite_client.transaction(tx => {
                tx.executeSql(SQL, [category._id], (_, { rows: {_array} }) => {
                    resolve();
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });

    }

}

export class EnvelopeSQLiteDao extends EnvelopeDao {

    addAll(entry: Envelope[]): Promise<string[] | number[] | undefined[]> {
        throw new Error("Method not implemented.");
    }

    load(): Promise<Envelope[]> {
        return new Promise((resolve, reject) => {

            /*
            const SQL = knex.select(
                "evp_id as _id",
                "evp_name as name",
                "evp_current_amount as funds",
                "evp_target_amount as amount",
                knex.raw(`CASE evp_target_period
                    WHEN 'MONTH' THEN '${Period.MONTH}'
                    WHEN 'TRIMESTER' THEN '${Period.TRIMESTER}'
                    WHEN 'SEMESTER' THEN '${Period.SEMESTER}'
                    WHEN 'YEAR' THEN '${Period.YEAR}'
                    ELSE '${Period.MONTH}'
                    END AS period`),
                "evp_due_date as dueDate",
                "evp_category_id as category_id",
            ).from("t_envelopes_evp")//
            .toString();
            */

            const SQL = `
            SELECT evp_id as _id,
                evp_name as name,
                evp_current_amount as funds,
                evp_target_amount as amount,
                CASE evp_target_period
                    WHEN 'MONTH' THEN '${Period.MONTH}'
                    WHEN 'TRIMESTER' THEN '${Period.TRIMESTER}'
                    WHEN 'SEMESTER' THEN '${Period.SEMESTER}'
                    WHEN 'YEAR' THEN '${Period.YEAR}'
                    ELSE '${Period.MONTH}'
                END AS period,
                evp_due_date as dueDate,
                evp_category_id as category_id
            FROM t_envelopes_evp
            `;

            sqlite_client.transaction(tx => {
                tx.executeSql(SQL, [], (_, { rows: {_array} }) => {
                    resolve(_array);
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });

        });
    }

    add(envelope: Envelope): Promise<string|number|undefined> {
        /*
        const SQL = knex('t_envelopes_evp')//
            .insert({
                evp_name: envelope.name,
                evp_current_amount: envelope.funds,
                evp_target_amount: envelope.amount,
                evp_target_period: envelope.period.toString(),
                evp_due_date: envelope.dueDate,
                evp_category_id: envelope.category_id,
            })//
            .toString();
        */
        const SQL = `INSERT INTO t_envelopes_evp (
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
            sqlite_client.transaction(tx => {
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
        const SQL = knex('t_envelopes_evp')//
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
        const SQL = `
            UPDATE t_envelopes_evp
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
            sqlite_client.transaction(tx => {
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
        const SQL = knex('t_envelopes_evp')
        .where('evp_id', envelope._id)//
        .del()//
        .toString();
        */
        const SQL = `DELETE FROM t_envelopes_evp WHERE evp_id = ?`;

        return new Promise((resolve, reject) => {
            sqlite_client.transaction(tx => {
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
