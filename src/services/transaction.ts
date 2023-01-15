
export interface EnvelopeTransaction {
    _id: string | number;
    name: string;
    amount: number;
    envelope_id: string;
    account_id: string | number;
    date: Date;
}

export abstract class EnvelopeTransactionDao {

    abstract load() : Promise<EnvelopeTransaction[]>;

    abstract add(transaction: EnvelopeTransaction): Promise<string|number|undefined>;

    abstract addAll(transactions : EnvelopeTransaction[]) : Promise<boolean[]>;

    abstract remove(transaction: EnvelopeTransaction): Promise<boolean>;

}


export interface AccountTransaction {
    _id: string | number;
    name: string;
    amount: number;
    envelope_id: string;
    account_id: string | number;
    date: Date;
    reconciled: boolean;
}

export abstract class AccountTransactionDao {

    abstract load() : Promise<AccountTransaction[]>;

    abstract add(transaction: AccountTransaction): Promise<string|number|undefined>;

    abstract addAll(transactions : AccountTransaction[]) : Promise<boolean[]>;

    abstract remove(transaction: AccountTransaction): Promise<boolean>;

}