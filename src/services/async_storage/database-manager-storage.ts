import { AsyncStorage } from "react-native";
import { DatabaseManager } from "../database-manager";

export class DatabaseManagerAsyncStorage extends DatabaseManager {

    async dbList() : Promise<string[]> {

        return new Promise((resolve) => {
            resolve([]);
        });

    }

    async open(dbName:string) {

    }

    async init(): Promise<void> {
        // throw new Error("Method not implemented.");
        
    }

    async delete(): Promise<void> {
        
        await AsyncStorage.setItem('accounts', JSON.stringify([]));
        await AsyncStorage.setItem('transactions', JSON.stringify([]));
        await AsyncStorage.setItem('envelopes_transactions', JSON.stringify([]));
        await AsyncStorage.setItem('account_transactions', JSON.stringify([]));
        await AsyncStorage.setItem('envelope_categories', JSON.stringify([]));
        await AsyncStorage.setItem('envelopes', JSON.stringify([]));
        await AsyncStorage.setItem('revenues', JSON.stringify([]));
        await AsyncStorage.removeItem('settings');
        
    }

    getLastError() {
        return null;
    }

}
