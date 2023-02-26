import _ from "lodash";
import { useEffect, useState } from "react";
import { StackActions, useIsFocused } from "@react-navigation/native";
import { View } from "react-native";
import { Button, Layout, Picker, Text, TextInput } from "react-native-rapi-ui";

import { SelectDateComponent } from "../../components/select-date";
import { Envelope } from "../../services/envelope";
import { Account } from "../../services/account";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import { AccountTransaction, TransactionType } from "../../services/transaction";
import { DaoType } from "../../services/dao";

import { t } from "../../services/i18n";
import { styles_form } from "../../styles";


export function AccountTransactionScreen({navigation, route} : any) {

    const transaction : AccountTransaction = route.params?.transaction || {name: '', amount: 0, envelope_id: '', date: new Date()} as AccountTransaction;

    const [name, setName] = useState( transaction ? transaction.name: '');

    const [type, setType] = useState( TransactionType.OUTCOME );

    const [strAmount, setStrAmount] = useState( transaction ? `${transaction.amount}` : '');

    const [date, setDate] = useState( transaction ? ( typeof transaction.date === 'string' ? new Date(transaction.date) : transaction.date ) : new Date());

    const [envelopItems, setEnvelopItems] = useState<any[]>([]);

    const [accountItems, setAccountItems] = useState<any[]>([]);

    const [destinationAccount, setDestinationAccount] = useState<Account|null>(null);

    const [envelope, setEnvelope] = useState<Envelope|null>();

    const [account, setAccount] = useState<Account|null>( route.params?.account || null );

    const canEditType = route.params?.transaction?.type == undefined || false;
    const candEditEnvelope = route.params?.transaction?.envelope_id == undefined || false;
    const canEditAccount = route.params?.account == undefined || false;

    const isFocused = useIsFocused();

    const amount = parseFloat(strAmount);

    const transactionDao = DAOFactory.getDAOFromType<AccountTransaction>(DaoType.ACCOUNT_TRANSACTION, DATABASE_TYPE);
    const accountDao = DAOFactory.getDAOFromType<Account>(DaoType.ACCOUNT, DATABASE_TYPE);
    const envelopeDao = DAOFactory.getDAOFromType<Envelope>(DaoType.ENVELOPE, DATABASE_TYPE);

    const setEnvelopeHandler = (value: string) => {
        envelopeDao.find(value).then(setEnvelope);
    }

    const setAccountHandler = (value:string) => {
        accountDao.find(value).then(setAccount);
    };

    const setDestinationAccountHandler = (value:string) => {
        accountDao.find(value).then(setDestinationAccount);
    }

    const outcomeHandler = () => {

        if( account != null ) {
            transaction.name = name;
            transaction.type = type;
            transaction.amount = amount;
            transaction.envelope_id = envelope?._id || '';
            transaction.account_id = account._id;
            transaction.date = date;
            transaction.reconciled = false;
            
            transactionDao.add(transaction).then(result => {
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            }).catch(console.error);
        }
    };

    const incomeHandler = () => {
        if( account != null ) {
            transaction.name = name;
            transaction.type = type;
            transaction.amount = amount;
            transaction.envelope_id = envelope?._id || '';
            transaction.account_id = account._id;
            transaction.date = date;
            transaction.reconciled = false;

            transactionDao.add(transaction).then(result => {
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            }).catch(console.error);
        }
    };

    const transferHandler = () => {

        if( account != null && account.balance - amount > 0) {

            const transferFrom = {
                name: name,
                type: TransactionType.TRANSFER,
                amount: amount,
                envelope_id: '',
                account_id: account?._id,
                date: date,
                reconciled: false
            } as AccountTransaction;

            const transferTo = {
                name: name,
                type: TransactionType.INCOME,
                amount: amount,
                envelope_id: '',
                account_id: destinationAccount?._id,
                date: date,
                reconciled: false
            } as AccountTransaction;

            transactionDao.addAll([transferFrom, transferTo]).then(result => {
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
    }, {
        label: t('common:transfer'),
        value: TransactionType.TRANSFER.toString()
    }];

    useEffect(() => {
        
        envelopeDao.load().then(envelopes => {

            if( transaction ) {
                setEnvelope( _.find(envelopes, env => env._id == transaction.envelope_id) );
            }

            return envelopes.map(envelope => {
                return {
                    label: `${envelope.name} [${envelope.funds.toFixed(2)}]`,
                    value: envelope._id
                };
            });
        }).then(setEnvelopItems);

        accountDao.load().then(accounts => {
            return accounts.map(account => {
                return {
                    label: `${account.name} [${account.balance.toFixed(2)}]`,
                    value: `${account._id}`.trim()
                };
            });
        }).then(setAccountItems);

    }, [isFocused]);

    const destinationAccountItems = _.filter(accountItems, item => item.value !== `${account?._id}`);

    return (
        <Layout style={{margin: 10}}>

            <View style={styles_form.container}>

                <View style={styles_form.row}>
                    <View style={styles_form.group}>
                        <Text style={{ fontSize: 12 }}>{t('common:transaction_name')}</Text>
                        <TextInput
                            placeholder={t('forms:enter_transaction_name')}
                            value={name}
                            onChangeText={(val) => setName(val)}
                        />
                    </View>
                </View>

                <View style={styles_form.row}>

                    { canEditType ? (
                        <View style={styles_form.group}>
                            <Text style={{ fontSize: 12 }}>{t('common:type')}</Text>
                            <Picker placeholder={t('type')} items={incomeOutcomeItems} value={type.toString()} onValueChange={(value:string) => setType(TransactionType[value]) } />
                        </View>
                    ) : (
                        <View style={styles_form.group}>
                            <Text style={{ fontSize: 12 }}>{t('common:type')}</Text>
                            <Text style={{flex: 1, textAlignVertical: 'center', paddingLeft: 10, marginBottom: 15}}>{t(`common:${type.toString().toLowerCase()}`)}</Text>
                        </View>
                    )}

                    <View style={styles_form.group}>
                        <Text style={{ fontSize: 12 }}>{t('common:amount')}</Text>
                        <TextInput
                            placeholder="0.00"
                            value={ strAmount }
                            onChangeText={(val) => setStrAmount(val)}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                { type == TransactionType.OUTCOME ? (
                <View style={styles_form.row}>
                    { candEditEnvelope ? (
                        <View style={styles_form.group}>
                            <Text style={{ fontSize: 12 }}>{t('common:envelope')}</Text>
                            <Picker placeholder={t('common:envelope')} items={envelopItems} value={ `${envelope ? envelope?._id : ''}` } onValueChange={setEnvelopeHandler} ></Picker>
                        </View>
                    ) : (
                        <View style={{flex: 1, margin: 2, flexDirection: "row"}}>
                            <Text style={{ marginTop: 12, marginBottom: 12, flex: 1 }}>{t('common:envelope')}: { envelope?.name } </Text>
                        { envelope && amount > envelope.funds ?
                            <Button text={t('buttons:fill')} onPress={fillHandler} ></Button>
                        :
                            null
                        }
                        </View>
                        
                    ) }
                </View>
                ) : ( null )}
                

                <View style={styles_form.row}>
                    <View style={styles_form.group}>
                        <Text style={{ fontSize: 12 }}>{t('common:account')}</Text>
                        { canEditAccount ? (
                            <Picker placeholder={t('common:account')} items={accountItems} value={ `${account?._id}`.trim() } onValueChange={setAccountHandler} ></Picker>
                        ) : (
                            <Text style={{margin: 10, padding: 10, borderWidth: 1, borderRadius: 5, borderColor: 'grey'}}>{ account?.name }</Text>
                        )}
                        
                    </View>

                    { type == TransactionType.TRANSFER ? (
                    <View style={styles_form.group}>
                        <Text style={{ fontSize: 12 }}>{t('common:destination')}</Text>
                        <Picker placeholder={t('common:account')}  items={destinationAccountItems} value={`${destinationAccount ? destinationAccount._id : ''}`} onValueChange={setDestinationAccountHandler} />
                    </View>
                    ) : (
                        null
                    )}

                </View>

                

                <View style={styles_form.row}>
                    <View style={styles_form.group}>
                        <SelectDateComponent label={t('common:date')} date={date} onChange={(newDate: Date) => setDate(newDate) } />
                    </View>
                </View>

                
            </View>

            <View style={{ flexDirection: 'row'}} >
                { type == TransactionType.OUTCOME ? (
                    <Button text={t('buttons:pay')} disabled={ !account || !envelope || amount > account.balance || amount > envelope.funds } onPress={outcomeHandler} style={{margin: 5, flexGrow: 1}} />
                ) : ( type == TransactionType.INCOME ? (
                    <Button text={t('buttons:add')} disabled={ !account || amount < 0 } onPress={incomeHandler} style={{margin: 5, flexGrow: 1}} />
                ) : (
                    <Button text={t('buttons:transfer')} disabled={ !account || !destinationAccount || amount < 0 || account.balance - amount <= 0 || account.envelope_balance - amount < 0} onPress={transferHandler} style={{margin: 5, flexGrow: 1}} />
                ) ) }  
            </View>
        </Layout>
    );

}