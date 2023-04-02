import { InstallSQLite } from "./install";
import { RepairSQLite } from "./repair";
import { SchemaAction } from "./schema-sqlite";
import { UpgradeSQLite_1_0_0 } from "./upgrade-from-1.0.0";
import { UpgradeSQLite_1_0_1 } from "./upgrade-from-1.0.1";

export const SCHEMA_ACTIONS : {[version:string]:SchemaAction} = {
    'install' : new InstallSQLite(),
    'repair': new RepairSQLite(),
    '1.0.0': new UpgradeSQLite_1_0_0(),
    '1.0.1': new UpgradeSQLite_1_0_1(),
}
