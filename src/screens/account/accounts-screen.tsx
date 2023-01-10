import { ScrollView, TouchableHighlight } from "react-native";
import { Section, SectionContent, Text } from "react-native-rapi-ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { Account } from "../../services/account";
import { scroll_styles } from "../../styles";

import _ from 'lodash';
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { AccountDaoStorage } from "../../services/async_storage/account_async_storage";

const ACCOUNTS = [{
    _id: 'a',
    name: 'Courant',
    balance: 500,
    envelope_balance: 0
}, {
    _id: 'b',
    name: 'Epargne',
    balance: 1500,
    envelope_balance: 0
}] as Array<Account>;



export function AccountView() {


}


export function AccountsScreen ({navigation} : any) {

    const [accounts, setAccounts] = useState<Account[]>([]);

    const isFocused = useIsFocused();

    useEffect(() => {
        const accountDao = new AccountDaoStorage();
        accountDao.load().then(setAccounts);
    }, [isFocused])

    const selectHandler = (account: Account) => {
        navigation.navigate({name: 'AccountTransaction', params: {account: account} });
    };

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
            <ScrollView style={scroll_styles.scrollView}>

                <Text style={{textAlign: 'right', margin: 10}}>All accounts : {total} €</Text>

                {accounts_items}

            </ScrollView>
        </SafeAreaView>
    );

}
