import { Account, AccountDao } from "../account";
import { sqlite_client } from "./dao-sqlite";



export class AccountDaoSQLite extends AccountDao {

    load(): Promise<Account[]> {

        /*
        const SQL = knex.select([
            "act_id as _id",
            "act_name as name",
            "act_balance as balance",
            "act_envelope_balance as envelope_balance",
            "act_created_at as created_at"
        ]).from("t_account_act")//
        .toString();
        */
       const SQL = '';

        return new Promise((resolve, reject) => {
            sqlite_client.transaction(tx => {
                tx.executeSql(SQL, [], (_, { rows: {_array} }) => {
                    resolve(_array);
                });

            });

        });
    }

    save(accounts: Account[]): Promise<void> {
        throw new Error("Method not implemented.");
    }

    add(account: Account) : Promise<string|number|undefined> {

        /*
        const SQL = knex('t_account_act')
        .insert({
            act_id: account._id,
            act_name: account.name,
            act_balance: account.balance,
            act_envelope_balance: account.envelope_balance,
            act_created_at: account.created_at
        })
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

    update(account: Account) : Promise<void> {
        /*
        const SQL = knex('t_account_act')
            .update({
                act_name: account.name,
                act_balance: account.balance,
                act_envelope_balance: account.envelope_balance,
                act_created_at: account.created_at
            })
            .where('act_id', account._id)
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

    delete(account: Account) : Promise<void> {

        /*
        const SQL = knex('t_account_act')
        .where('act_id', account._id)//
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
