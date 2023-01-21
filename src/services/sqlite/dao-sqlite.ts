import * as SQLite from "expo-sqlite";
import { AccountDao } from '../account';
import { EnvelopeCategoryDao, EnvelopeDao } from '../envelope';
import { RevenueDao } from "../revenue";
import { SettingsDao } from '../settings';
import { AccountTransactionDao, EnvelopeTransactionDao } from '../transaction';
import { AccountDaoSQLite } from './account-sqlite';
import { DatabaseManagerSQLite } from './database-manager-sqlite';
import { EnvelopeCategorySQLiteDao, EnvelopeSQLiteDao } from './envelope-sqlite';
import { RevenueDaoSQLite } from "./revenue-sqlite";
import { SettingsDaoSQLite } from './settings-sqlite';
import { AccountTransactionDaoSQLite, EnvelopeTransactionDaoSQLite } from './transaction-sqlite';

const SQLITE_VERSION = "1.0";


export const sqlite_client = SQLite.openDatabase('easy_budget.db', SQLITE_VERSION, "", 1, (db) => {
    new DatabaseManagerSQLite(db).init();
});


export const SQLITE_DAO : {[key: string] : any } = {

    [AccountDao.name]: new AccountDaoSQLite(),
    [RevenueDao.name]: new RevenueDaoSQLite(),
    
    [EnvelopeCategoryDao.name]: new EnvelopeCategorySQLiteDao(),
    [EnvelopeDao.name]: new EnvelopeSQLiteDao(),
    
    [EnvelopeTransactionDao.name]: new EnvelopeTransactionDaoSQLite(),
    [AccountTransactionDao.name]: new AccountTransactionDaoSQLite(),

};


