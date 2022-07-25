import { useEffect, useState } from "react";
import Realm from "realm";
import { map, mergeMap, Observable, share, Subscriber } from "rxjs";

// const Realm = require('realm');
// import { TEST_BUDGET } from "./budget_testdata";


export enum BudgetOperationType {
    MONTH, TRIMESTER, SEMESTER, YEAR
}

export interface BudgetOperation {
    name: string;
    value: number;
    type: BudgetOperationType;
    dueDate?: Date;
}

export interface BudgetCategory {
    name: string;
    operations: Array<BudgetOperation>;
    reserve: number;
}

export interface Budget {
    categories : Array<BudgetCategory>
}

const BudgetOperationSchema = {
    name: "BudgetOperation",
    properties: {
        _id: "int",
        name: "string",
        value: "double",
        type: "string",
        dueDate: "date"
    },
    primaryKey: "_id"
};

const BudgetCategorySchema = {
    name: "BudgetCategory",
    properties: {
        _id: "int",
        name: "string",
        operations: "BudgetOperation[]",
        reserve: "double"
    },
    primaryKey: "_id"
};


export function budgetOperationTypeToString(operationType : BudgetOperationType) {
    switch(operationType) {
        case BudgetOperationType.MONTH: return "month";
        case BudgetOperationType.TRIMESTER: return "trimester";
        case BudgetOperationType.SEMESTER: return "semester";
        case BudgetOperationType.YEAR: return "year";
        default: return "";
    }
}

export function budgetOperationTypeFromString(operationTypeStr : string) {
    switch(operationTypeStr) {
        case 'month': return BudgetOperationType.MONTH;
        case 'trimester': return BudgetOperationType.TRIMESTER;
        case 'semester': return BudgetOperationType.SEMESTER;
        case 'year': return BudgetOperationType.YEAR;
        default: return BudgetOperationType.MONTH;
    }
}

// let internal_budget = Object.assign({}, TEST_BUDGET);
let internal_budget : Budget = {categories: new Array()} as Budget;



export function loadBudget() : Budget {
    // console.log('loadBudget');
    return internal_budget;
}

export function saveBudget(budget : Budget ) {
    console.log('saveBudget : ', budget.categories[0]);
    internal_budget = budget
}


let bugetChangeObserver : Subscriber<Budget>;

let bugetChangeObservable : Observable<Budget>;

function createObservableBudget() {

    bugetChangeObservable = new Observable<Budget>(observer => {
        bugetChangeObserver = observer;

        observer.next( loadBudget() );

    }).pipe(
        share()
    );
    return bugetChangeObservable;
}

export function subscribeBudget() {
    return bugetChangeObservable ? bugetChangeObservable : createObservableBudget();
}

export function saveBudgetCategory(bugetCategory : BudgetCategory) {



}




/*
 * 
 * Budget Realm Observable
 */

let budgetRealmObservable : Observable<Realm>;

function createBudgetRealmObservable() {

    budgetRealmObservable = new Observable<Realm>(observer => {

        let realm : Realm;

        Realm.open({
            path: "budget",
            schema: [BudgetOperationSchema, BudgetCategorySchema]
        }).then(r => {
            realm = r;
            observer.next(realm);
            observer.complete();
        }, observer.error);

        return () => {
            if( realm ) {
                realm.close();
            }
        }

    }).pipe(
        share()
    );
    return budgetRealmObservable;
}

export function subscribeBudgetRealm() : Observable<Realm> {
    return budgetRealmObservable ? budgetRealmObservable : createBudgetRealmObservable();
}

/**
 * Listen change into budget_categories
 */
export function budgetCategoriesSubscribe() {

    subscribeBudgetRealm().pipe(
        map( realm => realm.objects("budget_categories") ), //
        mergeMap(categories => {

            const listener = (categories:any, changes:any) => {

            };

            return new Observable<any>(observer => {

                categories.addListener(listener);

                return () => {
                    categories.removeListener(listener);
                }

            });

        })

    );

}


export function useBudgetCategories() {

    const [categories, setCategories ] = useState();

    

    return [categories, setCategories ];
}


/*
 *
 */


export function useBudget() {

    const [budget, setBudget] = useState( loadBudget() );

    const saveBudgetList = (newBudget : Budget ) => {
        setBudget(newBudget);
        saveBudgetList(newBudget);
        console.log('new newBudgetList : ', newBudget);
    };


    return [budget, saveBudgetList];
}

export function budgetPerYear(operations: Array<BudgetOperation> ) {

    if( !operations ) {
      return 0;
    }
  
    let result = 0;
  
    operations.forEach(item => {
      switch(item.type) {
        case BudgetOperationType.MONTH: {
          result += item.value * 12;
          break;
        }
        case BudgetOperationType.TRIMESTER: {
          result += item.value * 4;
          break;
        }
        case BudgetOperationType.SEMESTER: {
          result += item.value * 2;
          break;
        }
        case BudgetOperationType.YEAR: {
          result += item.value;
          break;
        }
      }
    });
  
    return result;
}