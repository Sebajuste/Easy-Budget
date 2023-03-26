import { useEffect, useState } from "react";
import { ScrollView, TouchableHighlight, View } from "react-native";
import { Button, Section, SectionContent, Text } from "react-native-rapi-ui";
import { useIsFocused } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import _ from 'lodash';

import { Account, AccountDao } from "../../services/account";
import { scroll_styles } from "../../styles";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";

import { t } from "../../services/i18n";
import { DaoType } from "../../services/dao";
import ErrorMessage from "../../components/error-message";
import { acc } from "react-native-reanimated";


export function AccountListScreen ({navigation, onChange} : {navigation: any, onChange?: (accounts: Account[]) => void}) {

    const [error, setError] = useState<string|null>(null);

    const [accounts, setAccounts] = useState<Account[]>([]);

    const isFocused = useIsFocused();

    const accountDao = DAOFactory.getDAOFromType<Account>(DaoType.ACCOUNT, DATABASE_TYPE);

    const selectHandler = (account: Account) => {
        navigation.navigate({name: 'AccountTransaction', params: {account: account} });
    };

    const addAccountHandler = () => {
        navigation.navigate('CreateAccount');
    };

    useEffect(() => {
        if( accountDao != null) {
            setError(null);
            accountDao.load().then(result => {
                setAccounts(result);
                if( onChange ) onChange(result);
            }).catch(err => {
                console.error(err);
                setError(err);
            });
        } else {
            setError('Invalid AccountDao');
        }
        
    }, [isFocused])

    const total = _.sum( _.map(accounts, account => account.balance) );

    const accounts_items = accounts.map( (account, index) => {

        return (
            <TouchableHighlight onPress={() => selectHandler(account)} key={index} >
                <Section style={{margin: 5}} key={index}>
                    <SectionContent >
                        <Text>{account.name}</Text>
                        <Text>Solde : {account.balance.toFixed(2)} €</Text>
                        <Text>Réconcilié : {account.total_reconciled?.toFixed(2)} €</Text>
                        <Text>Disponnible : [{account.envelope_balance.toFixed(2)}] €</Text>
                    </SectionContent>
                </Section>
            </TouchableHighlight>
        );

    });


    return (
        <SafeAreaView style={scroll_styles.container}>

            <ErrorMessage error={error} />

            { accounts_items.length > 0 ? (
                <ScrollView style={scroll_styles.scrollView}>
                    <Text style={{textAlign: 'right', margin: 10}}>{ t('common:all_accounts')} : {total.toFixed(2)} €</Text>
                    {accounts_items}
                </ScrollView>
            ) : (
                <View style={{flex: 1, margin: 20, justifyContent: 'center', alignItems: 'center'}}>
                    <Button text={ t('buttons:add_first_account')} onPress={addAccountHandler} />
                </View>
            )}
        </SafeAreaView>
    );

}
