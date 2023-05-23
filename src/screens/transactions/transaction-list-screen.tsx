import { useContext, useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { FlatList } from "react-native-gesture-handler";
import { Button, CheckBox, Text } from "react-native-rapi-ui";
import Icon from 'react-native-vector-icons/FontAwesome';
import _ from "lodash";

import { Account } from "../../services/account";
import { AccountTransaction, TransactionType } from "../../services/transaction";

import { t } from "../../services/i18n";
import { DaoType } from "../../services/dao";
import { DatabaseContext } from "../../services/db-context";



function AccountTransactionItem({transaction, navigation, index} : {transaction : AccountTransaction, navigation:any, index: number}) {

    const [reconciled, setReconciled] = useState(transaction.reconciled);

    const { dbManager } = useContext(DatabaseContext);

    // const transactionDao = dbManager.getDAOFromType<AccountTransaction>(DaoType.ACCOUNT_TRANSACTION);

    const reconciledHandler = (val: boolean) => {
        setReconciled(val);
        transaction.reconciled = val;
        // transactionDao.update(transaction).catch(console.error);
    };

    const selectHandler = () => {
        // navigation.navigate({name: 'EditCategory', params: {category: category} });
        navigation.navigate({name: 'Transaction', params: {transaction: transaction}});
    };

    return (
        <TouchableOpacity onPress={selectHandler}>
        <View style={styles.transaction}>
            <View style={{ ...styles.avatar, backgroundColor: transaction?.color || 'silver'}} >
                <Icon name={transaction.icon} style={{color: 'white', fontSize: 18}} />
            </View>
            <View style={{flex: 1}}>
                <Text>{transaction.name}</Text>
                <Text>{typeof transaction.date == 'string' ? new Date(transaction.date).toLocaleDateString() : transaction.date.toLocaleDateString()}</Text>                        
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={ transaction.type == TransactionType.INCOME ? {backgroundColor: 'green', padding: 5 } : {}}>{transaction.amount.toFixed(2)} €</Text>
            </View>
            <View style={{margin: 10}}>
                <CheckBox disabled={false} value={reconciled} onValueChange={reconciledHandler} />
            </View>
        </View>
        </TouchableOpacity>
    );

}


/** @deprecated */
export function AccountTransactionListScreen({navigation, route} : any) {

    const account : Account = route.params?.account;

    const [transactions, setTransactions] = useState<AccountTransaction[]>([]);

    const isFocused = useIsFocused();

    const { dbManager } = useContext(DatabaseContext);

    // const transactionDao = dbManager.getDAOFromType<AccountTransaction>(DaoType.ACCOUNT_TRANSACTION);


    const openEditHandler = () => {
        navigation.navigate({name: 'EditAccount', params: {account: account} });
    };

    const newTransactionHandler = () => {
        navigation.navigate({name: 'Transaction', params: {account: account}});
    };

    const transactionRenderHandler = ({item, index} : {item: AccountTransaction, index: number}) => (
        <AccountTransactionItem transaction={item} index={index} navigation={navigation} />
    );

    const itemSeparatorHandler = () => (<View style={styles.seperator} />);

    useEffect(() => {
        /*
        transactionDao.load().then(transactions => {
            return account ? _.filter(transactions, transaction => transaction.account_id == account._id ) : transactions;
        }).then(setTransactions);
        */
    }, [isFocused]);

    return (
        <SafeAreaView style={styles.container}>

            <Button style={styles.button} text={t('buttons:edit')} onPress={openEditHandler} status="warning" />
            <Button style={styles.button} text={t('common:new')} onPress={newTransactionHandler} />
            <FlatList
                data={transactions}
                keyExtractor={(transaction, i) => `${transaction._id}` }
                renderItem={transactionRenderHandler}
                ItemSeparatorComponent={itemSeparatorHandler}
            />
        </SafeAreaView>
    );

}


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    seperator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'gray',
    },
    avatar: {
        margin: 5,
        height: 36,
        width: 36,
        borderRadius: 18,
        backgroundColor: 'silver',
        alignItems: 'center',
        justifyContent: 'center',
    },
    transaction: {
        flexDirection: 'row',
        margin: 10
    },
    button: {
        textTransform: "capitalize",
        margin: 10
    }
});
