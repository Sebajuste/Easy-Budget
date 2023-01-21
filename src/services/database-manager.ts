
export abstract class DatabaseManager {
    abstract init() : Promise<void>;
    abstract delete(): Promise<void>;
}
