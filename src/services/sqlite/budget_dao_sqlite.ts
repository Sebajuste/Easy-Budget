import * as SQLite from 'expo-sqlite';
import { SQLiteCallback } from 'expo-sqlite';
import { Text } from 'react-native-rapi-ui';
import { groupBy, GroupedObservable, map, mergeMap, Observable, retry, share, Subscriber, toArray } from "rxjs";
import { BudgetCategory, BudgetOperation, budgetOperationTypeFromString, budgetOperationTypeToString } from '../budget';


const SQLITE_VERSION = "1.0";


function initDatabase(db: SQLite.WebSQLDatabase) {

    db.exec([
        { sql: 'PRAGMA foreign_keys = ON;', args: [] },

        { sql: 'DROP TABLE t_budget_categories_bct', args: []},
        { sql: 'DROP TABLE t_budget_operations_bop', args: []},

        { sql: 'CREATE TABLE IF NOT EXISTS t_budgets_bdg (bdg_id INTEGER PRIMARY KEY NOT NULL)', args: [] },
        { sql: 'CREATE TABLE IF NOT EXISTS t_budget_categories_bct (bct_id INTEGER PRIMARY KEY NOT NULL, bct_name TEXT NOT NULL, bct_fund FLOAT NOT NULL)', args: [] },
        { sql: 'CREATE TABLE IF NOT EXISTS t_budget_operations_bop (bop_id INTEGER PRIMARY KEY NOT NULL, bop_name TEXT NOT NULL, bop_value FLOAT NOT NULL, bop_type TEXT NOT NULL, bop_duedate TIMESTAMP)', args: [] },
        // { sql: 'CREATE TABLE IF NOT EXISTS t_budget_operation_type_bot (bot_id INTEGER PRIMARY KEY, bot_name UNIQUE)', args: [] },

        { sql: 'CREATE TABLE IF NOT EXISTS tj_budget_categories_bdc (bdc_budget_id INTEGER NOT NULL, bdc_category_id INTEGER NOT NULL, PRIMARY KEY(bdc_budget_id, bdc_category_id), FOREIGN KEY(bdc_budget_id) REFERENCES t_budgets_bdg(bdg_id), FOREIGN KEY(bdc_category_id) REFERENCES t_budget_categories_bct(bct_id) )', args: [] },
        { sql: 'CREATE TABLE IF NOT EXISTS tj_budget_category_operation_bco (bco_category_id INTEGER NOT NULL, bco_operation_id INTEGER NOT NULL, PRIMARY KEY(bco_category_id, bco_operation_id), FOREIGN KEY(bco_category_id) REFERENCES t_budget_categories_bct(bct_id), FOREIGN KEY(bco_operation_id) REFERENCES t_budget_operations_bop(bop_id) )', args: [] },
        
        
        
    ], false, () => {
        console.log('Init database done');
    });

}

const db = SQLite.openDatabase('budget', SQLITE_VERSION, "", 1, initDatabase);

export const sqlite = db;


function createSQLiteObservable() : Observable<SQLite.WebSQLDatabase> {

    /*
    return new Observable<SQLite.WebSQLDatabase>(observer => {

        console.log('Database opening');

        const db = SQLite.openDatabase('budget', SQLITE_VERSION, "", 1, initDatabase);

        observer.next(db);
        // observer.complete();

        return () => {
            console.log('Database closing');
            // db.closeAsync();
        };

    }).pipe(
        retry(),
        share()
    );
    */

    return new Observable<SQLite.WebSQLDatabase>(observer => {
        observer.next(db);
    }).pipe(
        retry(),
        share()
    );

}

let SQLiteObservable : Observable<SQLite.WebSQLDatabase>;

export function getSQLiteObservable() : Observable<SQLite.WebSQLDatabase> {

    if( SQLiteObservable == null) {
        SQLiteObservable = createSQLiteObservable();
    }
    return SQLiteObservable;

}

function executeTransaction(callback : SQLite.SQLTransactionCallback) {

    return getSQLiteObservable()//
        .subscribe(db => {
            db.transaction(callback);
        });

}

