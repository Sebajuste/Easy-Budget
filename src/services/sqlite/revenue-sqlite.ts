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
        SELECT rev_id as _id,
            rev_name as name,
            rev_amount as amount,
            rev_expect_date as expectDate
        FROM t_revenue_rev
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

    find(selector: any) : Promise<Revenue|null> {
        throw new Error("Method not implemented.");
    }

    add(revenue: Revenue): Promise<string | number | undefined> {

        console.log('add ', revenue);

        const SQL = 'INSERT INTO t_revenue_rev (rev_name, rev_amount, rev_expect_date) VALUES (?, ?, ?)';

        const params = [revenue.name, revenue.amount, revenue.expectDate ];

        return new Promise((resolve, reject) => {
            this.client.transaction(tx => {
                tx.executeSql(SQL, params, (_, { insertId }) => {
                    resolve(insertId);
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
        const SQL = `UPDATE t_revenue_rev
        SET rev_name = ?,
            rev_amount = ?,
            rev_expect_date = ?
        WHERE rev_id = ?`;

        const params = [revenue.name, revenue.amount, revenue.expectDate, revenue._id];

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