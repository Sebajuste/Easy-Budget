
export enum TransactionType {
    FILL, PAIMENT
}

export interface Transaction {
    _id: string;
    name: string;
    transactionType: TransactionType;
    amount: number;
    envelope_id: string;
    account_id: string;
    date: Date;
    reconciled: boolean;
}

export abstract class TransactionDao {

    abstract load() : Promise<Transaction[]>;

    abstract save(transactions: Transaction[]) : Promise<void>;

    abstract add(transaction: Transaction): Promise<boolean>;

    abstract remove(transaction: Transaction): Promise<boolean>;

}