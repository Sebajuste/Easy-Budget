import { AsyncStorage } from "react-native";
import { AccountDao } from "../account";
import { CategoryDao } from "../category";
import { EnvelopeDao } from "../envelope";
import { RevenueDao } from "../revenue";
import { SettingsDao } from "../settings";
import { AccountTransactionDao, EnvelopeTransactionDao } from "../transaction";

import { AccountDaoStorage } from "./account_async_storage";
import { DatabaseManagerAsyncStorage } from "./database-manager-storage";
import { CategoryDaoStorage } from "./category-async-storage";
import { EnvelopeDaoStorage } from "./envelope-async-storage";
import { RevenueDaoStorage } from "./revenue-storage";
import { SettingsDaoStorage } from "./settings_async_storage";
import { AccountTransactionDaoStorage, EnvelopeTransactionDaoStorage } from "./transaction_async_storage";
import { DAO } from "../dao";



export const DB_MANAGER_ASYNC = new DatabaseManagerAsyncStorage();

export const ASYNC_STORAGE_DAO : Map<string, DAO<any> > = new Map<string, DAO<any> >([
    [AccountDao.name, new  AccountDaoStorage() ],
    [RevenueDao.name, new  RevenueDaoStorage() ],

    [CategoryDao.name, new  CategoryDaoStorage() ],
    [EnvelopeDao.name, new  EnvelopeDaoStorage() ],

    [EnvelopeTransactionDao.name, new  EnvelopeTransactionDaoStorage() ],
    [AccountTransactionDao.name, new  AccountTransactionDaoStorage() ],
]);

/*
export const ASYNC_STORAGE_DAO : {[key: string] : any } = {

    [AccountDao.name]: new AccountDaoStorage(),
    [RevenueDao.name]: new RevenueDaoStorage(),
    [SettingsDao.name]: new SettingsDaoStorage(),
    
    [CategoryDao.name]: new CategoryDaoStorage(),
    [EnvelopeDao.name]: new EnvelopeDaoStorage(),
    
    [EnvelopeTransactionDao.name]: new EnvelopeTransactionDaoStorage(),
    [AccountTransactionDao.name]: new AccountTransactionDaoStorage(),
};
*/