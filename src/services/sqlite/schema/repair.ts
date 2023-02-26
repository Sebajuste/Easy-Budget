import { WebSQLDatabase } from "expo-sqlite";
import { SchemaAction } from "./schema-sqlite";



export class RepairSQLite implements SchemaAction {

    action(client: WebSQLDatabase): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
