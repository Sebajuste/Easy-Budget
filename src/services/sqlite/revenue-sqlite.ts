import * as SQLite from 'expo-sqlite';
import _ from "lodash";

import { Revenue, RevenueDao } from "../revenue";
import assert from '../../util/assert';


export class RevenueDaoSQLite extends RevenueDao {

    private client : SQLite.WebSQLDatabase;

    constructor(client: SQLite.WebSQLDatabase) {
        super();
        assert( client );
        this.client = client;
    }

    load(): Promise<Revenue[]> {

        const SQL = `
        SELECT inc_id as _id,
            acc_name as name,
            inc_amount as amount,
            inc_expect_date as expectDate,
            acc_id as account_id
        FROM t_income_inc
            INNER JOIN t_account_acc
                ON acc_id = inc_account_id
        `;

        return new Promise((resolve, reject) => {
            this.client.transaction(tx => {
                tx.executeSql(SQL, [], (_, { rows: {_array} }) => {
                    resolve( _array );
                    /*
                    resolve( _array.map(item => {
                        item.expectDate = new Date(item.expectDate);
                        return item;
                    }) );
                    */
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });
    }

    find(selector: {_id: string|number}) : Promise<Revenue|null> {

        const SQL = `
        SELECT inc_id as _id,
            acc_name as name,
            inc_amount as amount,
            inc_expect_date as expectDate,
            acc_id as account_id
        FROM t_income_inc
            INNER JOIN t_account_acc
                ON acc_id = inc_account_id
        WHERE inc_id = ?
        `;

        return new Promise((resolve, reject) => {

            this.client.transaction(tx => {

                tx.executeSql(SQL, [selector._id], (tx, {rows : {_array}}) => {
                    resolve( _.head(_array) );
                }, (tx, err) => {
                    reject(err);
                    return true;
                });

            });

        });
    }

    add(revenue: Revenue): Promise<string | number | undefined> {

        console.log('add ', revenue);

        const SQL_ACCOUNT = `INSERT INTO t_account_acc (acc_name, acc_type) VALUES (?, 'Income')`;

        const SQL_INCOME = `INSERT INTO t_income_inc (inc_account_id, inc_amount, inc_expect_date) VALUES (?, ?, ?)`;

        return new Promise((resolve, reject) => {
            this.client.transaction(tx => {

                tx.executeSql(SQL_ACCOUNT, [revenue.name], (_, { insertId }) => {
                    
                    if( insertId ) {
                        const params = [insertId, revenue.amount, revenue.expectDate ];

                        tx.executeSql(SQL_INCOME, params, (_, { insertId }) => {
                            resolve(insertId);
                        }, (tx, err) => {
                            reject(err);
                            return true;
                        });
                    } else {
                        throw new Error('Cannot insert income account');
                    }

                }, (tx, err) => {
                    reject(err);
                    return true;
                });


                
            });
        });
    }

    addAll(revenue: Revenue[]): Promise<(string | number | undefined)[]> {

        throw new Error("Method not implemented.");
    }

    update(revenue: Revenue): Promise<void> {

        const SQL_ACCOUNT = `UPDATE t_account_acc
        SET acc_name = ?
        WHERE acc_id = (SELECT inc_account_id FROM t_income_inc WHERE inc_id = ?)`;

        const SQL_INCOME = `UPDATE t_income_inc
        SET inc_amount = ?,
            inc_expect_date = ?
        WHERE inc_id = ?`;


        return new Promise((resolve, reject) => {
            this.client.transaction(tx => {

                tx.executeSql(SQL_ACCOUNT, [revenue.name, revenue._id], (_, { rows: {_array} }) => {
                    resolve();
                }, (tx, err) => {
                    reject(err);
                    return true;
                });

                const params = [revenue.amount, revenue.expectDate, revenue._id];

                tx.executeSql(SQL_INCOME, params, (_, { rows: {_array} }) => {
                    resolve();
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });
    }

    remove(revenue: Revenue): Promise<void> {

        const SQL = 'DELETE FROM t_revenue_rev WHERE rev_id = ?';

        return new Promise((resolve, reject) => {
            this.client.transaction(tx => {
                tx.executeSql(SQL, [revenue._id], (_, { rows: {_array} }) => {
                    resolve();
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });
    }

}