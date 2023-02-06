import { DAO } from "./dao";

export interface Account {
    _id: string | number;
    name: string;
    balance: number;
    envelope_balance: number;
    created_at: Date;
}

export abstract class AccountDao extends DAO<Account> {

    abstract load() : Promise<Account[]>;

    // abstract save(accounts: Account[]) : Promise<void>;

    abstract add(account: Account) : Promise<number|string|undefined>;

    abstract update(account: Account) : Promise<void>;

    abstract remove(account: Account) : Promise<void>;

}