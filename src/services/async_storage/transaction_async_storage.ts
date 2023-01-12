import _ from "lodash";
import { AsyncStorage } from "react-native";
import { envelopeNextDate } from "../budget";
import { Transaction, TransactionDao, TransactionType } from "../transaction";
import { AccountDaoStorage } from "./account_async_storage";
import { EnvelopeDaoStorage } from "./budget_async_storage";


export class TransactionDaoStorage implements TransactionDao {


    async load() : Promise<Transaction[]> {
        const json_transactions = await AsyncStorage.getItem('transactions');
        if( json_transactions ) {
            return JSON.parse(json_transactions) ;
        }
        return [];
    }

    async save(transactions: Transaction[]) {
        return await AsyncStorage.setItem('transactions', JSON.stringify(transactions));
    }

    async add(transaction: Transaction): Promise<boolean> {

        const accountDao = new AccountDaoStorage();
        const envelopeDao = new EnvelopeDaoStorage();

        if( transaction.amount == 0) {
            return await false;
        }

        console.log('TransactionDaoStorage::add ', transaction._id);

        return Promise.all([this.load(), envelopeDao.load(), accountDao.load()]).then( ([transactions, envelopes, accounts]) => {

            transactions.push(transaction);

            const envelope = _.find(envelopes, envelope => envelope._id == transaction.envelope_id);
            const account = _.find(accounts, account => account._id == transaction.account_id);

            console.log(`[${transaction._id}] transaction - balance: ${account?.balance}, envelope_balance: ${account?.envelope_balance}, transaction.amount: ${transaction.amount}`);

            if(transaction.transactionType == TransactionType.FILL && envelope && account && account.envelope_balance - transaction.amount >= 0 && envelope.funds + transaction.amount >= 0) {
                envelope.funds += transaction.amount;
                account.envelope_balance -= transaction.amount;

                console.log(`[${transaction._id}] writing...`);

                return Promise.all([
                    this.save(transactions),
                    accountDao.save(accounts),
                    envelopeDao.save(envelopes)
                ]).then(v => {
                    console.log(`[${transaction._id}] done`);
                    return true;
                });
            }

            if(transaction.transactionType == TransactionType.PAIMENT && envelope && account && account.balance - transaction.amount >= 0 && envelope.funds - transaction.amount >= 0) {
                envelope.funds -= transaction.amount;
                account.balance -= transaction.amount;
                envelope.dueDate = envelopeNextDate(envelope);

                return Promise.all([
                    this.save(transactions),
                    accountDao.save(accounts),
                    envelopeDao.save(envelopes)
                ]).then(v => true);
            }

            return false;
        });

    }

    async addAll(transactions : Transaction[]) : Promise<boolean[]> {

        const self = this;

        const results : boolean[] = [];

        async function chain(transactions : Transaction[]) : Promise<boolean> {
            const transaction = transactions.pop();
            if( transaction ) {
                return await self.add(transaction).then(r => {
                    results.push(r);
                    return chain(transactions);
                });
            }
            return false;
        }

        return chain(transactions).then(v => {
            // results.push(r);
            return results;
        });

    };

    async remove(transaction: Transaction) : Promise<boolean> {

        const accountDao = new AccountDaoStorage();
        const envelopeDao = new EnvelopeDaoStorage();

        return Promise.all([this.load(), envelopeDao.load(), accountDao.load()]).then( ([transactions, envelopes, accounts]) => {

            const index = _.findIndex(transactions, item => item._id == transaction._id);
            const envelope = _.find(envelopes, envelope => envelope._id == transaction.envelope_id);
            const account = _.find(accounts, account => account._id == transaction._id);

            if( index != -1 && envelope && account && envelope.funds >= transaction.amount) {
                transactions = transactions.splice(index, 1);
                
                envelope.funds -= transaction.amount;
                account.envelope_balance += transaction.amount;

                return Promise.all([
                    this.save(transactions),
                    accountDao.save(accounts),
                    envelopeDao.save(envelopes)
                ]).then(v => true);
            }

            return false;
        });

    }

}