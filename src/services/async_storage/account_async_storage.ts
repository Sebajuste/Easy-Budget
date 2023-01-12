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

}
