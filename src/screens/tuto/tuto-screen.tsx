import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Text } from "react-native-rapi-ui";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from 'react-native-vector-icons/FontAwesome';

import { autoFillEnvelopes, budgetPerMonth, countMonth, Envelope, fillCalculation, fillEnvelopeCalculation } from "../../services/envelope";
import { scroll_styles } from "../../styles";
import { AccountListScreen } from "../account/account-list-screen";
import EnvelopesScreen from "../envelope/envelopes-screen";
import { Account } from "../../services/account";
import { EnvelopeTransaction } from "../../services/transaction";
import { Revenue } from "../../services/revenue";
import RevenueListScreen from "../revenues/revenue-list-screen";

import { t } from "../../services/i18n";
import { Category } from "../../services/category";
import { DaoType } from "../../services/dao";
import { DatabaseContext } from "../../services/db-context";



export function TutoFinalScreen({navigation} : any) {

    const closeHandler = () => {
        // navigation.navigate({name: 'Home'});
        navigation.navigate('Main', { screen: 'Home' });
    };

    return (
        <SafeAreaView style={scroll_styles.container}>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{margin: 10, fontSize: 24}}>{t('tutorial:app_ready')}</Text>
            </View>

            <View style={{margin: 10}}>
                <Button text={t('common:close')} onPress={closeHandler}></Button>
            </View>

        </SafeAreaView>
    );

}



interface FirstFillInfo {
    fill_required: number;
    total_funds: number
}

export function TutoFirstFillEnvelopeScreen({navigation} : any) {

    const [info, setInfo] = useState({fill_required: 0, total_funds: 0} as FirstFillInfo);

    const { dbManager } = useContext(DatabaseContext);

    const envelopeDao = dbManager.getDAOFromType<Envelope>(DaoType.ENVELOPE);
    const accountDao = dbManager.getDAOFromType<Account>(DaoType.ACCOUNT);
    // const transactionDao = dbManager.getDAOFromType<EnvelopeTransaction>(DaoType.ENVELOPE_TRANSACTION);

    
    /*
    const fillCalculation = () => {

        return Promise.all([envelopeDao?.load(), accountDao?.load()]).then(([envelopes, accounts]) => {

            const fill_required_envelopes = _.map(fillEnvelopeCalculation(envelopes), ([envelope, fill_required]) => (fill_required) );
            const fill_required = _.sum(fill_required_envelopes);
            const total_funds = _.sum( _.map(accounts, account => account.envelope_balance) );

            return {
                fill_required: fill_required,
                total_funds: total_funds
            };
        });
        
    };
    */

    const nextHandler = () => {

        navigation.navigate({name: 'TutoFinalScreen'});
    };

    const fillAutoHandler = () => {

        /*
        const now = new Date();

        Promise.all([envelopeDao.load(), accountDao.load()])//
            .then(([envelopes, accounts]) => {

                const temp_accounts = _.map(accounts, account => ({account: account, temp_balance: account.envelope_balance}));

                return _.map(fillEnvelopeCalculation(envelopes), ([envelope, fill_required]) => {
                    const temp_account = _.find(temp_accounts, temp_account => temp_account.temp_balance >= fill_required);

                    if( temp_account ) {
                        temp_account.temp_balance -= fill_required;
                        const transaction : EnvelopeTransaction = {
                            name: `Auto fill ${envelope.name as string}`,
                            amount: fill_required as number,
                            envelope_id: envelope._id,
                            account_id: temp_account.account._id,
                            date: now,
                        } as EnvelopeTransaction;

                        return transaction;
                    }
                    console.error(`Oups cannot create transaction`);
                    throw new Error(`No account found to fill amount [${fill_required}]`);
                });
            }).then(transactions => _.filter(transactions, tx => tx.amount != 0) )//
            .then( transactions => transactionDao.addAll(transactions) )//
            .then(result => {
                nextHandler();
            })//
            .catch(console.error);
        */

            /*
        Promise.all([envelopeDao?.load(), accountDao?.load()]).then( ([envelopes, accounts]) => autoFillEnvelopes(envelopes, accounts) ) //
        .then( transactions => transactionDao.addAll(transactions) ) //
        .then( result => nextHandler() )//
        .catch(console.error);
        */
    };

    useEffect(() => {

        Promise.all([envelopeDao?.load(), accountDao?.load()]).then(([envelopes, accounts]) => fillCalculation(envelopes, accounts) ).then(setInfo);

        // fillCalculation().then(setInfo);
    }, []);

    const canBeAutoFilled = info.total_funds >= info.fill_required;

    const nothingToFill = info.fill_required == 0;

    return (
        <SafeAreaView style={scroll_styles.container}>

            <View style={{margin: 10, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{margin: 10, fontSize: 24}}></Text>
            </View>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                <View style={{ margin: 10 }}>
                { nothingToFill ?
                    <Text>{t('tutorial:nothing_tobe_fill')}</Text>
                : (
                    canBeAutoFilled ? (<Text>{t('tutorial:fill_info')}</Text>) : (<Text>{t('tutorial:cannot_fill_info')}</Text>)
                ) }
                </View>

                { canBeAutoFilled ? (
                    <View style={{borderWidth: 1, borderColor: 'green', borderRadius: 100, padding: 20}}>
                        <Icon style={{fontSize: 50, color: 'green'}} name="check" />
                    </View>
                ) : (
                    <View style={{borderWidth: 1, borderColor: 'red', borderRadius: 100, padding: 20}}>
                        <Icon style={{fontSize: 50, color: 'red'}} name="remove" />
                    </View>
                ) }
                
                <View style={{marginTop: 30}}>
                     { nothingToFill ?
                        <Button text={t('common:next')} onPress={nextHandler} />
                     :
                        <Button disabled={!canBeAutoFilled} text={t('common:fill_auto')} onPress={fillAutoHandler} />
                     }
                    
                </View>
            </View>

        </SafeAreaView>
    );
}



export function TutoInfoFillEnvelopeScreen({navigation} : any) {

    const nextHandler = () => {

        navigation.navigate({name: 'TutoFirstFillEnvelopeScreen'});

    };

    return (
        <SafeAreaView style={scroll_styles.container}>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{margin: 10, fontSize: 24}}>{t('tutorial:fill_envelopes')}</Text>
            </View>

            <View style={{margin: 10}}>
                <Button text={t('common:next')} onPress={nextHandler}></Button>
            </View>

        </SafeAreaView>
    );

}


