import { Slider } from "@miblanchard/react-native-slider";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, Layout, Picker, Text } from "react-native-rapi-ui";
import { Account, AccountDao } from "../../services/account";
import { Envelope } from "../../services/envelope";
import _ from "lodash";
import uuid from 'react-native-uuid';
import { StackActions } from "@react-navigation/native";
import { EnvelopeTransaction, EnvelopeTransactionDao } from "../../services/transaction";
import { scroll_styles } from "../../styles";
import EnvelopeTransactionView from "../transactions/transaction-view";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";


export function EnvelopFillScreen({navigation, route} : any) {

    const envelopeCategory = route.params?.envelopeCategory;

    const [envelope, setEnvelope] = useState<Envelope>( route.params?.envelope );

    const funds = envelope ? envelope.funds : 0;

    const [solde, setSolde] = useState<number>( funds );

    const [accountID, setAccountID] = useState( '' );

    const [accounts, setAccounts] = useState<Account[]>([]);

    const [transactions, setTransactions] = useState<EnvelopeTransaction[]>([]);

    const amount = solde - funds;

    const accountDao = DAOFactory.getDAO(AccountDao, DATABASE_TYPE);
    const transactionDao = DAOFactory.getDAO(EnvelopeTransactionDao, DATABASE_TYPE);

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

        const account = _.find(accounts, account => account._id == accountID );
        if( account ) {
            const transaction : EnvelopeTransaction = {
                _id: uuid.v4(),
                name: `Fill Envelope ${envelope.name}`,
                amount: amount,
                envelope_id: envelope._id,
                account_id: account?._id,
                date: new Date(),
                reconciled: true
            } as EnvelopeTransaction;

            transactionDao.add(transaction).then(v => {
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            }).catch(err => {
                console.error(err);
            })

        }

    };

    useEffect(() => {
        console.log('EnvelopFillScreen use effect');
        accountDao.load().then(setAccounts);
        
        transactionDao.load()//
            .then(items => _.filter(items, item => item.envelope_id == envelope._id)  )//
            .then(items => _.orderBy(items, ['date'], ['desc'] ) )//
            .then(setTransactions);
        
    }, []);

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
            value: account._id as string
        };
    });

    const editHandler = () => {
        const action = StackActions.replace('ConfigEnvelope', {envelopeCategory: envelopeCategory, envelope: envelope});
        navigation.dispatch(action);
    };

    const transactions_items = transactions?.map((transaction, index) => <EnvelopeTransactionView transaction={transaction} key={index} />);

    return (
        <Layout style={{margin: 10}}>

            { envelopeCategory ?
                <Button text="EDIT" onPress={editHandler}></Button>
            :
                null
            }
            
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
                    maximumValue={(account?.envelope_balance || 0) + funds}
                    step={1}
                    onValueChange={(values: any) => setSolde(values[0])}
                />
                <View style={{flexDirection: 'row', margin: 10}}>
                    <Text style={{flex: 1, textAlign: "center"}}>Envelope: {solde}</Text>
                    <Text style={{flex: 1, textAlign: "center"}}>Account: {(account?.envelope_balance || 0) - (solde-funds)}</Text>
                </View>
            </View>

            <View style={{ flexDirection: 'row'}} >
                <Button style={{margin: 5, flexGrow: 1}} text="SAVE" status="primary" disabled={!formValid} onPress={saveHandler}></Button>
            </View>

            <View style={{marginTop: 10, flex: 1}}>
                <Text style={{padding: 10}}>Last transactions :</Text>
                <ScrollView style={scroll_styles.scrollView}>
                    {transactions_items}
                </ScrollView>
            </View>

        </Layout>
    );

}