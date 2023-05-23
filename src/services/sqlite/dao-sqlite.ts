import * as SQLite from 'expo-sqlite';

import { BankAccountDaoSQLite } from './account-sqlite';
import { CategorySQLiteDao } from './category-sqlite';
import { EnvelopeSQLiteDao } from './envelope-sqlite';
import { RevenueDaoSQLite } from "./revenue-sqlite";
import { AccountTransactionDaoSQLite, EnvelopeTransactionDaoSQLite, MovementDaoSQLite, TransactionAccountDaoSQLite, TransactionDaoSQLite } from './transaction-sqlite';
import { DAO, DaoType } from '../dao';
import { SettingsDaoSQLite } from './settings-sqlite';

// export { DB_MANAGER_SQLite } from './database-manager-sqlite';

/*
export const SQLITE_DAO : Map<string, DAO<any> > = new Map<string, DAO<any> >([
    [DaoType.ACCOUNT.toString(), new  AccountDaoSQLite() ],
    [DaoType.REVENUE.toString(), new  RevenueDaoSQLite() ],

    // [DaoType.CATEGORY.toString(), new  CategorySQLiteDao(null) ],
    [DaoType.ENVELOPE.toString(), new  EnvelopeSQLiteDao() ],

    [DaoType.ENVELOPE_TRANSACTION.toString(), new  EnvelopeTransactionDaoSQLite() ],
    [DaoType.ACCOUNT_TRANSACTION.toString(), new  AccountTransactionDaoSQLite() ],

    [DaoType.SETTINGS.toString(), new SettingsDaoSQLite()]
]);
*/

export const SQLITE_DAO_FACTORY : Map<string, (client:SQLite.WebSQLDatabase) => DAO<any> > = new Map<string, (client:any) => DAO<any> >([

    [DaoType.BANK_ACCOUNT.toString(), (client:SQLite.WebSQLDatabase) => new BankAccountDaoSQLite(client) ],
    [DaoType.REVENUE.toString(), (client:SQLite.WebSQLDatabase) => new RevenueDaoSQLite(client) ],

    [DaoType.CATEGORY.toString(), (client:SQLite.WebSQLDatabase) => new CategorySQLiteDao(client) ],
    [DaoType.ENVELOPE.toString(), (client:SQLite.WebSQLDatabase) => new EnvelopeSQLiteDao(client) ],

    [DaoType.TRANSACTION.toString(), (client:SQLite.WebSQLDatabase) => new TransactionDaoSQLite(client) ],
    [DaoType.TRANSACTION_MOVEMENT.toString(), (client:SQLite.WebSQLDatabase) => new MovementDaoSQLite(client) ],
    [DaoType.TRANSACTION_ACCOUNT.toString(), (client:SQLite.WebSQLDatabase) => new TransactionAccountDaoSQLite(client) ],

    
    // [DaoType.ENVELOPE_TRANSACTION.toString(), (client:SQLite.WebSQLDatabase) => new EnvelopeTransactionDaoSQLite(client) ],
    // [DaoType.ACCOUNT_TRANSACTION.toString(), (client:SQLite.WebSQLDatabase) => new AccountTransactionDaoSQLite(client) ],

    [DaoType.SETTINGS.toString(), (client:SQLite.WebSQLDatabase) => new SettingsDaoSQLite(client)]
    
]);
