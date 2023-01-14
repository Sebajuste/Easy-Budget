import { Account, AccountDao } from "../account";
import { sqlite_client } from "./dao-sqlite";


export class AccountDaoSQLite extends AccountDao {

    load(): Promise<Account[]> {

   
        return new Promise((resolve, reject) => {

            sqlite_client.transaction(tx => {

                tx.executeSql(`
                    SELECT act_id as _id,
                        act_name as name,
                        act_balance as balance,
                        act_envelope_balance as envelope_balance,
                        act_created_at as created_at
                    FROM t_account_act
                `, [], (_, { rows: {_array} }) => {
                    resolve(_array);
                });

            });

        });
    }

    save(accounts: Account[]): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
