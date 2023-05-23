import { DAO } from "./dao";

export interface BankAccount {
    _id: string | number;
    name: string;
    created_at: Date;
    balance: number;
    total_reconciled: number;
}

export abstract class BankAccountDao extends DAO<BankAccount> {

    abstract load() : Promise<BankAccount[]>;

    // abstract save(accounts: Account[]) : Promise<void>;

    abstract add(account: BankAccount) : Promise<number|string|undefined>;

    abstract update(account: BankAccount) : Promise<void>;

    abstract remove(account: BankAccount) : Promise<void>;

}