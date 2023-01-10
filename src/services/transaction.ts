export interface Transaction {
    _id: string;
    name: string;
    amount: number;
    envelope_id: string;
    account_id: string;
    date: Date;
    reconciled: boolean;
}

export interface TransactionDao {

    load() : Promise<Transaction[]>;

    save(transactions: Transaction[]) : Promise<void>;

    add(transaction: Transaction): Promise<boolean>;

    remove(transaction: Transaction): Promise<boolean>;

}