import { AsyncStorage } from "react-native";
import { AccountDao } from "../account";
import { EnvelopeCategoryDao, EnvelopeDao } from "../envelope";
import { RevenueDao } from "../revenue";
import { SettingsDao } from "../settings";
import { AccountTransactionDao, EnvelopeTransactionDao } from "../transaction";
import { AccountDaoStorage } from "./account_async_storage";
import { DatabaseManagerAsyncStorage } from "./database-manager-storage";
import { EnvelopeCategoryDaoStorage, EnvelopeDaoStorage } from "./envelope-async-storage";
import { RevenueDaoStorage } from "./revenue-storage";
import { SettingsDaoStorage } from "./settings_async_storage";
import { AccountTransactionDaoStorage, EnvelopeTransactionDaoStorage } from "./transaction_async_storage";


export const DB_MANAGER_ASYNC = new DatabaseManagerAsyncStorage();

export const ASYNC_STORAGE_DAO : {[key: string] : any } = {

    // [DatabaseManager.name]: new DatabaseManagerAsyncStorage(),
    
    [AccountDao.name]: new AccountDaoStorage(),
    [RevenueDao.name]: new RevenueDaoStorage(),
    [SettingsDao.name]: new SettingsDaoStorage(),
    
    [EnvelopeCategoryDao.name]: new EnvelopeCategoryDaoStorage(),
    [EnvelopeDao.name]: new EnvelopeDaoStorage(),
    
    [EnvelopeTransactionDao.name]: new EnvelopeTransactionDaoStorage(),
    [AccountTransactionDao.name]: new AccountTransactionDaoStorage(),
};
