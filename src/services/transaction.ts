import { DAO } from "./dao";
import { Envelope } from "./envelope";

export interface TransactionAccount {
    _id: string | number;
    name: string;
    description: string;
    type: string;
}

export interface Movement {
    _id: string | number;
    account_id: string | number;
    transaction_id: string | number;
    debit: number;
    credit: number;
    reconciled: boolean;
    name?: string;
    date?: Date | string;
    color?:string;
    icon?:string;
}

export interface Transaction {
    _id: string | number;
    name: string;
    date: Date;
    movements: Movement[];
}

export abstract class TransactionAccountDao extends DAO<TransactionAccount> {

    abstract load() : Promise<TransactionAccount[]>;
  
    abstract add(entry : TransactionAccount) : Promise<string|number|undefined>;
  
    abstract update(entry : TransactionAccount) : Promise<void>;
  
    abstract remove(entry : TransactionAccount) : Promise<void>;

}

export abstract class TransactionDao extends DAO<Transaction> {

    abstract load() : Promise<Transaction[]>;
  
    abstract add(entry : Transaction) : Promise<string|number|undefined>;
  
    abstract update(entry : Transaction) : Promise<void>;
  
    abstract remove(entry : Transaction) : Promise<void>;

}

export abstract class MovementDao extends DAO<Movement> {

    abstract update(entry : Movement) : Promise<void>;

    abstract loadFilter(selector: any): Promise<Movement[]>;

}

/** @deprecated */
export interface EnvelopeTransaction {
    _id: string | number;
    name: string;
    amount: number;
    envelope_id: string;
    account_id: string | number;
    date: Date;
}

/** @deprecated */
export abstract class EnvelopeTransactionDao extends DAO<EnvelopeTransaction> {

    abstract load() : Promise<EnvelopeTransaction[]>;

    abstract range(envelope:Envelope, from:Date, to:Date) : Promise<EnvelopeTransaction[]>;

    abstract add(transaction: EnvelopeTransaction): Promise<string|number|undefined>;

    abstract addAll(transactions : EnvelopeTransaction[]) : Promise<(string|number|undefined)[]>;

    abstract remove(transaction: EnvelopeTransaction): Promise<void>;

}


export enum TransactionType {
    INCOME = 'INCOME',
    OUTCOME = 'OUTCOME',
    TRANSFER = 'TRANSFER'
}

/** @deprecated */
export interface AccountTransaction {
    _id: string | number;
    name: string;
    amount: number;
    envelope_id: string | number;
    account_id: string | number;
    type: TransactionType;
    date: Date;
    reconciled: boolean;
    category_id: string | number;
    icon?: string;
    color?: string;
}

/** @deprecated */
export abstract class AccountTransactionDao extends DAO<AccountTransaction> {

    abstract load() : Promise<AccountTransaction[]>;

    abstract add(transaction: AccountTransaction): Promise<string|number|undefined>;

    abstract addAll(entry : AccountTransaction[]) : Promise<(string|number|undefined)[]>;

    abstract update(transaction : AccountTransaction) : Promise<void>;

    abstract remove(transaction: AccountTransaction): Promise<void>;

    abstract statsForMonth(year: number, month: number): Promise<any[]>;

    abstract statsCategoryForMonth(year: number, month: number, categoryID: string | number) : Promise<any>;

}