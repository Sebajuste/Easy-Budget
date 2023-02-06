import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { Button, CheckBox, Section, SectionContent, Text } from "react-native-rapi-ui";
import _ from "lodash";
import { Account } from "../../services/account";
import { scroll_styles } from "../../styles";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import { AccountTransaction, AccountTransactionDao } from "../../services/transaction";

export function AccountTransactionListScreen({navigation, route} : any) {

    const account : Account = route.params?.account;

    const [transactions, setTransactions] = useState<AccountTransaction[]>([]);

    // const transactionDao = getDao<AccountTransactionDao>(AccountTransactionDao, DATABASE_TYPE);
    const transactionDao = DAOFactory.getDAO<AccountTransaction>(AccountTransactionDao, DATABASE_TYPE);

    const reconciledHandler = (transaction: AccountTransaction, val: boolean) => {

    };

    const newTransactionHandler = () => {
        navigation.navigate({name: 'Transaction'});
    };

    useEffect(() => {
        transactionDao.load().then(transactions => {
            return account ? _.filter(transactions, transaction => transaction.account_id == account._id ) : transactions;
        }).then(setTransactions);
    }, []);

    const transactions_ordered = _.orderBy(transactions, ['date'], ['desc']);

    const transaction_items = transactions_ordered.map((transaction: AccountTransaction, index) => {

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
