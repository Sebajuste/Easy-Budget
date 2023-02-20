import { AccountDao } from '../account';
import { EnvelopeDao } from '../envelope';
import { CategoryDao } from '../category';
import { RevenueDao } from "../revenue";
import { AccountTransactionDao, EnvelopeTransactionDao } from '../transaction';

import { AccountDaoSQLite } from './account-sqlite';
import { CategorySQLiteDao } from './category-sqlite';
import { EnvelopeSQLiteDao } from './envelope-sqlite';
import { RevenueDaoSQLite } from "./revenue-sqlite";
import { AccountTransactionDaoSQLite, EnvelopeTransactionDaoSQLite } from './transaction-sqlite';
import { DaoType } from '../dao';

export { DB_MANAGER_SQLite } from './database-manager-sqlite';


export const SQLITE_DAO : Map<string, any> = new Map<string, any>([
    [AccountDao.name, new  AccountDaoSQLite() ],
    [RevenueDao.name, new  RevenueDaoSQLite() ],

    [CategoryDao.name, new  CategorySQLiteDao() ],
    [EnvelopeDao.name, new  EnvelopeSQLiteDao() ],

    [EnvelopeTransactionDao.name, new  EnvelopeTransactionDaoSQLite() ],
    [AccountTransactionDao.name, new  AccountTransactionDaoSQLite() ],
]);

/*
export const SQLITE_DAO : {[key: DaoType] : any } = {

    [AccountDao.name]: new AccountDaoSQLite(),
    [RevenueDao.name]: new RevenueDaoSQLite(),
    
    [CategoryDao.name]: new CategorySQLiteDao(),
    [EnvelopeDao.name]: new EnvelopeSQLiteDao(),
    
    [EnvelopeTransactionDao.name]: new EnvelopeTransactionDaoSQLite(),
    [AccountTransactionDao.name]: new AccountTransactionDaoSQLite(),

};
*/

