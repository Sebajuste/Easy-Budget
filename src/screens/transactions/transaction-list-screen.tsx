import { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { StackActions, useIsFocused } from "@react-navigation/native";
import { FlatList } from "react-native-gesture-handler";
import { Button, CheckBox, Text } from "react-native-rapi-ui";
import Icon from 'react-native-vector-icons/FontAwesome';
import _ from "lodash";

import { Account } from "../../services/account";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import { AccountTransaction, AccountTransactionDao, TransactionType } from "../../services/transaction";

import { t } from "../../services/i18n";
import { DaoType } from "../../services/dao";
import { DeleteConfirmModal } from "../../components/modal";



function AccountTransactionItem({transaction, index} : {transaction : any, index: number}) {

    const [reconciled, setReconciled] = useState(false);

    const reconciledHandler = (val: boolean) => {
        // setReconciled(val);
    };

    return (
        <View style={styles.transaction}>
            <View style={{ ...styles.avatar, backgroundColor: transaction?.color || 'silver'}} >
                <Icon name={transaction.icon} style={{color: 'white', fontSize: 18}} />
            </View>
            <View style={{flex: 1}}>
                <Text>{transaction.name}</Text>
                <Text>{typeof transaction.date == 'string' ? new Date(transaction.date).toLocaleDateString() : transaction.date.toLocaleDateString()}</Text>                        
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={ transaction.type == TransactionType.INCOME ? {backgroundColor: 'green', padding: 5 } : {}}>{ transaction.type == TransactionType.OUTCOME ? '-' : '' } {transaction.amount.toFixed(2)} €</Text>
            </View>
            <View style={{margin: 10}}>
                <CheckBox disabled={false} value={reconciled} onValueChange={reconciledHandler} />
            </View>
        </View>
    );

}



export function AccountTransactionListScreen({navigation, route} : any) {

    const account : Account = route.params?.account;

    const [transactions, setTransactions] = useState<AccountTransaction[]>([]);

    const isFocused = useIsFocused();

    const transactionDao = DAOFactory.getDAOFromType<AccountTransaction>(DaoType.ACCOUNT_TRANSACTION, DATABASE_TYPE);

    const [confirm, setConfirm] = useState(false);

    const openDeleteHandler = () => {
        setConfirm(true);
    };

    const deleteHandler =  () => {
        const accountDao = DAOFactory.getDAOFromType<Account>(DaoType.ACCOUNT, DATABASE_TYPE);
        accountDao.remove(account)//
        .then( () => {
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
        })//
        .catch(err => {
            console.error(err);
        });
    };

    const newTransactionHandler = () => {
        navigation.navigate({name: 'Transaction', params: {account: account}});
    };

    const transactionRenderHandler = ({item, index} : {item: AccountTransaction, index: number}) => (
        <AccountTransactionItem transaction={item} index={index} />
    );

    const itemSeparatorHandler = () => (<View style={styles.seperator} />);

    useEffect(() => {
        transactionDao.load().then(transactions => {
            return account ? _.filter(transactions, transaction => transaction.account_id == account._id ) : transactions;
        }).then(setTransactions);
    }, [isFocused]);

    
    return (
        <SafeAreaView style={styles.container}>

            <DeleteConfirmModal options={{title: t('title:confirm_delete')}} visible={confirm} onCancel={() => setConfirm(false)} onConfirm={() => deleteHandler()} />

            <Button style={styles.button} text="DELETE" onPress={openDeleteHandler} status="danger" />
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
