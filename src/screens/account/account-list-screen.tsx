import { useContext, useEffect, useState } from "react";
import { ScrollView, TouchableHighlight, View } from "react-native";
import { Button, Section, SectionContent, Text } from "react-native-rapi-ui";
import { useIsFocused } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import _ from 'lodash';

import { BankAccount } from "../../services/account";
import { scroll_styles } from "../../styles";

import { t } from "../../services/i18n";
import { DaoType } from "../../services/dao";
import ErrorMessage from "../../components/error-message";;
import { DatabaseContext } from "../../services/db-context";
import { Movement } from "../../services/transaction";
import { MovementDao } from "../../services/transaction";
import { TransactionAccount } from "../../services/transaction";
import { getBankTotalAvailabity } from "../../services/sqlite/account-sqlite";


export function AccountListScreen ({navigation, onChange} : {navigation: any, onChange?: (accounts: BankAccount[]) => void}) {

    const [error, setError] = useState<string|null>(null);

    const [accounts, setAccounts] = useState<BankAccount[]>([]);

    const [totalAvailable, setTotalAvailable] = useState(0);

    const isFocused = useIsFocused();

    const { dbManager } = useContext(DatabaseContext);

    const bankAccountDao = dbManager.getDAOFromType<BankAccount>(DaoType.BANK_ACCOUNT);
    const movementDao = dbManager.getDAOFromType<Movement>(DaoType.TRANSACTION_MOVEMENT) as MovementDao;
    const accountTxDao = dbManager.getDAOFromType<TransactionAccount>(DaoType.TRANSACTION_ACCOUNT);

    const selectHandler = (account: BankAccount) => {
        navigation.navigate({name: 'AccountView', params: {account: account} });
    };

    const addAccountHandler = () => {
        navigation.navigate('CreateAccount');
    };

    useEffect(() => {
        if( bankAccountDao != null) {
            setError(null);
            bankAccountDao.load().then(result => {
                setAccounts(result);
                if( onChange ) onChange(result);
            }).catch(err => {
                console.error(err);
                setError(err);
            });
        } else {
            setError('Invalid AccountDao');
        }
        
        getBankTotalAvailabity(movementDao).then(setTotalAvailable);

    }, [isFocused])

    const total = _.sum( _.map(accounts, account => account.balance) );

    const capital = 0;

    const accounts_items = accounts.map( (account: BankAccount, index) => {

        console.log(account);

        return (
            <TouchableHighlight onPress={() => selectHandler(account)} key={index} >
                <Section style={{margin: 5}} key={index}>
                    <SectionContent >
                        <Text>{account.name}</Text>
                        <Text>Solde : {account.balance.toFixed(2)} €</Text>
                        <Text>Réconcilié : {account.total_reconciled?.toFixed(2)} €</Text>
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
                    <Text style={{textAlign: 'right', margin: 10}}>{ t('common:availability')} : {totalAvailable.toFixed(2)} €</Text>
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
