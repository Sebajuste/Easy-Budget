import _ from "lodash";
import { AsyncStorage } from "react-native";
import uuid from 'react-native-uuid';
import { envelopeNextDate } from "../envelope";
import { AccountTransaction, AccountTransactionDao, EnvelopeTransaction, EnvelopeTransactionDao } from "../transaction";
import { AccountDaoStorage } from "./account_async_storage";
import { EnvelopeDaoStorage } from "./envelope-async-storage";




export class AccountTransactionDaoDaoStorage extends AccountTransactionDao {
    
    async load(): Promise<AccountTransaction[]> {
        const json_transactions = await AsyncStorage.getItem('account_transactions');
        if( json_transactions ) {
            return JSON.parse(json_transactions) ;
        }
        return [];
    }

    async save(transactions: AccountTransaction[]) {
        return await AsyncStorage.setItem('account_transactions', JSON.stringify(transactions));
    }

    async add(transaction: AccountTransaction): Promise<string | number | undefined> {
        const accountDao = new AccountDaoStorage();
        const envelopeDao = new EnvelopeDaoStorage();

        if( transaction.amount == 0) {
            return;
        }

        transaction._id == uuid.v4();

        return Promise.all([this.load(), envelopeDao.load(), accountDao.load()]).then( ([transactions, envelopes, accounts]) => {
            transactions.push(transaction);

            const envelope = _.find(envelopes, envelope => envelope._id == transaction.envelope_id);
            const account = _.find(accounts, account => account._id == transaction.account_id);

            if( envelope && account) {
                envelope.funds -= transaction.amount;
                account.balance -= transaction.amount;
                envelope.dueDate = envelopeNextDate(envelope);
    
                return Promise.all([
                    this.save(transactions),
                    accountDao.save(accounts),
                    envelopeDao.save(envelopes)
                ]).then(v => transaction._id);
            }

            return;
        });

    }

    addAll(transactions: AccountTransaction[]): Promise<any[]> {
        const self = this;

        const results : any[] = [];

        async function chain(transactions : AccountTransaction[]) : Promise<string|number|undefined> {
            const transaction = transactions.pop();
            if( transaction ) {
                return await self.add(transaction).then(r => {
                    results.push(transaction._id);
                    return chain(transactions);
                });
            }
            return;
        }

        return chain(transactions).then(v => {
            return results;
        });
    }

    remove(transaction: AccountTransaction): Promise<boolean> {
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


export class EnvelopeTransactionDaoStorage extends EnvelopeTransactionDao {


    async load() : Promise<EnvelopeTransaction[]> {
        const json_transactions = await AsyncStorage.getItem('envelopes_transactions');
        if( json_transactions ) {
            return JSON.parse(json_transactions) ;
        }
        return [];
    }

    async save(transactions: EnvelopeTransaction[]) {
        return await AsyncStorage.setItem('envelopes_transactions', JSON.stringify(transactions));
    }

    async add(transaction: EnvelopeTransaction): Promise<string|number|undefined> {

        const accountDao = new AccountDaoStorage();
        const envelopeDao = new EnvelopeDaoStorage();

        if( transaction.amount == 0) {
            return;
        }

        transaction._id = uuid.v4() as string;

        return Promise.all([this.load(), envelopeDao.load(), accountDao.load()]).then( ([transactions, envelopes, accounts]) => {

            transactions.push(transaction);

            const envelope = _.find(envelopes, envelope => envelope._id == transaction.envelope_id);
            const account = _.find(accounts, account => account._id == transaction.account_id);

            console.log(`[${transaction._id}] transaction - balance: ${account?.balance}, envelope_balance: ${account?.envelope_balance}, transaction.amount: ${transaction.amount}`);


            if(envelope && account && account.balance - transaction.amount >= 0 && envelope.funds - transaction.amount >= 0) {
                envelope.funds -= transaction.amount;
                account.balance -= transaction.amount;
                envelope.dueDate = envelopeNextDate(envelope);

                return Promise.all([
                    this.save(transactions),
                    accountDao.save(accounts),
                    envelopeDao.save(envelopes)
                ]).then(v => transaction._id);
            }

            return;
        });

    }

    async addAll(transactions : EnvelopeTransaction[]) : Promise<boolean[]> {

        const self = this;

        const results : any[] = [];

        async function chain(transactions : EnvelopeTransaction[]) : Promise<boolean> {
            const transaction = transactions.pop();
            if( transaction ) {
                return await self.add(transaction).then(r => {
                    results.push(transaction._id);
                    return chain(transactions);
                });
            }
            return false;
        }

        return chain(transactions).then(v => {
            return results;
        });

    };

    async remove(transaction: EnvelopeTransaction) : Promise<boolean> {

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