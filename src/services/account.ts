
export interface Account {
    _id: string;
    name: string;
    balance: number;
    envelope_balance: number;
}

export interface AccountOperation {
    _id: string;
    name: string;
    amount: number;
    date: Date;
}

export interface EnvelopeFill {
    _id: string;
    amount: number;
    envelope_id: string;
    account_id: string;
    date: Date;
}

export abstract class AccountDao {

    abstract load() : Promise<Account[]>;

    abstract save(accounts: Account[]) : Promise<void>

}