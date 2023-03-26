import { useIsFocused } from "@react-navigation/core";
import { useEffect, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import { DaoType } from "../../services/dao";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import { AccountTransaction, AccountTransactionDao } from "../../services/transaction";
import { scroll_styles } from "../../styles";


export default function BudgetScreen() {

    const [stats, setStats] = useState<any[]>([]);

    const transactionDao : AccountTransactionDao = DAOFactory.getDAOFromType<AccountTransaction>(DaoType.ACCOUNT_TRANSACTION, DATABASE_TYPE) as AccountTransactionDao;

    const isFocused = useIsFocused();

    const renderItemHandler = ({item, index} : {item: any, index: number}) => (
        <View style={styles.item} >
            <View style={{ ...styles.avatar, backgroundColor: item.color}}>
                <Icon name={item.icon} style={{color: 'white', fontSize: 18}} />
            </View>
            <View style={styles.details}>
                <Text style={styles.name}>{item.category}</Text>
                <Text>{item.amount} €</Text>
             </View>
        </View>
    );

    const itemSeparatorHandler = () => (<View style={styles.seperator} />);

    useEffect(() => {
        transactionDao.statsForMonth(2023, 3)//
        .then(setStats)//
        .catch(console.error);
        
    }, [isFocused]);

    return (
        <SafeAreaView style={scroll_styles.container}>
            <FlatList data={stats} keyExtractor={(stat, index) => `${index}`} renderItem={renderItemHandler} ItemSeparatorComponent={itemSeparatorHandler} />
        </SafeAreaView>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    seperator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'gray',
    },
    item: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
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
    details: {
        margin: 8,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
        color: 'black',
    },
    footer: {
        margin: 10
    }
});
