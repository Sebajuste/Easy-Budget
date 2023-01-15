
export interface Account {
    _id: string | number;
    name: string;
    balance: number;
    envelope_balance: number;
    created_at: Date;
}

export abstract class AccountDao {

    abstract load() : Promise<Account[]>;

    // abstract save(accounts: Account[]) : Promise<void>;

    abstract add(account: Account) : Promise<number|string|undefined>;

    abstract update(account: Account) : Promise<void>;

    abstract delete(account: Account) : Promise<void>;

}