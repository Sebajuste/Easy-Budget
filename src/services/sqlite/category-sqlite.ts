import { Category, CategoryDao } from "../category";
import { sqlite_client } from "./database-manager-sqlite";

export class CategorySQLiteDao extends CategoryDao {
    
    addAll(entry: Category[]): Promise<string[] | number[] | undefined[]> {
        throw new Error("Method not implemented.");
    }

    load(): Promise<Category[]> {
        
        return new Promise((resolve, reject) => {

            const SQL = `SELECT cat_id as _id, cat_name as name, cat_color as color FROM t_category_cat`;

            sqlite_client().transaction(tx => {
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
        throw new Error("Method not implemented.");
    }

    add(category: Category): Promise<string|number|undefined> {

        if( category.name.trim().length == 0) {
            return new Promise((resolve, reject) => {
                reject('Invalid name');
            });
        }

        const SQL = `INSERT INTO t_category_cat (cat_name, cat_color, cat_icon) VALUES (?, ?, 'none')`;

        return new Promise((resolve, reject) => {
            sqlite_client().transaction(tx => {
                tx.executeSql(SQL, [category.name, category.color], (_, { insertId }) => {
                    resolve(insertId);
                }, (tx, err) => {
                    reject(err);
                    return true;
                });
            });
        });
    }

    update(category: Category): Promise<void> {

        const SQL = `UPDATE t_category_cat SET cat_name = ?, cat_color = ? WHERE cat_id = ?`;

        const params = [category.name, category.color, category._id];

        return new Promise((resolve, reject) => {
            sqlite_client().transaction(tx => {
                tx.executeSql(SQL, params, (_, { rows: {_array} }) => {
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
            sqlite_client().transaction(tx => {
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