export function TutoEnvelopeScreen({navigation} : any) {

    const [countCategories, setCountCategories] = useState(0);

    const changeHandler = (categories: Category[]) => {
        setCountCategories(categories.length);
    };

    const nextHandler = () => {
        navigation.navigate({name: 'TutoInfoFillEnvelopeScreen'});
    };


    return (
        <>
            <EnvelopesScreen navigation={navigation} onChange={changeHandler} />
            { countCategories > 0 ? (
                <View style={{margin: 10}}>
                    <Button text={t('common:next')} onPress={nextHandler}></Button>
                </View>
            ) : null }
            
        </>
    );

}

export function TutoInfoEnvelopeScreen({navigation} : any) {

    const nextHandler = () => {

        navigation.navigate({name: 'TutoEnvelopeScreen'});

    };

    return (
        <SafeAreaView style={scroll_styles.container}>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{margin: 10, fontSize: 24}}>{t('tutorial:create_categories_and_envelopes')}</Text>
            </View>

            <View style={{margin: 10}}>
                <Button text={t('common:next')} onPress={nextHandler}></Button>
            </View>

        </SafeAreaView>
    );

}

export function TutoRevenueScreen({navigation} : any) {

    const [countRevenues, setcountRevenues] = useState(0);

    const changeHandler = (revenues: Revenue[]) => {
        setcountRevenues(revenues.length);
    };

    const nextHandler = () => {
        navigation.navigate({name: 'TutoInfoEnvelopeScreen'});
    };

    return (
        <>
            <RevenueListScreen navigation={navigation} onChange={changeHandler} />
            { countRevenues > 0 ? (
                <View style={{margin: 10}}>
                    <Button text={t('common:next')} onPress={nextHandler}></Button>
                </View>
            ) : null }
        </>
    );
}

export function TutoInfoRevenueScreen({navigation} : any) {

    const nextHandler = () => {

        navigation.navigate({name: 'TutoRevenueScreen'});

    };

    return (
        <SafeAreaView style={scroll_styles.container}>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{margin: 10, fontSize: 24}}>{t('tutorial:enter_revenues')}</Text>
            </View>

            <View style={{margin: 10}}>
                <Button text={t('common:next')} onPress={nextHandler}></Button>
            </View>

        </SafeAreaView>
    );

}

export function TutoAccountScreen({navigation} : any) {

    const [countAccount, setCountAccount] = useState(0);

    const changeHandler = (accounts: Account[]) => {
        setCountAccount(accounts.length);
    }

    const nextHandler = () => {
        navigation.navigate({name: 'TutoInfoRevenueScreen'});
    };

    return (
        <>
            <AccountListScreen navigation={navigation} onChange={changeHandler}></AccountListScreen>

            { countAccount > 0 ? (
                <View style={{margin: 10}}>
                    <Button text={t('common:next')} onPress={nextHandler}></Button>
                </View>
            ) : null }
            
        </>
    );

}


export function TutoScreen({navigation} : any) {


    const nextHandler = () => {

        navigation.navigate({name: 'TutoAccountScreen'});

    };

    return (
        <SafeAreaView style={scroll_styles.container}>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{margin: 10, fontSize: 24}}>{t('tutorial:start')}</Text>
            </View>

            <View style={{margin: 10}}>
                <Button text={t('common:next')} onPress={nextHandler}></Button>
            </View>

        </SafeAreaView>
    );

}
