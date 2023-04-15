import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';

import { DaoType } from "../../services/dao";
import { LanguageContext, t } from "../../services/i18n";
import { AccountTransaction, AccountTransactionDao } from "../../services/transaction";
import { scroll_styles } from "../../styles";
import { horizontalScale } from "../../util/ui-metrics";
import { DatabaseContext } from "../../services/db-context";

const MONTHS : {[key:number]:string}= {
    0: 'Janvier',
    1: 'Février',
    2: 'Mars',
    3: 'Avril',
    4: 'Mai',
    5: 'Juin',
    6: 'Juillet',
    7: 'Aout',
    8: 'Septembre',
    9: 'Octobre',
    10: 'Novembre',
    11: 'Décembre'
}

function getMonth(index: number) : string {
    if( MONTHS.hasOwnProperty(index)  ) {
        return MONTHS[index];
    }
    return '???';
}

export default function StatisticsCategoryScreen({route} : {route: any}) {

    const date = new Date(route.params?.date);

    const categoryID : string|number = route.params?.categoryID;

    const { language } = useContext(LanguageContext);

    const [stats, setStats] = useState<any[]>([]);

    const { dbManager } = useContext(DatabaseContext);

    const transactionDao = dbManager.getDAOFromType<AccountTransaction>(DaoType.ACCOUNT_TRANSACTION) as AccountTransactionDao;

    const renderItemHandler = ({item, index} : {item: any, index: number}) => (
        <View style={styles.item} key={index}>
            <View style={{ ...styles.avatar, backgroundColor: item.color}}>
                <Icon name={item.icon} style={{color: 'white', fontSize: 18}} />
            </View>
            <View style={styles.details}>
                <Text style={styles.name}>{item.name}</Text>
                <Text>{ new Date(item.date).toLocaleDateString(language) }</Text>
             </View>
             <View style={styles.container}>
                <Text style={{textAlign: 'right'}}>{item.amount.toFixed(2)} €</Text>
             </View>
        </View>
    );

    const itemSeparatorHandler = () => (<View style={styles.seperator} />);

    useEffect(() => {
        transactionDao.statsCategoryForMonth(date.getFullYear(), date.getUTCMonth()+1, categoryID)//
        .then(setStats)//
        .catch(console.error);
        
    }, []);

    const total : number = _.sum( _.map(stats, item => item.amount ) );

    // const month = date.toLocaleString('default', { month: 'long' });

    return (
        <SafeAreaView style={scroll_styles.container}>

            <View style={{flexDirection: "row", height: 50, margin: 10}}>
                <View style={{flex: 1, margin: 5}}>
                    <Text>Year : {date.getFullYear() }</Text>
                    <Text>Month : { getMonth(date.getMonth()) }</Text>
                </View>
            </View>

            <FlatList data={stats} keyExtractor={(stat, index) => `${index}`} renderItem={renderItemHandler} ItemSeparatorComponent={itemSeparatorHandler} />

            <View style={{flexDirection: 'row', justifyContent: 'space-around', margin: 5, borderRadius: 10, backgroundColor: 'white', flexWrap: 'wrap'}}>
                <View style={{margin: 5, padding: 5, borderRadius: 10, minWidth: horizontalScale(110)}}>
                    <Text style={{textAlign: 'center'}}>{total.toFixed(2)} €</Text>
                    <Text style={{textAlign: 'center', fontSize: 12}}>{t('common:total')}</Text>
                </View>
            </View>

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