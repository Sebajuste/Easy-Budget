import { BudgetCategory, BudgetOperation } from "../budget";
import { BudgetOperationDao } from "../budget_dao";
import { sqlite } from "./budget_dao_sqlite";


export class BudgetOperationDaoSQLite implements BudgetOperationDao {

    getFromCategory(budgetCategory: BudgetCategory) : Promise<BudgetOperation[]> {

        sqlite.transaction(tx => {

            tx.executeSql(`SELECT * FROM t_budget_operations_bop INNER JOIN tj_budget_category_operation_bco ON bco_operation_id = bop_id WHERE bco_category_id = ?`, [budgetCategory._id!], (_, {rows}) => {
                if( rows && rows.length > 0) {
                    const budget_operation = {
                        _id: rows.item(0).bop_id,
                        name:  rows.item(0).bop_name,
                        value: rows.item(0).bop_value,
                        type: rows.item(0).bop_value,
                        dueDate: rows.item(0).bop_value,
                    }
                }
            });

        });

    }

    create(operation: BudgetOperation) : Promise<void> {

    }

    update(_id : number, operation : BudgetOperation) : Promise<void> {

    }

    delete(operation : BudgetOperation) : Promise<void> {

    }

}
