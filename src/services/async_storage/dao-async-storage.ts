import { AccountDao } from "../account";
import { EnvelopeCategoryDao, EnvelopeDao } from "../envelope";
import { SettingsDao } from "../settings";
import { TransactionDao } from "../transaction";
import { AccountDaoStorage } from "./account_async_storage";
import { EnvelopeCategoryDaoStorage, EnvelopeDaoStorage } from "./envelope-async-storage";
import { SettingsDaoStorage } from "./settings_async_storage";
import { TransactionDaoStorage } from "./transaction_async_storage";


export const ASYNC_STORAGE_DAO = {

    [AccountDao.name]: new AccountDaoStorage(),
    [EnvelopeCategoryDao.name]: new EnvelopeCategoryDaoStorage(),
    [EnvelopeDao.name]: new EnvelopeDaoStorage(),
    [SettingsDao.name]: new SettingsDaoStorage(),
    [TransactionDao.name]: new TransactionDaoStorage()

};
