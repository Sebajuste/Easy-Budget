import { Account, AccountDao } from "../account";
import { sqlite_client } from "./database-manager-sqlite";



export class AccountDaoSQLite extends AccountDao {
    
    addAll(entry: Account[]): Promise<string[] | number[] | undefined[]> {
        throw new Error("Method not implemented.");
    }

    load(): Promise<Account[]> {
       const SQL = `
        SELECT act_id as _id,
            act_name as name,
            act_balance as balance,
            act_envelope_balance as envelope_balance,
            act_created_at as created_at
        FROM t_account_act
        `;

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

    save(accounts: Account[]): Promise<void> {
        throw new Error("Method not implemented.");
    }

    add(account: Account) : Promise<string|number|undefined> {

        const SQL = `INSERT INTO t_account_act (
            act_name,
            act_balance,
            act_envelope_balance
        ) VALUES (?, ?, ?)`;

        const params = [account.name, account.balance, account.envelope_balance];

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

    update(account: Account) : Promise<void> {

        const SQL = `UPDATE t_account_act
            SET act_name = ?,
                act_balance = ?,
                act_envelope_balance = ?,
                act_created_at = ?
            WHERE act_id = ?`;

        const params = [account.name, account.balance, account.envelope_balance, account.created_at.toISOString()];
        
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

    remove(account: Account) : Promise<void> {

        /*
        const SQL = knex('t_account_act')
        .where('act_id', account._id)//
        .del()//
        .toString();
        */

        const SQL = 'DELETE FROM t_account_act WHERE act_id = ?';

        return new Promise((resolve, reject) => {
            sqlite_client().transaction(tx => {
                tx.executeSql(SQL, [account._id], (_, { rows: {_array} }) => {
                    resolve();
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });
    }

}
