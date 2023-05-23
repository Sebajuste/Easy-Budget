import { DAO } from "./dao";


export interface Revenue {
    _id : string|number;
    name : string;
    amount : number;
    expectDate: string;
    account_id?: string|number;
}

export abstract class RevenueDao extends DAO<Revenue> {

    abstract load(): Promise<Revenue[]>;

    abstract add(revenue: Revenue): Promise<string | number | undefined>;

    abstract addAll(revenue: Revenue[]): Promise<(string | number | undefined)[]>;

    abstract update(revenue: Revenue): Promise<void>;

    abstract remove(revenue: Revenue): Promise<void>;

}
