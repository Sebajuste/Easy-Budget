import { Revenue, RevenueDao } from "../revenue";


export class RevenueDaoSQLite extends RevenueDao {

    load(): Promise<Revenue[]> {
        throw new Error("Method not implemented.");
    }

    add(entry: Revenue): Promise<string | number | undefined> {
        throw new Error("Method not implemented.");
    }

    addAll(entry: Revenue[]): Promise<(string | number | undefined)[]> {
        throw new Error("Method not implemented.");
    }

    update(entry: Revenue): Promise<void> {
        throw new Error("Method not implemented.");
    }

    remove(entry: Revenue): Promise<void> {
        throw new Error("Method not implemented.");
    }

}