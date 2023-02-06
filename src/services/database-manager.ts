
export abstract class DatabaseManager {
    abstract open() : Promise<void>;
    abstract init() : Promise<void>;
    abstract delete(): Promise<void>;
}
