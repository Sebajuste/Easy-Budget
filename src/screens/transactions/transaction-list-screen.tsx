import { Account } from "../../services/account";
import uuid from 'react-native-uuid';
import _ from "lodash";
import { SafeAreaView, ScrollView, View } from "react-native";
import { scroll_styles } from "../../styles";
import { Button, CheckBox, Section, SectionContent, Text } from "react-native-rapi-ui";
import { useEffect, useState } from "react";
import { TransactionDaoStorage } from "../../services/async_storage/transaction_async_storage";
import { Transaction, TransactionType } from "../../services/transaction";

export function TransactionListScreen({navigation, route} : any) {

    const account : Account = route.params?.account;

    const [transactions, setTransactions] = useState<Transaction[]>([]);


    const reconciledHandler = (transaction: Transaction, val: boolean) => {

    };

    const newTransactionHandler = () => {
        navigation.navigate({name: 'Transaction'});
    };

    useEffect(() => {
        const transactionDao = new TransactionDaoStorage();
        transactionDao.load().then(transactions => {
            return account ? _.filter(transactions, transaction => transaction.account_id == account._id && transaction.transactionType === TransactionType.PAIMENT ) : transactions;
        }).then(setTransactions);
    }, []);

    const transactions_ordered = _.orderBy(transactions, ['date'], ['desc']);

    const transaction_items = transactions_ordered.map((transaction: Transaction, index) => {

        return (
            <Section key={index}>
                <SectionContent style={{flexDirection: 'row'}}>
                    <View style={{flex: 1}}>
                        <Text>{transaction.name}</Text>
                        <Text>{typeof transaction.date == 'string' ? new Date(transaction.date).toDateString() : transaction.date.toDateString()}</Text>
                        <Text>{transaction.amount.toFixed(2)} €</Text>
                    </View>
                    <View>
                        <CheckBox value={transaction.reconciled} onValueChange={(val) => reconciledHandler(transaction, val)} />
                    </View>
                </SectionContent>
            </Section>
        );

    });

    return (
        <SafeAreaView style={scroll_styles.container}>
            <Button style={{margin: 10}} text="NEW" onPress={newTransactionHandler} />
            <ScrollView style={scroll_styles.scrollView}>
                {transaction_items}
            </ScrollView>
        </SafeAreaView>
    );

}
