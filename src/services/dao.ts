
export enum DaoType {
    ACCOUNT = "AccountDao",
    REVENUE = "RevenueDao",
    SETTINGS = "SettingsDao",
    CATEGORY = "CategoryDao",
    ENVELOPE = "EnvelopeDao",
    ENVELOPE_TRANSACTION = "EnvelopeTransactionDao",
    ACCOUNT_TRANSACTION = "AccountTransactionDao"
  }

export abstract class DAO<T> {

    abstract load() : Promise<T[]>;
  
    abstract add(entry : T) : Promise<string|number|undefined>;
  
    abstract addAll(entry : T[]) : Promise<(string|number|undefined)[]>;
  
    abstract update(entry : T) : Promise<void>;
  
    abstract remove(entry : T) : Promise<void>;
  
}

