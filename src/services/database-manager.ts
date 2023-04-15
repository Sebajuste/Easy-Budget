
export abstract class DatabaseManager {
    abstract dbList() : Promise<string[]>;
    abstract open(dbName:string) : Promise<void>;
    abstract init() : Promise<void>;
    abstract delete(): Promise<void>;
    abstract getLastError(): any;
}
