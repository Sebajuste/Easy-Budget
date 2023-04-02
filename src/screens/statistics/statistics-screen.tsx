import { useIsFocused } from "@react-navigation/core";
import _ from "lodash";
import { useEffect, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { Button } from "react-native-rapi-ui";
import Icon from 'react-native-vector-icons/FontAwesome';
import { DaoType } from "../../services/dao";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import { t } from "../../services/i18n";
import { AccountTransaction, AccountTransactionDao } from "../../services/transaction";
import { scroll_styles } from "../../styles";
import { horizontalScale } from "../../util/ui-metrics";


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


export default function StatisticsScreen({navigation} : {navigation : any}) {

    const [stats, setStats] = useState<any[]>([]);

    const [date, setDate] = useState(new Date());

    const transactionDao : AccountTransactionDao = DAOFactory.getDAOFromType<AccountTransaction>(DaoType.ACCOUNT_TRANSACTION, DATABASE_TYPE) as AccountTransactionDao;

    const isFocused = useIsFocused();

    const updateStats = (date: Date) => {
        transactionDao.statsForMonth(date.getFullYear(), date.getMonth()+1)//
        .then(setStats)//
        .catch(console.error);
    };

    const previousHandler = () => {
        setDate(oldDate => {
            oldDate.setUTCMonth( oldDate.getUTCMonth() - 1);
            updateStats(oldDate);
            return oldDate;
        });
    };

    const nextHandler = () => {
        setDate(oldDate => {
            oldDate.setUTCMonth( oldDate.getUTCMonth() + 1);
            updateStats(oldDate);
            return oldDate;
        });
    };

    const selectCategoryHandler = (categoryID: string|number) => {
        navigation.navigate({name: 'StatisticsCategory', params: {date: date.toISOString(), categoryID: categoryID}});
    };

    const renderItemHandler = ({item, index} : {item: any, index: number}) => (
        <TouchableHighlight onPress={() => selectCategoryHandler(item.categoryID)} key={index} >
            <View style={styles.item}>
                <View style={{ ...styles.avatar, backgroundColor: item.color}}>
                    <Icon name={item.icon} style={{color: 'white', fontSize: 18}} />
                </View>
                <View style={styles.details}>
                    <Text style={styles.name}>{item.category}</Text>
                    <Text>{item.amount.toFixed(2)} €</Text>
                </View>
            </View>
        </TouchableHighlight>
    );

    const itemSeparatorHandler = () => (<View style={styles.seperator} />);

    useEffect(() => {
        updateStats(date);
    }, [isFocused, date]);

    const total : number = _.sum( _.map(stats, item => item.amount ) );

    return (
        <SafeAreaView style={scroll_styles.container}>

            <View style={{flexDirection: "row", height: 50, margin: 10}}>
                <Button text={t('buttons:previous')} onPress={previousHandler} />
                <View style={{flex: 1, margin: 5}}>
                    <Text>Year : {date.getFullYear() }</Text>
                    <Text>Month : { getMonth(date.getMonth()) }</Text>
                </View>
                <Button text={t('buttons:next')} onPress={nextHandler} />
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
