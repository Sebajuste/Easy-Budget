import { Revenue, RevenueDao } from "../revenue";
import { sqlite_client } from "./database-manager-sqlite";


export class RevenueDaoSQLite extends RevenueDao {

    load(): Promise<Revenue[]> {

        console.log('RevenueDaoSQLite::load')

        const SQL = `
        SELECT rev_id as _id,
            rev_name as name,
            rev_amount as amount
        FROM t_revenue_rev
        `;

        return new Promise((resolve, reject) => {
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

    add(revenue: Revenue): Promise<string | number | undefined> {

        const SQL = 'INSERT INTO t_revenue_rev (rev_name, rev_amount) VALUES (?, ?)';

        const params = [revenue.name, revenue.amount];

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

    addAll(revenue: Revenue[]): Promise<(string | number | undefined)[]> {

        throw new Error("Method not implemented.");
    }

    update(revenue: Revenue): Promise<void> {
        const SQL = `UPDATE t_revenue_rev
        SET rev_name = ?,
            rev_amount = ?
        WHERE rev_id = ?`;

        const params = [revenue.name, revenue.amount, revenue._id];

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

    remove(revenue: Revenue): Promise<void> {

        const SQL = 'DELETE FROM t_revenue_rev WHERE rev_id = ?';

        return new Promise((resolve, reject) => {
            sqlite_client.transaction(tx => {
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