export function loadCategoriesContent() : Observable<any> {

    return getSQLiteObservable()//
    .pipe(
        mergeMap(db => {

            console.log('get db')

            return new Observable(observer => {

                db.transaction(tx => {

                    tx.executeSql('SELECT bct_name as category_name, bop_name as name, bop_value as value, bop_type as type, bop_duedate as dueDate FROM t_budget_categories_bct INNER JOIN tj_budget_category_operation_bco ON bco_category_id = bct_id INNER JOIN t_budget_operations_bop ON bop_id = bco_operation_id', [], (_, result) => {

                        const { rows: {_array} } = result;
                        _array.forEach(item => {
                            observer.next(item);
                        });
                        observer.complete();

                    });

                });

            });

        }),
        groupBy( (item: any) => item.category_name),
        mergeMap( (group : any, index : number) => {

            console.log('mergeMap')

            const category_name : string = group.key;

            return group.pipe(
                map( (item : any) => {
                    return {
                        name : item.value,
                        value: item.value,
                        type: budgetOperationTypeFromString(item.type),
                        dueDate: new Date(item.date)
                    } as BudgetOperation;
                }),
                toArray(),
                map( (operations : BudgetOperation[]) => {
                    return {
                        name: category_name,
                        operations: operations,
                        funds: 0
                    } as BudgetCategory;
                })
            );

        })
    );

}

/*
 * Budget Category
 */

export function createCategory(category : BudgetCategory) {

    console.log('createCategory()');

    return new Promise<void>( (resolve, reject) => {

        db.transaction(tx => {

            console.log('transactiont to create category');

            tx.executeSql('INSERT INTO t_budget_categories_bct (bct_name, bct_fund) VALUES (?, ?)', [category.name, category.funds], (_, resultSet) => {
                console.log('create OK');
                resolve();
            }, (_, err) => {
                console.log(err);
                reject(err);
                return false;
            });

        });

    });

}

export function updateCategory(_id : number, category : BudgetCategory) {

    return new Promise((resolve, reject) => {

        db.transaction(tx => {

            tx.executeSql('UPDATE FROM t_budget_categories_bct SET bct_name = ?, bct_fund = ? WHERE bct_id = ?', [], (_, resultSet) => {

            });

        });

    });

}

export function deleteCategory(category : BudgetCategory) {

    return new Promise<void>( (resolve, reject) => {

        db.transaction(tx => {

            console.log('transactiont to create category');

            tx.executeSql('DELETE t_budget_categories_bct WHERE bct_name = ?', [category.name], (_, resultSet) => {
                console.log('delete OK');
                resolve();
            }, (_, err) => {
                console.log(err);
                reject(err);
                return false;
            });

        });

    });

}

/*
 * 
 * Budget Operation
 */

export function createOperation(operation : BudgetOperation, category : BudgetCategory) {

    const category_id = category._id;

    return new Promise<void>((resove, reject) => {

        db.transaction(tx => {
            const dueDate : Date | null = operation.dueDate ? operation.dueDate : null;
            const params : any[] = [operation.name, operation.value, budgetOperationTypeToString(operation.type), dueDate];
            tx.executeSql('INSERT INTO t_budget_operations_bop (bop_name, bop_value, bop_type, bop_duedate) VALUES (?, ?, ?, ?)', params, (_, result) => {
                resove();
            }, (_, err) => {
                reject(err);
                return false;
            });

            tx.executeSql('INSERT INTO tj_budget_category_operation_bco (bco_category_id, bco_operation_id) SELECT (?, last_insert_rowid() ) ', [`${category_id}`], (_, result) => {

            }, (_, err) => {
                return false;
            });
        });

    });

}

export function updateOperation(_id : number, operation : BudgetOperation) {

    return new Promise<void>((resolve, reject) => {

        db.transaction(tx => {
            const dueDate : Date | null = operation.dueDate ? operation.dueDate : null;
            const params : any[] = [operation.name, operation.value, budgetOperationTypeToString(operation.type), dueDate, _id];
            tx.executeSql('UPDATE t_budget_operations_bop SET bop_name = ?, bop_value = ?, bop_type = ?, bop_duedate =? WHERE rowid = ?', params, (_, result) => {

            }, (_, err) => {
                return false;
            });

        });

    });

}

export function deleteOperation(operation : BudgetOperation) {

    return new Promise<void>((resove, reject) => {
        db.transaction(tx => {
            tx.executeSql('DELETE t_budget_operations_bop WHERE bop_name = ?', [operation.name], (_, result) => {
                resove();
            }, (_, err) => {
                reject(err);
                return false;
            })
        });
    });

}