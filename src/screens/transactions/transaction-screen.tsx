import _ from "lodash";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Layout, Picker, Text, TextInput } from "react-native-rapi-ui";
import { AccountDaoStorage } from "../../services/async_storage/account_async_storage";
import { SelectDateComponent } from "../../components/select-date";
import { Transaction } from "../../services/transaction";
import { EnvelopeDaoStorage } from "../../services/async_storage/budget_async_storage";


export function TransactionScreen({navigation, route} : any) {

    const transaction : Transaction = route.params?.transaction;

    const [name, setName] = useState( transaction ? transaction.name: '');

    const [amount, setAmount] = useState( transaction ? `${transaction.amount}` : '');

    const [envelopID, setEnvelopeID] = useState( transaction ? transaction.envelope_id : '' );

    const [accountID, setAccountID] = useState( transaction ? transaction.account_id : '' );

    const [date, setDate] = useState( transaction ? transaction.date : new Date());

    const [envelopItems, setEnvelopItems] = useState<any[]>([]);

    const [accountItems, setAccountItems] = useState<any[]>([]);


    useEffect(() => {

        // const budgetDao = new BudgetDaoStorage();
        const accountDao = new AccountDaoStorage();
        const envelopeDao = new EnvelopeDaoStorage();

        envelopeDao.load().then(envelopes => {
            return envelopes.map(envelop => {
                return {
                    label: `${envelop.name} [${envelop.funds}]`,
                    value: envelop._id
                };
            });
        }).then(setEnvelopItems);



        /*
        budgetDao.get().then(budget => {
            if( budget ) {
                const envelopes = _.flatMap(budget.categories, cat => cat.envelopes);
                const items = envelopes.map(envelop => {
                    return {
                        label: `${envelop.name} [${envelop.funds}]`,
                        value: envelop._id
                    };
                });
                setEnvelopItems(items);
            }
            
        });
        */

        accountDao.load().then(accounts => {
            return accounts.map(account => {
                return {
                    label: `${account.name} [${account.balance}]`,
                    value: account._id
                };
            });
        }).then(setAccountItems);

    }, []);


    return (
        <Layout style={{margin: 10}}>
            <View style={{ flex: 1 }}>

                <View style={{ flexDirection: 'row' }}>
                    <View style={{flex: 1, margin: 2}}>
                        <Text style={{ fontSize: 12 }}>Transation name</Text>
                        <TextInput
                            placeholder="Enter the transaction name"
                            value={name}
                            onChangeText={(val) => setName(val)}
                        />
                    </View>
                </View>

                <View style={{ flexDirection: 'row' }}>
                    <View style={{flex: 1, margin: 2}}>
                        <Text style={{ fontSize: 12 }}>Amount</Text>
                        <TextInput
                            placeholder="0.00"
                            value={amount}
                            onChangeText={(val) => setAmount(val)}
                        />
                    </View>
                </View>

                <View style={{ flexDirection: 'row' }}>
                    <View style={{flex: 1, margin: 2}}>
                        <Text style={{ fontSize: 12 }}>Envelope</Text>
                        <Picker placeholder="Envelope" items={envelopItems} value={ envelopID } onValueChange={setEnvelopeID} ></Picker>
                    </View>
                </View>

                <View style={{ flexDirection: 'row' }}>
                    <View style={{flex: 1, margin: 2}}>
                        <Text style={{ fontSize: 12 }}>Account</Text>
                        <Picker placeholder="Account" items={accountItems} value={ accountID } onValueChange={setAccountID} ></Picker>
                    </View>
                </View>

                <View style={{ flexDirection: 'row' }}>
                    <View style={{flex: 1, margin: 2}}>
                        <SelectDateComponent label="Date" date={date} onChange={(newDate: Date) => setDate(newDate) } />
                    </View>
                </View>

            </View>
        </Layout>
    );

}