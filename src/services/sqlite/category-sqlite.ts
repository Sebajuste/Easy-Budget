import * as SQLite from 'expo-sqlite';
import _ from 'lodash';

import assert from "../../util/assert";
import { Category, CategoryDao } from "../category";

export class CategorySQLiteDao extends CategoryDao {

    private client : SQLite.WebSQLDatabase;

    constructor(client: SQLite.WebSQLDatabase) {
        super();
        assert( client );
        this.client = client;
    }
    
    addAll(entry: Category[]): Promise<string[] | number[] | undefined[]> {
        throw new Error("Method not implemented.");
    }

    load(): Promise<Category[]> {
        
        return new Promise((resolve, reject) => {

            // const SQL = `SELECT cat_id as _id, cat_name as name, cat_color as color, cat_icon as icon FROM t_category_cat`;

            const SQL = `SELECT cat_id as _id,
                acc_name as name,
                cat_color as color,
                cat_icon as icon,
                acc_id as account_id
            FROM t_category_cat
                INNER JOIN t_account_acc
                    ON acc_id = cat_account_id`;

            this.client.transaction(tx => {
                tx.executeSql(SQL, [], (_, { rows: {_array} }) => {
                    resolve(_array);
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });

        });

    }

    find(selector: any) : Promise<Category|null> {

        const { _id } = selector;

        return new Promise((resolve, reject) => {

            this.client.transaction(tx => {

                const SQL = `SELECT cat_id as _id,
                    acc_name as name,
                    cat_color as color,
                    cat_icon as icon,
                    acc_id as account_id
                FROM t_category_cat
                    INNER JOIN t_account_acc
                        ON acc_id = cat_account_id
                WHERE cat_id = ?`;

                tx.executeSql(SQL, [_id], (tx2, {rows: { _array }}) => {
                    resolve( _.head(_array) );
                }, (tx, err) => {
                    reject(err);
                    return true;
                })

            });

        });

    }

    add(category: Category): Promise<string|number|undefined> {

        if( category.name.trim().length == 0) {
            return new Promise((resolve, reject) => {
                reject('Invalid name');
            });
        }

        return new Promise((resolve, reject) => {
            this.client.transaction(tx => {

                const SQL_ACCOUNT = `INSERT INTO t_account_acc (acc_name, acc_type) VALUES(?, 'Category')`;

                tx.executeSql(SQL_ACCOUNT, [category.name], (_, { insertId }) => {

                    if( insertId ) {
                        const SQL_CATEGORY = `INSERT INTO t_category_cat (cat_color, cat_icon, cat_account_id) VALUES (?, ?, ?)`;

                        tx.executeSql(SQL_CATEGORY, [category.color, category.icon, insertId], (_, { insertId }) => {
                            resolve(insertId);
                        }, (tx, err) => {
                            reject(err);
                            return true;
                        });
                    } else {
                        throw new Error(`Cannot insert category account`);
                    }

                }, (tx, err) => {
                    reject(err);
                    return true;
                });

            });
        });
    }

    update(category: Category): Promise<void> {

        const SQL_ACCOUNT = `UPDATE t_account_acc SET acc_name = ? WHERE acc_id = ?`;

        const SQL_CATEGORY = `UPDATE t_category_cat SET cat_color = ?, cat_icon = ? WHERE cat_id = ?`;

        const params = [category.name, category.color, category._id];

        return new Promise((resolve, reject) => {
            this.client.transaction(tx => {

                tx.executeSql(SQL_ACCOUNT, [category.name, category.account_id], (_, { rows: {_array} }) => {
                    // resolve();
                }, (tx, err) => {
                    reject(err);
                    return true;
                });

                tx.executeSql(SQL_CATEGORY, [category.color, category.icon, category._id], (_, { rows: {_array} }) => {
                    resolve();
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });
    }

    remove(category: Category): Promise<void> {

        const SQL = `DELETE FROM t_category_cat WHERE cat_id = ?`;

        return new Promise((resolve, reject) => {
            this.client.transaction(tx => {
                tx.executeSql(SQL, [category._id], (_, { rows: {_array} }) => {
                    resolve();
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });

    }

}
