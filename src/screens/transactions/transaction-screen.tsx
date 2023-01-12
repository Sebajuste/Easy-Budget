import _ from "lodash";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Layout, Picker, Text, TextInput } from "react-native-rapi-ui";
import { AccountDaoStorage } from "../../services/async_storage/account_async_storage";
import { SelectDateComponent } from "../../components/select-date";
import { Transaction, TransactionType } from "../../services/transaction";
import { EnvelopeDaoStorage } from "../../services/async_storage/budget_async_storage";
import { Envelope } from "../../services/budget";
import { StackActions, useIsFocused } from "@react-navigation/native";
import { TransactionDaoStorage } from "../../services/async_storage/transaction_async_storage";
import { Account } from "../../services/account";


export function TransactionScreen({navigation, route} : any) {

    const transaction : Transaction = route.params?.transaction;

    const [name, setName] = useState( transaction ? transaction.name: '');

    const [amount, setAmount] = useState( transaction ? `${transaction.amount}` : '');

    const [envelopID, setEnvelopeID] = useState( transaction ? transaction.envelope_id : '' );

    // const [accountID, setAccountID] = useState( transaction ? transaction.account_id : '' );

    const [date, setDate] = useState( transaction ? ( typeof transaction.date === 'string' ? new Date(transaction.date) : transaction.date ) : new Date());

    const [envelopItems, setEnvelopItems] = useState<any[]>([]);

    const [accountItems, setAccountItems] = useState<any[]>([]);

    const [envelope, setEnvelope] = useState<Envelope|undefined>();

    const [account, setAccount] = useState<Account|undefined>();

    const isFocused = useIsFocused();

    const payHandler = () => {

        if( account ) {
        const transactionDao = new TransactionDaoStorage();
        transaction.name = name;
        transaction.transactionType = TransactionType.PAIMENT;
        transaction.amount = parseFloat(amount);
        transaction.envelope_id = envelopID;
        transaction.account_id = account._id;
        transaction.date = date;
        transaction.reconciled = false;
        
        transactionDao.add(transaction).then(result => {
            console.log(`Result : ${result ? 'true' : 'false' }`)
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
        }).catch(console.error);
        }
    };

    const fillHandler = () => {

        navigation.navigate({name: 'FillEnvelope', params: {envelope: envelope}});

    };

    /*
    const selectAccountHandler = (id: string) => {
        setAccountID(id);
        const accountDao = new AccountDaoStorage();
        accountDao.load().then(accounts => _.find(accounts, item => item._id == accountID) )//
            .then(setAccount);
    };
    */

    

    useEffect(() => {
        const accountDao = new AccountDaoStorage();
        const envelopeDao = new EnvelopeDaoStorage();

        envelopeDao.load().then(envelopes => {

            setEnvelope( _.find(envelopes, env => env._id == envelopID) );

            return envelopes.map(envelop => {
                return {
                    label: `${envelop.name} [${envelop.funds}]`,
                    value: envelop._id
                };
            });
        }).then(setEnvelopItems);

        accountDao.load().then(accounts => {

            // setAccount( _.find(accounts, item => item._id == accountID) );

            return accounts.map(account => {
                return {
                    label: `${account.name} [${account.balance}]`,
                    // value: account._id
                    value: account
                };
            });
        }).then(setAccountItems);

    }, [isFocused]);


    return (
        <Layout style={{margin: 10}}>
            

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
                    <View style={{flex: 1, margin: 2, flexDirection: "row"}}>
                    { envelope ?
                        <>
                        <Text style={{ marginTop: 12, marginBottom: 12, flex: 1 }}>Envelope : { envelope?.name } </Text>
                        { envelope && parseFloat(amount) > envelope.funds ?
                            <Button text="FILL" onPress={fillHandler} ></Button>
                        :
                            null
                        }
                        </>
                    : 
                        <>
                            <Text style={{ fontSize: 12 }}>Envelope </Text>
                            <Picker placeholder="Envelope" items={envelopItems} value={ envelopID } onValueChange={setEnvelopeID} ></Picker>
                        </>
                    }
                    </View>
                </View>
                

                <View style={{ flexDirection: 'row' }}>
                    <View style={{flex: 1, margin: 2}}>
                        <Text style={{ fontSize: 12 }}>Account</Text>
                        <Picker placeholder="Account" items={accountItems} value={ account } onValueChange={setAccount} ></Picker>
                    </View>
                </View>

                <View style={{ flexDirection: 'row' }}>
                    <View style={{flex: 1, margin: 2}}>
                        <SelectDateComponent label="Date" date={date} onChange={(newDate: Date) => setDate(newDate) } />
                    </View>
                </View>

                <Button text="PAY" disabled={ !account || !envelope || parseFloat(amount) > account.balance || parseFloat(amount) > envelope.funds } onPress={payHandler} ></Button>

                
            
        </Layout>
    );

}