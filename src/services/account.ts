import { DAO } from "./dao";

export interface Account {
    _id: string | number;
    name: string;
    balance: number;
    initial_balance: number;
    envelope_balance: number;
    created_at: Date;
    total_reconciled?: number;
}

export abstract class AccountDao extends DAO<Account> {

    abstract load() : Promise<Account[]>;

    // abstract save(accounts: Account[]) : Promise<void>;

    abstract add(account: Account) : Promise<number|string|undefined>;

    abstract update(account: Account) : Promise<void>;

    abstract remove(account: Account) : Promise<void>;

}