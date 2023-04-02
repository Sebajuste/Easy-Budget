import { InstallSQLite } from "./install";
import { RepairSQLite } from "./repair";
import { SchemaAction } from "./schema-sqlite";
import { UpgradeSQLite_1_0_1 } from "./upgrade-1.0.1";
import { UpgradeSQLite_1_0_2 } from "./upgrade-1.0.2";

export const SCHEMA_ACTIONS : {[version:string]:SchemaAction} = {
    'install' : new InstallSQLite(),
    'repair': new RepairSQLite(),
    '1.0.0': new UpgradeSQLite_1_0_1(),
    '1.0.1': new UpgradeSQLite_1_0_2(),
}
