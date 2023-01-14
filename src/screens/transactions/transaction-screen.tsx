import _ from "lodash";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Layout, Picker, Text, TextInput } from "react-native-rapi-ui";
import { SelectDateComponent } from "../../components/select-date";
import { Transaction, TransactionDao, TransactionType } from "../../services/transaction";
import { Envelope, EnvelopeDao } from "../../services/envelope";
import { StackActions, useIsFocused } from "@react-navigation/native";
import { Account, AccountDao } from "../../services/account";
import { DATABASE_TYPE, getDao } from "../../services/dao-manager";


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

    const transactionDao = getDao<TransactionDao>(TransactionDao, DATABASE_TYPE);
    const accountDao = getDao<AccountDao>(AccountDao, DATABASE_TYPE);
    const envelopeDao = getDao<EnvelopeDao>(EnvelopeDao, DATABASE_TYPE);

    const payHandler = () => {

        if( account ) {
        
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

    useEffect(() => {
        

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