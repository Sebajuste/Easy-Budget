import { DAO } from "./dao";
import { Envelope } from "./envelope";

export interface EnvelopeTransaction {
    _id: string | number;
    name: string;
    amount: number;
    envelope_id: string;
    account_id: string | number;
    date: Date;
}

export abstract class EnvelopeTransactionDao extends DAO<EnvelopeTransaction> {

    abstract load() : Promise<EnvelopeTransaction[]>;

    abstract range(envelope:Envelope, from:Date, to:Date) : Promise<EnvelopeTransaction[]>;

    abstract add(transaction: EnvelopeTransaction): Promise<string|number|undefined>;

    abstract addAll(transactions : EnvelopeTransaction[]) : Promise<(string|number|undefined)[]>;

    abstract remove(transaction: EnvelopeTransaction): Promise<void>;

}


export enum TransactionType {
    INCOME = 'INCOME',
    OUTCOME = 'OUTCOME'
}

export interface AccountTransaction {
    _id: string | number;
    name: string;
    amount: number;
    envelope_id: string | number;
    account_id: string | number;
    type: TransactionType;
    date: Date;
    reconciled: boolean;
    color?: string;
}

export abstract class AccountTransactionDao extends DAO<AccountTransaction> {

    abstract load() : Promise<AccountTransaction[]>;

    abstract add(transaction: AccountTransaction): Promise<string|number|undefined>;

    abstract addAll(entry : AccountTransaction[]) : Promise<(string|number|undefined)[]>;

    abstract update(transaction : AccountTransaction) : Promise<void>;

    abstract remove(transaction: AccountTransaction): Promise<void>;



}