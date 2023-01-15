import { AccountTransaction, AccountTransactionDao } from "../transaction";




export class AccountTransactionDaoSQLite extends AccountTransactionDao {

    load(): Promise<AccountTransaction[]> {
        throw new Error("Method not implemented.");
    }

    add(transaction: AccountTransaction): Promise<string | number | undefined> {
        throw new Error("Method not implemented.");
    }

    addAll(transactions: AccountTransaction[]): Promise<boolean[]> {
        throw new Error("Method not implemented.");
    }
    
    remove(transaction: AccountTransaction): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}


export class EnvelopeTransactionDaoSQLite extends AccountTransactionDao {

    load(): Promise<AccountTransaction[]> {
        throw new Error("Method not implemented.");
    }

    add(transaction: AccountTransaction): Promise<string | number | undefined> {
        throw new Error("Method not implemented.");
    }

    addAll(transactions: AccountTransaction[]): Promise<boolean[]> {
        throw new Error("Method not implemented.");
    }

    remove(transaction: AccountTransaction): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}
