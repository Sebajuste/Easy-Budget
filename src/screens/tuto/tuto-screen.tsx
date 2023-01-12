import _ from "lodash";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Text, TextInput } from "react-native-rapi-ui";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from 'react-native-vector-icons/FontAwesome';
import { AccountDaoStorage } from "../../services/async_storage/account_async_storage";
import { EnvelopeDaoStorage } from "../../services/async_storage/budget_async_storage";
import { SettingsDaoStorage } from "../../services/async_storage/settings_async_storage";
import { budgetPerMonth, countMonth, Envelope } from "../../services/budget";
import { Transaction, TransactionType } from "../../services/transaction";
import { scroll_styles } from "../../styles";
import { AccountsScreen } from "../account/accounts-screen";
import EnvelopesScreen from "../envelope/envelopes-screen";
import uuid from 'react-native-uuid';
import { TransactionDaoStorage } from "../../services/async_storage/transaction_async_storage";



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

    const fillEnvelopeCalculation = (envelopes : Envelope[]) : any[] => {

        const now = new Date();

        // const eveloped_filtered = _.orderBy(envelopes, ['dueDate'], ['asc']).filter(envelope => envelope.funds < envelope.amount && ( typeof envelope.dueDate === 'string' ? new Date(envelope.dueDate) : envelope.dueDate.getTime()) >= now.getTime() );
        const eveloped_filtered = _.orderBy(envelopes, ['dueDate'], ['asc']).filter(envelope => envelope.funds < envelope.amount );

        return _.map( eveloped_filtered , envelope => {
            const month_budget = budgetPerMonth(envelope.amount, envelope.period);
            const dueDate = typeof envelope.dueDate === 'string' ? new Date(envelope.dueDate) : envelope.dueDate;
            const count_month = countMonth(envelope.period);
            const delta_month = Math.min(1, ( (dueDate.getFullYear() - now.getFullYear()) * 12 + (dueDate.getMonth() - now.getMonth())) % 3);
            console.log(`fillEnvelopeCalculation [${envelope.name}] count_month: ${count_month}, delta_month: ${delta_month}`)
            const month_to_be_filled = count_month - delta_month;
            console.log(`fillEnvelopeCalculation [${envelope.name}] month_budget: ${month_budget}, month_to_be_filled: ${month_to_be_filled}, envelope.funds: ${envelope.funds}`)
            const filled_require = month_budget * month_to_be_filled - envelope.funds;
            console.log(`fillEnvelopeCalculation [${envelope.name}] filled_require: ${filled_require}`);
            return [envelope, filled_require];
        });

    };

    const fillCalculation = () => {

        const envelopeDao = new EnvelopeDaoStorage();
        const accountDao = new AccountDaoStorage();

        Promise.all([envelopeDao.load(), accountDao.load()]).then(([envelopes, accounts]) => {

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

        const envelopeDao = new EnvelopeDaoStorage();
        const transactionDao = new TransactionDaoStorage();
        const accountDao = new AccountDaoStorage();

        const now = new Date();

        Promise.all([envelopeDao.load(), accountDao.load()])//
            .then(([envelopes, accounts]) => {

                const temp_accounts = _.map(accounts, account => ({account: account, temp_balance: account.envelope_balance}));

                return _.map(fillEnvelopeCalculation(envelopes), ([envelope, fill_required]) => {
                    const temp_account = _.find(temp_accounts, temp_account => temp_account.temp_balance >= fill_required);

                    if( temp_account ) {
                        temp_account.temp_balance -= fill_required;
                        const transaction : Transaction = {
                            _id: uuid.v4() as string,
                            name: `Auto fill ${envelope.name as string}`,
                            transactionType: TransactionType.FILL,
                            amount: fill_required as number,
                            envelope_id: envelope._id,
                            account_id: temp_account.account._id,
                            date: now,
                            reconciled: false
                        } as Transaction;

                        return transaction;
                    }
                    console.error(`Oups cannot create transaction`);
                    throw new Error(`No account found to fill amount [${fill_required}]`);
                });

            }).then( (transactions) => {
                return transactionDao.addAll(transactions);
            } )//
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

                { canBeAutoFilled ? <Icon style={{fontSize: 50, color: 'green'}} name="check" /> : <Icon style={{fontSize: 50, color: 'red'}} name="remove" /> }
                
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
                <Text style={{margin: 10, fontSize: 24}}>Start to fill your envelopes. After that, each month, you must the envelopes with the revenue splited.</Text>
            </View>

            <View style={{margin: 10}}>
                <Button text="NEXT" onPress={nextHandler}></Button>
            </View>

        </SafeAreaView>
    );

}


export function TutoEnvelopeScreen({navigation} : any) {

    const nextHandler = () => {
        navigation.navigate({name: 'TutoInfoFillEnvelopeScreen'});
    };


    return (
        <>
            <EnvelopesScreen navigation={navigation} />
            <View style={{margin: 10}}>
                <Button text="NEXT" onPress={nextHandler}></Button>
            </View>
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

    const [revenue, setRevenue] = useState('0.00');

    const settingsDao = new SettingsDaoStorage();

    const nextHandler = () => {

        
        settingsDao.load().then(settings => {
            settings.revenue = parseFloat(revenue);
            return settings;
        }).then(settingsDao.save)//
        .then(v => {
            navigation.navigate({name: 'TutoInfoEnvelopeScreen'});
        })

    };

    useEffect(() => {
        settingsDao.load().then(settings => {
            setRevenue(settings.revenue.toFixed(2));
        });
    }, []);

    const revenueValid = revenue && revenue.trim().length > 0 && parseFloat(revenue) >= 0;

    return (
        <SafeAreaView style={scroll_styles.container}>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{margin: 10, fontSize: 24}}>Enter your average global revenue per month</Text>

                <View style={{ margin: 20, width: 200}}>
                    <TextInput style={{textAlign: 'center'}} value={revenue} onChangeText={setRevenue} />
                </View>

            </View>

            <View style={{margin: 10}}>
                <Button text="NEXT" disabled={!revenueValid} onPress={nextHandler}></Button>
            </View>

        </SafeAreaView>
    );

}


export function TutoAccountScreen({navigation} : any) {

    const nextHandler = () => {

        navigation.navigate({name: 'TutoRevenueScreen'});

    };

    return (
        <>
            <AccountsScreen navigation={navigation}></AccountsScreen>
            <View style={{margin: 10}}>
                <Button text="NEXT" onPress={nextHandler}></Button>
            </View>
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
