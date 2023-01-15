import { AsyncStorage } from "react-native";
import { AccountDao } from "../account";
import { DatabaseManager } from "../dao-manager";
import { EnvelopeCategoryDao, EnvelopeDao } from "../envelope";
import { DEFAULT_SETTINGS, SettingsDao } from "../settings";
import { AccountTransactionDao, EnvelopeTransactionDao } from "../transaction";
import { AccountDaoStorage } from "./account_async_storage";
import { EnvelopeCategoryDaoStorage, EnvelopeDaoStorage } from "./envelope-async-storage";
import { SettingsDaoStorage } from "./settings_async_storage";
import { AccountTransactionDaoDaoStorage, EnvelopeTransactionDaoStorage } from "./transaction_async_storage";


class DatabaseManagerAsyncStorange extends DatabaseManager {

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
        await AsyncStorage.setItem('settings', JSON.stringify(DEFAULT_SETTINGS));
    }

}

export const ASYNC_STORAGE_DAO = {

    [DatabaseManager.name]: new DatabaseManagerAsyncStorange(),
    [AccountDao.name]: new AccountDaoStorage(),
    [EnvelopeCategoryDao.name]: new EnvelopeCategoryDaoStorage(),
    [EnvelopeDao.name]: new EnvelopeDaoStorage(),
    [SettingsDao.name]: new SettingsDaoStorage(),
    [EnvelopeTransactionDao.name]: new EnvelopeTransactionDaoStorage(),
    [AccountTransactionDao.name]: new AccountTransactionDaoDaoStorage(),

};
