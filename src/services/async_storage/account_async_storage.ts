import { AsyncStorage } from "react-native";
import uuid from 'react-native-uuid';
import _ from "lodash";

import { BankAccount, BankAccountDao } from "../account";
import { acc } from "react-native-reanimated";

export class BankAccountDaoStorage extends BankAccountDao {

    async load() : Promise<BankAccount[]> {
        const json_accounts = await AsyncStorage.getItem('accounts');
        if( json_accounts ) {
            return JSON.parse(json_accounts) ;
        }
        return [];
    }

    find(selector: any) : Promise<BankAccount|null> {
        return this.load().then(accounts => {
            const result = _.find(accounts, account => account._id === selector);
            return result ? result : null;
        });
    }

    async save(accounts: BankAccount[]) {
        
        return await AsyncStorage.setItem('accounts', JSON.stringify(accounts));

    }

    add(account: BankAccount): Promise<string|number|undefined> {
        account._id = uuid.v4() as string;
        return this.load().then(accounts => {
            accounts.push(account);
            return this.save(accounts).then(v => account._id);
        });
    }

    addAll(accounts: BankAccount[]): Promise<string[] | number[] | undefined[]> {
        throw new Error("Method not implemented.");
    }

    update(account: BankAccount): Promise<void> {
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

    remove(account: BankAccount): Promise<void> {
        return this.load().then(accounts => {
            accounts = _.remove(accounts, act => act._id != account._id);
            return this.save(accounts);
        });
    }

}
