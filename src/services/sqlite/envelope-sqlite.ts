import { Envelope, EnvelopeCategory, EnvelopeCategoryDao, EnvelopeDao, Period } from "../envelope";
import { sqlite_client } from './dao-sqlite';

export class EnvelopeCategorySQLiteDao extends EnvelopeCategoryDao {

    load(): Promise<EnvelopeCategory[]> {
        
        return new Promise((resolve, reject) => {

            /*
            const SQL = knex.select([
                "cat_id as _id",
                "cat_name as name",
            ]).from("t_category_cat")//
            .toString();
            */
            const SQL = '';

            sqlite_client.transaction(tx => {
                tx.executeSql(SQL, [], (_, { rows: {_array} }) => {
                    resolve(_array);
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
        const SQL = '';
        return new Promise((resolve, reject) => {
            sqlite_client.transaction(tx => {
                tx.executeSql(SQL, [], (_, { insertId }) => {
                    resolve(insertId);
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
       const SQL = '';
        return new Promise((resolve, reject) => {
            sqlite_client.transaction(tx => {
                tx.executeSql(SQL, [], (_, { rows: {_array} }) => {
                    resolve();
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
        const SQL = '';

        return new Promise((resolve, reject) => {
            sqlite_client.transaction(tx => {
                tx.executeSql(SQL, [], (_, { rows: {_array} }) => {
                    resolve();
                });
            });
        });

    }

}

export class EnvelopeSQLiteDao extends EnvelopeDao {

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

            const SQL = '';

            sqlite_client.transaction(tx => {
                tx.executeSql(SQL, [], (_, { rows: {_array} }) => {
                    resolve(_array);
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
        const SQL = '';
        
        return new Promise((resolve, reject) => {
            sqlite_client.transaction(tx => {
                tx.executeSql(SQL, [], (_, { insertId }) => {
                    resolve(insertId);
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
        const SQL = '';
        return new Promise((resolve, reject) => {
            sqlite_client.transaction(tx => {
                tx.executeSql(SQL, [], (_, { rows: {_array} }) => {
                    resolve();
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
        const SQL = '';

        return new Promise((resolve, reject) => {
            sqlite_client.transaction(tx => {
                tx.executeSql(SQL, [], (_, { rows: {_array} }) => {
                    resolve();
                });
            });
        });
    }

}
