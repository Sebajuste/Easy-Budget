import { ScrollView, TouchableHighlight, View } from "react-native";
import { Button, Section, SectionContent, Text } from "react-native-rapi-ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { Account, AccountDao } from "../../services/account";
import { scroll_styles } from "../../styles";

import _ from 'lodash';
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { AccountDaoStorage } from "../../services/async_storage/account_async_storage";
import { DATABASE_TYPE, getDao } from "../../services/dao-manager";

export function AccountView() {


}


export function AccountsScreen ({navigation, onChange} : {navigation: any, onChange?: (accounts: Account[]) => void}) {

    const [accounts, setAccounts] = useState<Account[]>([]);

    const isFocused = useIsFocused();

    const selectHandler = (account: Account) => {
        navigation.navigate({name: 'AccountTransaction', params: {account: account} });
    };

    const addAccountHandler = () => {
        navigation.navigate('CreateAccount');
    };

    useEffect(() => {
        
        // const accountDao = new AccountDaoStorage();
        const accountDao = getDao<AccountDao>(AccountDao, DATABASE_TYPE);
        accountDao?.load().then(result => {
            setAccounts(result);
            if( onChange ) onChange(result);
        });
    }, [isFocused])

    

    const total = _.sum( _.map(accounts, account => account.balance) );

    const accounts_items = accounts.map( (account, index) => {

        return (
            <TouchableHighlight onPress={() => selectHandler(account)} key={index} >
                <Section style={{margin: 5}} key={index}>
                    <SectionContent >
                        <Text>{account.name}</Text>
                        <Text>{account.balance} €</Text>
                        <Text>[{account.envelope_balance}] €</Text>
                    </SectionContent>
                </Section>
            </TouchableHighlight>
        );

    });


    return (
        <SafeAreaView style={scroll_styles.container}>
            { accounts_items.length > 0 ? (
                <ScrollView style={scroll_styles.scrollView}>
                    <Text style={{textAlign: 'right', margin: 10}}>All accounts : {total} €</Text>
                    {accounts_items}
                </ScrollView>
            ) : (
                <View style={{flex: 1, margin: 20, justifyContent: 'center', alignItems: 'center'}}>
                    <Button text="Add your first account" onPress={addAccountHandler} />
                </View>
            )}
        </SafeAreaView>
    );

}
