import {  useContext, useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { Button, CheckBox, Text } from "react-native-rapi-ui";
import { FlatList } from "react-native-gesture-handler";
import Icon from 'react-native-vector-icons/FontAwesome';
import _ from "lodash";

import { BankAccount } from "../../services/account";
import { AccountTransaction, Movement, MovementDao, Transaction, TransactionAccount } from "../../services/transaction";
import { DatabaseContext } from "../../services/db-context";
import { DaoType } from "../../services/dao";
import { t } from "../../services/i18n";



function TransactionMovementListItem({movement, onDelete, navigation} : {movement: Movement, onDelete?: () => void, navigation : any}) {

    const [reconciled, setReconciled] = useState(movement.reconciled);

    const [showDelete, setShowDelete] = useState(false);

    const { dbManager } = useContext(DatabaseContext);

    const transactionDao = dbManager.getDAOFromType<Transaction>(DaoType.TRANSACTION);
    const movementDao = dbManager.getDAOFromType<Movement>(DaoType.TRANSACTION_MOVEMENT);

    const reconciledHandler = (val: boolean) => {
        setReconciled(val);
        movement.reconciled = val;
        movementDao.update(movement).catch(console.error);
        // transactionDao.update(transaction).catch(console.error);
    };

    const selectHandler = () => {
        // navigation.navigate({name: 'EditCategory', params: {category: category} });
        // navigation.navigate({name: 'Transaction', params: {transaction: transaction}});
    };

    const deleteHandler = () => {

        transactionDao.remove({ _id: movement.transaction_id} as Transaction).then(() => {
            if(onDelete) onDelete();
        }).catch(console.error);

    };

    return (
        <TouchableOpacity onPress={selectHandler} onLongPress={() => setShowDelete(!showDelete)}>
            <View style={styles.transaction}>
                <View style={{ ...styles.avatar, backgroundColor: movement?.color || 'silver'}} >
                    <Icon name={movement?.icon || ''} style={{color: 'white', fontSize: 18}} />
                </View>
                <View style={{flex: 1}}>
                    <Text>{movement.name}</Text>
                    <Text>{typeof movement.date == 'string' ? new Date(movement.date).toLocaleDateString() : movement.date?.toLocaleDateString()}</Text>                        
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={ movement.debit > 0 ? {backgroundColor: 'green', padding: 5 } : {}}>{movement.credit > 0 ? -movement.credit.toFixed(2) : movement.debit.toFixed(2) } €</Text>
                </View>
                
                { showDelete ? (
                    <TouchableOpacity onPress={deleteHandler} style={{ margin: 10, padding: 10, borderColor : "red", borderWidth: 1, borderRadius: 2 }}>
                        <Icon name="trash-o" size={20} color="red" style={{  }} />
                    </TouchableOpacity>
                ) : (
                    <View style={{margin: 10}}>
                        <CheckBox disabled={false} value={reconciled} onValueChange={reconciledHandler} />
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

}


export default function AccountViewScreen({navigation, route} : any) {

    const account : BankAccount = route.params?.account;

    const [movements, setMovements] = useState<Movement[]>([]);

    const isFocused = useIsFocused();

    const { dbManager } = useContext(DatabaseContext);

    const movementDao = dbManager.getDAOFromType<Movement>(DaoType.TRANSACTION_MOVEMENT) as MovementDao;


    const openEditHandler = () => {
        navigation.navigate({name: 'EditAccount', params: {account: account} });
    };

    const newTransactionHandler = () => {
        navigation.navigate({name: 'Transaction', params: {account: account}});
    };

    const refreshHandler = () => {
        movementDao.loadFilter({account_id: account._id}).then(items => {
            setMovements(items);
        });
    };

    const movementRenderHandler = ({item, index} : {item: Movement, index: number}) => (
        // <AccountTransactionItem transaction={item} index={index} navigation={navigation} />
        <TransactionMovementListItem  movement={item} key={index} navigation={navigation} onDelete={refreshHandler} />
    );

    const itemSeparatorHandler = () => (<View style={styles.seperator} />);

    useEffect(() => {

        refreshHandler();

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
                data={movements}
                keyExtractor={(transaction, i) => `${transaction._id}` }
                renderItem={movementRenderHandler}
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