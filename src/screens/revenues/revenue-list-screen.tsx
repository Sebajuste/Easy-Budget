import { useIsFocused } from "@react-navigation/native";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { ScrollView, TouchableHighlight, View } from "react-native";
import { Button, Section, SectionContent, Text } from "react-native-rapi-ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { DaoType } from "../../services/dao";

import { t } from "../../services/i18n";
import { Revenue } from "../../services/revenue";

import { scroll_styles } from "../../styles";
import { DatabaseContext } from "../../services/db-context";
import { Envelope } from "../../services/envelope";
import { BankAccount } from "../../services/account";
import { EnvelopeTransaction } from "../../services/transaction";
import { ConfirmModal } from "../../components/modal";

function FillResultModal() {

    return (
        <ConfirmModal visible={true}>

        </ConfirmModal>
    );

}

function RevenueView({ onSelect, revenue } : { onSelect?: (revenue: Revenue) => void, revenue : Revenue}) {

    const selectHandler = (event : any) => {
        if( onSelect ) {
            onSelect(revenue);
        }
    };

    return (
        <TouchableHighlight onPress={selectHandler} >
            <Section style={{margin: 5}}>
                <SectionContent>
                    <Text>{revenue.name}</Text>
                    <Text>{revenue.amount} €</Text>
                </SectionContent>
            </Section>
        </TouchableHighlight>
    );

}


export default function RevenueListScreen({navigation, onChange} : {navigation: any, onChange?: (revenues: Revenue[]) => void }) {

    const [revenues, setRevenues] = useState<Revenue[]>([]);

    const { dbManager } = useContext(DatabaseContext);

    const revenueDao = dbManager.getDAOFromType<Revenue>(DaoType.REVENUE);
    // const envelopeDao = dbManager.getDAOFromType<Envelope>(DaoType.ENVELOPE);
    // const bankAccountDao = dbManager.getDAOFromType<BankAccount>(DaoType.BANK_ACCOUNT);
    // const transactionDao = dbManager.getDAOFromType<EnvelopeTransaction>(DaoType.ENVELOPE_TRANSACTION);

    const isFocused = useIsFocused();

    const fillHandler= () => {
        /*
        Promise.all([envelopeDao?.load(), accountDao?.load()]).then( ([envelopes, accounts]) => autoFillEnvelopes(envelopes, accounts) ) //
        .then( transactions => transactionDao.addAll(transactions) ) //
        .then( result => nextHandler() )//
        .catch(console.error);
        */
    };

    const addRevenueHandler = () => {
        navigation.navigate('CreateRevenue')
    };

    const onSelectHandler = (revenue : Revenue) => {
        navigation.navigate({name: 'EditRevenue', params: {revenue: revenue} });
    };

    useEffect(() => {
        revenueDao.load().then(revenues => {
            setRevenues(revenues);
            if( onChange ) onChange(revenues);
        });
    }, [isFocused]);

    

    const total = _.sum( _.map(revenues, revenue => revenue.amount) );

    const revenue_items = revenues.map((revenue, index) => <RevenueView key={index} onSelect={onSelectHandler} revenue={revenue} />)

    /*
    <View style={{flex: 1, margin: 20, justifyContent: 'center', alignItems: 'center'}}>
        <Button text={t('buttons:fill')} onPress={fillHandler} />
    </View>
    */

    return (
        <SafeAreaView style={scroll_styles.container}>

            <ScrollView style={scroll_styles.scrollView}>
                <Text style={{textAlign: 'right', margin: 10}}>{t('common:all_revenues')} : {total} €</Text>
                {revenue_items}
            </ScrollView>

            <View style={{flex: 1, margin: 20, justifyContent: 'center', alignItems: 'center'}}>
                <Button text={t('buttons:add')} onPress={addRevenueHandler} />
            </View>

        </SafeAreaView>
    );

}