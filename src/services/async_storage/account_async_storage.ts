import { AsyncStorage } from "react-native";
import { Account, AccountDao } from "../account";

export class AccountDaoStorage extends AccountDao {

    async load() : Promise<Account[]> {
        const json_accounts = await AsyncStorage.getItem('accounts');
        if( json_accounts ) {
            return JSON.parse(json_accounts) ;
        }
        return [];
    }

    async save(accounts: Account[]) {
       
        return await AsyncStorage.setItem('accounts', JSON.stringify(accounts));

    }

    add(account: Account): Promise<void> {
        return this.load().then(accounts => {
            accounts.push(account);
            return this.save(accounts);
        });
    }

    update(account: Account): Promise<void> {
        throw new Error("Method not implemented.");
    }

    delete(account: Account): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
