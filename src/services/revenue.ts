import { DAO } from "./dao";


export interface Revenue {
    _id : string|number;
    name : string;
    amount : number;
}

export abstract class RevenueDao extends DAO<Revenue> {

    abstract load(): Promise<Revenue[]>;

    abstract add(entry: Revenue): Promise<string | number | undefined>;

    abstract addAll(entry: Revenue[]): Promise<(string | number | undefined)[]>;

    abstract update(entry: Revenue): Promise<void>;

    abstract remove(entry: Revenue): Promise<void>;

}
