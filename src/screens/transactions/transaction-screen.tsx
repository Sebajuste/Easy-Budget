import _ from "lodash";
import { useEffect, useState } from "react";
import { StackActions, useIsFocused } from "@react-navigation/native";
import { View } from "react-native";
import { Button, Layout, Picker, Text, TextInput } from "react-native-rapi-ui";

import { SelectDateComponent } from "../../components/select-date";
import { Envelope, EnvelopeDao } from "../../services/envelope";
import { Account, AccountDao } from "../../services/account";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import { AccountTransaction, AccountTransactionDao, TransactionType } from "../../services/transaction";
import { DaoType } from "../../services/dao";

import { t } from "../../services/i18n";





export function AccountTransactionScreen({navigation, route} : any) {

    const transaction : AccountTransaction = route.params?.transaction || {name: '', amount: 0, envelope_id: '', date: new Date()} as AccountTransaction;

    const [name, setName] = useState( transaction ? transaction.name: '');

    const [type, setType] = useState( TransactionType.OUTCOME );

    const [amount, setAmount] = useState( transaction ? `${transaction.amount}` : '');

    const [date, setDate] = useState( transaction ? ( typeof transaction.date === 'string' ? new Date(transaction.date) : transaction.date ) : new Date());

    const [envelopItems, setEnvelopItems] = useState<any[]>([]);

    const [accountItems, setAccountItems] = useState<any[]>([]);

    // const [envelopID, setEnvelopeID] = useState( transaction ? transaction.envelope_id : '' );

    const [envelope, setEnvelope] = useState<Envelope|null>();

    // const [accountID, setAccountID] = useState<string|undefined>();

    const [account, setAccount] = useState<Account|null>();

    const isFocused = useIsFocused();

    // const transactionDao = DAOFactory.getDAO<AccountTransaction>(AccountTransactionDao, DATABASE_TYPE); // getDao<AccountTransactionDao>(AccountTransactionDao, DATABASE_TYPE);
    // const accountDao = DAOFactory.getDAO<Account>(AccountDao, DATABASE_TYPE); // getDao<AccountDao>(AccountDao, DATABASE_TYPE);
    // const envelopeDao = DAOFactory.getDAO<Envelope>(EnvelopeDao, DATABASE_TYPE); // getDao<EnvelopeDao>(EnvelopeDao, DATABASE_TYPE);

    const transactionDao = DAOFactory.getDAOFromType<AccountTransaction>(DaoType.ACCOUNT_TRANSACTION, DATABASE_TYPE);
    const accountDao = DAOFactory.getDAOFromType<Account>(DaoType.ACCOUNT, DATABASE_TYPE);
    const envelopeDao = DAOFactory.getDAOFromType<Envelope>(DaoType.ENVELOPE, DATABASE_TYPE);

    const setEnvelopeHandler = (value: string) => {
        envelopeDao.find(value).then(setEnvelope);
    }

    const setAccountHandler = (value:string) => {
        accountDao.find(value).then(setAccount);
    };

    const outcomeHandler = () => {

        if( account != null ) {
            transaction.name = name;
            transaction.type = type;
            transaction.amount = parseFloat(amount);
            transaction.envelope_id = envelope?._id || '';
            transaction.account_id = account._id;
            transaction.date = date;
            transaction.reconciled = false;
            
            transactionDao.add(transaction).then(result => {
                console.log(`Result : ${result ? 'true' : 'false' }`)
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            }).catch(console.error);
        }
    };

    const incomeHandler = () => {
        if( account != null ) {
            transaction.name = name;
            transaction.amount = parseFloat(amount);
            transaction.envelope_id = envelope?._id || '';
            transaction.account_id = account._id;
            transaction.date = date;
            transaction.reconciled = false;
            transaction.type = type;

            transactionDao.add(transaction).then(result => {
                console.log(`Result : ${result ? 'true' : 'false' }`)
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            }).catch(console.error);
        }
    };

    const fillHandler = () => {

        navigation.navigate({name: 'FillEnvelope', params: {envelope: envelope}});

    };

    const incomeOutcomeItems = [{
        label: t('common:outcome'),
        value: TransactionType.OUTCOME.toString(),
    }, {
        label: t('common:income'),
        value: TransactionType.INCOME.toString(),
    }];

    useEffect(() => {
        
        envelopeDao.load().then(envelopes => {

            if( transaction ) {
                setEnvelope( _.find(envelopes, env => env._id == transaction.envelope_id) );
            }

            return envelopes.map(envelop => {
                return {
                    label: `${envelop.name} [${envelop.funds}]`,
                    value: envelop._id
                };
            });
        }).then(setEnvelopItems);

        accountDao.load().then(accounts => {
            return accounts.map(account => {
                return {
                    label: `${account.name} [${account.balance}]`,
                    value: `${account._id}`
                };
            });
        }).then(setAccountItems);

    }, [isFocused]);


    return (
        <Layout style={{margin: 10}}>

                <View style={{ flexDirection: 'row' }}>
                    <View style={{flex: 1, margin: 2}}>
                        <Text style={{ fontSize: 12 }}>{t('common:transaction_name')}</Text>
                        <TextInput
                            placeholder="Enter the transaction name"
                            value={name}
                            onChangeText={(val) => setName(val)}
                        />
                    </View>
                </View>

                <View style={{ flexDirection: 'row' }}>

                    <View>
                        <Text style={{ fontSize: 12 }}>{t('common:type')}</Text>
                        <Picker placeholder={t('type')} items={incomeOutcomeItems} value={type.toString()} onValueChange={(value:string) => setType(TransactionType[value]) } />
                    </View>

                    <View style={{flex: 1, margin: 2}}>
                        <Text style={{ fontSize: 12 }}>{t('common:amount')}</Text>
                        <TextInput
                            placeholder="0.00"
                            value={amount}
                            onChangeText={(val) => setAmount(val)}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                { type == TransactionType.OUTCOME ? (
                <View style={{ flexDirection: 'row' }}>
                    { envelope ? (
                        <View style={{flex: 1, margin: 2, flexDirection: "row"}}>
                            <Text style={{ marginTop: 12, marginBottom: 12, flex: 1 }}>{t('common:envelope')}: { envelope?.name } </Text>
                        { envelope && parseFloat(amount) > envelope.funds ?
                            <Button text="FILL" onPress={fillHandler} ></Button>
                        :
                            null
                        }
                        </View>
                    ) : (
                        <View>
                            <Text style={{ fontSize: 12 }}>Envelope </Text>
                            <Picker placeholder="Envelope" items={envelopItems} value={ `${envelope ? envelope?._id : ''}` } onValueChange={setEnvelopeHandler} ></Picker>
                        </View>
                    ) }
                </View>
                ) : null}
                

                <View style={{ flexDirection: 'row' }}>
                    <View style={{flex: 1, margin: 2}}>
                        <Text style={{ fontSize: 12 }}>Account</Text>
                        <Picker placeholder="Account" items={accountItems} value={ `${account?._id}` } onValueChange={setAccountHandler} ></Picker>
                    </View>
                </View>

                <View style={{ flexDirection: 'row' }}>
                    <View style={{flex: 1, margin: 2}}>
                        <SelectDateComponent label={t('common:date')} date={date} onChange={(newDate: Date) => setDate(newDate) } />
                    </View>
                </View>

                { type == TransactionType.OUTCOME ? (
                    <Button text={t('buttons:pay')} disabled={ !account || !envelope || parseFloat(amount) > account.balance || parseFloat(amount) > envelope.funds } onPress={outcomeHandler} />
                ) : (
                    <Button text={t('buttons:add')} disabled={ !account || parseFloat(amount) < 0 } onPress={incomeHandler} />
                ) }

        </Layout>
    );

}