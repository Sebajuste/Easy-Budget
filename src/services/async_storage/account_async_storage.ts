import { AsyncStorage } from "react-native";
import uuid from 'react-native-uuid';
import _ from "lodash";

import { Account, AccountDao } from "../account";
import { acc } from "react-native-reanimated";

export class AccountDaoStorage extends AccountDao {

    async load() : Promise<Account[]> {
        const json_accounts = await AsyncStorage.getItem('accounts');
        if( json_accounts ) {
            return JSON.parse(json_accounts) ;
        }
        return [];
    }

    find(selector: any) : Promise<Account|null> {
        return this.load().then(accounts => {
            const result = _.find(accounts, account => account._id === selector);
            return result ? result : null;
        });
    }

    async save(accounts: Account[]) {
        
        return await AsyncStorage.setItem('accounts', JSON.stringify(accounts));

    }

    add(account: Account): Promise<string|number|undefined> {
        account._id = uuid.v4() as string;
        return this.load().then(accounts => {
            accounts.push(account);
            return this.save(accounts).then(v => account._id);
        });
    }

    addAll(accounts: Account[]): Promise<string[] | number[] | undefined[]> {
        throw new Error("Method not implemented.");
    }

    update(account: Account): Promise<void> {
        return this.load().then(accounts => {
            const result = _.find(accounts, item => item._id == account._id );
            if( result ) {
                result.name = account.name;
                result.balance = account.balance;
                return this.save(accounts);
            }
            throw new Error('Cannot find item');
        });
    }

    remove(account: Account): Promise<void> {
        return this.load().then(accounts => {
            accounts = _.remove(accounts, act => act._id != account._id);
            return this.save(accounts);
        });
    }

}
