import { AccountDaoSQLite } from './account-sqlite';
import { CategorySQLiteDao } from './category-sqlite';
import { EnvelopeSQLiteDao } from './envelope-sqlite';
import { RevenueDaoSQLite } from "./revenue-sqlite";
import { AccountTransactionDaoSQLite, EnvelopeTransactionDaoSQLite } from './transaction-sqlite';
import { DAO, DaoType } from '../dao';
import { SettingsDaoSQLite } from './settings-sqlite';

export { DB_MANAGER_SQLite } from './database-manager-sqlite';


export const SQLITE_DAO : Map<string, DAO<any> > = new Map<string, DAO<any> >([
    [DaoType.ACCOUNT.toString(), new  AccountDaoSQLite() ],
    [DaoType.REVENUE.toString(), new  RevenueDaoSQLite() ],

    [DaoType.CATEGORY.toString(), new  CategorySQLiteDao() ],
    [DaoType.ENVELOPE.toString(), new  EnvelopeSQLiteDao() ],

    [DaoType.ENVELOPE_TRANSACTION.toString(), new  EnvelopeTransactionDaoSQLite() ],
    [DaoType.ACCOUNT_TRANSACTION.toString(), new  AccountTransactionDaoSQLite() ],

    [DaoType.SETTINGS.toString(), new SettingsDaoSQLite()]
]);
