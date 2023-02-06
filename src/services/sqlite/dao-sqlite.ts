import { AccountDao } from '../account';
import { EnvelopeCategoryDao, EnvelopeDao } from '../envelope';
import { RevenueDao } from "../revenue";
import { AccountTransactionDao, EnvelopeTransactionDao } from '../transaction';
import { AccountDaoSQLite } from './account-sqlite';
import { EnvelopeCategorySQLiteDao, EnvelopeSQLiteDao } from './envelope-sqlite';
import { RevenueDaoSQLite } from "./revenue-sqlite";
import { AccountTransactionDaoSQLite, EnvelopeTransactionDaoSQLite } from './transaction-sqlite';

export { DB_MANAGER_SQLite } from './database-manager-sqlite';

export const SQLITE_DAO : {[key: string] : any } = {

    [AccountDao.name]: new AccountDaoSQLite(),
    [RevenueDao.name]: new RevenueDaoSQLite(),
    
    [EnvelopeCategoryDao.name]: new EnvelopeCategorySQLiteDao(),
    [EnvelopeDao.name]: new EnvelopeSQLiteDao(),
    
    [EnvelopeTransactionDao.name]: new EnvelopeTransactionDaoSQLite(),
    [AccountTransactionDao.name]: new AccountTransactionDaoSQLite(),

};


