import _ from "lodash";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Text, TextInput } from "react-native-rapi-ui";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from 'react-native-vector-icons/FontAwesome';
import { budgetPerMonth, countMonth, Envelope, EnvelopeDao } from "../../services/envelope";
import { scroll_styles } from "../../styles";
import { AccountListScreen } from "../account/account-list-screen";
import EnvelopesScreen from "../envelope/envelopes-screen";
import { Account, AccountDao } from "../../services/account";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import { EnvelopeTransaction, EnvelopeTransactionDao } from "../../services/transaction";
import { SettingsDao } from "../../services/settings";
import RevenueScreen from "../revenues/revenue-screen";
import { Revenue } from "../../services/revenue";
import RevenueListScreen from "../revenues/revenue-list-screen";
import { DaoType } from "../../services/dao";
import { Category } from "../../services/category";



export function TutoFinalScreen({navigation} : any) {

    const closeHandler = () => {
        navigation.navigate({name: 'Home'});
    };

    return (
        <SafeAreaView style={scroll_styles.container}>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{margin: 10, fontSize: 24}}>Your app is now ready to be used ! Enjoy</Text>
            </View>

            <View style={{margin: 10}}>
                <Button text="CLOSE" onPress={closeHandler}></Button>
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

    const envelopeDao = DAOFactory.getDAOFromType<Envelope>(DaoType.ENVELOPE, DATABASE_TYPE);
    const accountDao = DAOFactory.getDAOFromType<Account>(DaoType.ACCOUNT, DATABASE_TYPE);
    const transactionDao = DAOFactory.getDAOFromType<EnvelopeTransaction>(DaoType.ENVELOPE_TRANSACTION, DATABASE_TYPE);

    const fillEnvelopeCalculation = (envelopes : Envelope[]) : any[] => {

        const now = new Date();

        // const eveloped_filtered = _.orderBy(envelopes, ['dueDate'], ['asc']).filter(envelope => envelope.funds < envelope.amount && ( typeof envelope.dueDate === 'string' ? new Date(envelope.dueDate) : envelope.dueDate.getTime()) >= now.getTime() );
        const eveloped_filtered = _.orderBy(envelopes, ['dueDate'], ['asc']).filter(envelope => envelope.funds < envelope.amount );

        return _.map( eveloped_filtered , envelope => {
            const month_budget = budgetPerMonth(envelope.amount, envelope.period);
            const dueDate = typeof envelope.dueDate === 'string' ? new Date(envelope.dueDate) : envelope.dueDate;
            const count_month = countMonth(envelope.period);
            const delta_year = dueDate.getFullYear() - now.getFullYear();
            const delta_month = Math.min(count_month, delta_year*12 + (dueDate.getMonth() - now.getMonth()) );
            console.log(`fillEnvelopeCalculation [${envelope.name}] count_month: ${count_month}, delta_month: ${delta_month}`)
            const month_to_be_filled = count_month - delta_month;
            console.log(`fillEnvelopeCalculation [${envelope.name}] month_budget: ${month_budget}, month_to_be_filled: ${month_to_be_filled}, envelope.funds: ${envelope.funds}`)
            const filled_require = month_budget * month_to_be_filled - envelope.funds;
            console.log(`fillEnvelopeCalculation [${envelope.name}] filled_require: ${filled_require}`);
            return [envelope, filled_require];
        });

    };

    const fillCalculation = () => {

        Promise.all([envelopeDao?.load(), accountDao?.load()]).then(([envelopes, accounts]) => {

            const fill_required_envelopes = _.map(fillEnvelopeCalculation(envelopes), ([envelope, fill_required]) => (fill_required) );
            const fill_required = _.sum(fill_required_envelopes);
            const total_funds = _.sum( _.map(accounts, account => account.envelope_balance) );

            return {
                fill_required: fill_required,
                total_funds: total_funds
            };
        }).then(setInfo);
        

    };

    const nextHandler = () => {

        navigation.navigate({name: 'TutoFinalScreen'});
    };

    const fillAutoHandler = () => {

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
    };

    useEffect(() => {
        fillCalculation();
    }, []);

    const canBeAutoFilled = info.total_funds >= info.fill_required;

    const nothingToFill = info.fill_required == 0;

    return (
        <SafeAreaView style={scroll_styles.container}>

            <View style={{margin: 10, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{margin: 10, fontSize: 24}}>You have the balance to fill automatically your envelopes.</Text>
            </View>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                { nothingToFill ? <Text>Nothing to be filled</Text> : null }

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
                        <Button text="NEXT" onPress={nextHandler} />
                     :
                        <Button disabled={!canBeAutoFilled}  text="FILL AUTO" onPress={fillAutoHandler} />
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
                <Text style={{margin: 10, fontSize: 24}}>Start to fill your envelopes. After that, each month, you must to fill the envelopes with the revenue splited.</Text>
            </View>

            <View style={{margin: 10}}>
                <Button text="NEXT" onPress={nextHandler}></Button>
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
                    <Button text="NEXT" onPress={nextHandler}></Button>
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
                <Text style={{margin: 10, fontSize: 24}}>Create your categories, and the envelopes then configure them.</Text>
            </View>

            <View style={{margin: 10}}>
                <Button text="NEXT" onPress={nextHandler}></Button>
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
                    <Button text="NEXT" onPress={nextHandler}></Button>
                </View>
            ) : null }
        </>
    );
}

export function TutoAccountScreen({navigation} : any) {

    const [countAccount, setCountAccount] = useState(0);

    const changeHandler = (accounts: Account[]) => {
        setCountAccount(accounts.length);
    }

    const nextHandler = () => {
        navigation.navigate({name: 'TutoRevenueScreen'});
    };

    return (
        <>
            <AccountListScreen navigation={navigation} onChange={changeHandler}></AccountListScreen>

            { countAccount > 0 ? (
                <View style={{margin: 10}}>
                    <Button text="NEXT" onPress={nextHandler}></Button>
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
                <Text style={{margin: 10, fontSize: 24}}>Start to create your accounts, and initialize them with the current balance.</Text>
            </View>

            <View style={{margin: 10}}>
                <Button text="NEXT" onPress={nextHandler}></Button>
            </View>

        </SafeAreaView>
    );

}
