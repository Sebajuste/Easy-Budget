import { Slider } from "@miblanchard/react-native-slider";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Layout, Picker, Text, TextInput, ThemeContext } from "react-native-rapi-ui";
import { Account } from "../../services/account";
import { AccountDaoStorage } from "../../services/async_storage/account_async_storage";
import { Envelope } from "../../services/budget";
import _ from "lodash";
import uuid from 'react-native-uuid';
import { TransactionDaoStorage } from "../../services/async_storage/transaction_async_storage";
import { StackActions } from "@react-navigation/native";
import { Transaction } from "../../services/transaction";
import { EnvelopeDaoStorage } from "../../services/async_storage/budget_async_storage";


export function EnvelopFillScreen({navigation, route} : any) {

    const envelope : Envelope = route.params?.envelope;

    const funds = envelope ? envelope.funds : 0;

    const [solde, setSolde] = useState<number>( funds );

    const [accountID, setAccountID] = useState( '' );

    const [accounts, setAccounts] = useState<Account[]>([]);

    const amount = solde - funds;

    const selectAccountHandler = (value: string) => {
        setAccountID(value);
        const account = _.find(accounts, account => value == accountID );
        if( account ) {
            if( amount > account.balance) {
                setSolde(account.balance);
            }
        }
    };


    const saveHandler = () => {

        const transactionDao = new TransactionDaoStorage();

        const account = _.find(accounts, account => account._id == accountID );
        if( account ) {
            const transaction : Transaction = {
                _id: uuid.v4(),
                name: `Fill Envelope ${envelope.name}`,
                amount: amount,
                envelope_id: envelope._id,
                account_id: account?._id,
                date: new Date(),
                reconciled: true
            } as Transaction;

            console.log(`funds: ${funds}, solde: ${solde}, amount: ${amount}`)

            transactionDao.add(transaction).then(v => {
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            });

        }

    };

    const deleteHandler = () => {
        const envelopeDao = new EnvelopeDaoStorage();
        envelopeDao.remove(envelope).then(v => {
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
        });
    };

    useEffect(() => {
        const accountDao = new AccountDaoStorage();
        accountDao.load().then(setAccounts);
    });

    if( !envelope ) {

        return (
            <Layout style={{margin: 10}}>
                <Text>No Envelope</Text>
            </Layout>
        );

    }

    const account = _.find(accounts, account => account._id == accountID );

    const formValid = account && (amount - envelope.funds) < account.envelope_balance;

    const accountItems = accounts.map(account => {
        return {
            label: `${account.name} [${account.envelope_balance}]`,
            value: account._id
        };
    });


    return (
        <Layout style={{margin: 10}}>

            <View style={{ margin: 2, flexDirection: 'row' }}>
                <View style={{flex: 1, margin: 2}}>
                    <Text style={{ fontSize: 12 }}>Account</Text>
                    <Picker placeholder="Account" items={accountItems} value={ accountID } onValueChange={selectAccountHandler} ></Picker>
                </View>
            </View>

            <View>
                <Slider
                    value={solde}
                    disabled={ !account }
                    minimumValue={0}
                    maximumValue={account?.envelope_balance}
                    step={1}
                    onValueChange={(values: any) => setSolde(values[0])}
                />
                <Text>Value: {solde}</Text>
            </View>

            <View style={{ flexDirection: 'row'}} >
                <Button style={{margin: 5}} text="DELETE" status="danger" onPress={deleteHandler}></Button>
                <Button style={{margin: 5, flexGrow: 1}} text="SAVE" status="primary" disabled={!formValid} onPress={saveHandler}></Button>
                
            </View>
        </Layout>
    );

}