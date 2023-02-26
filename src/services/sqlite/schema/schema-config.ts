import { InstallSQLite } from "./install";
import { RepairSQLite } from "./repair";
import { SchemaAction } from "./schema-sqlite";
import { UpgradeSQLite1_1_0 } from "./upgrade-1.1.0";

export const SCHEMA_ACTIONS : {[version:string]:SchemaAction} = {
    'install' : new InstallSQLite(),
    'repair': new RepairSQLite(),
    // '1.0.0': new UpgradeSQLite1_1_0()
}
