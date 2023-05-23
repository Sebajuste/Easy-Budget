import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { StackActions, useIsFocused } from "@react-navigation/native";
import { View } from "react-native";
import { Button, Layout, Picker, Text, TextInput } from "react-native-rapi-ui";
import uuid from 'react-native-uuid';

import { SelectDateComponent } from "../../components/select-date";
import { Envelope } from "../../services/envelope";
import { BankAccount } from "../../services/account";
import { Transaction, TransactionAccount, TransactionType } from "../../services/transaction";
import { DaoType } from "../../services/dao";

import { t } from "../../services/i18n";
import { styles_form } from "../../styles";
import { DatabaseContext } from "../../services/db-context";
import { DeleteConfirmModal } from "../../components/modal";
import { Movement } from "../../services/transaction";
import { Category } from "../../services/category";
import { Revenue } from "../../services/revenue";


export function AccountTransactionScreen({navigation, route} : any) {

    const transaction : Transaction = route.params?.transaction || {name: '', amount: 0, envelope_id: '', date: new Date()};

    const [capitalAccount, setCapitalAccount] = useState<TransactionAccount|null>();

    const [name, setName] = useState( transaction ? transaction.name: '');

    const [type, setType] = useState( TransactionType.OUTCOME );

    const [strAmount, setStrAmount] = useState('');

    const [date, setDate] = useState( transaction ? ( typeof transaction.date === 'string' ? new Date(transaction.date) : transaction.date ) : new Date());

    const [envelopItems, setEnvelopItems] = useState<any[]>([]);
    const [revenueItems, setRevenueItems] = useState<any[]>([]);
    const [accountItems, setAccountItems] = useState<any[]>([]);

    const [destinationAccount, setDestinationAccount] = useState<BankAccount|null>(null);

    const [category, setCategory] = useState<Category|null>();

    const [envelope, setEnvelope] = useState<Envelope|null>();
    const [revenue, setRevenue] = useState<Revenue|null>()
    const [account, setAccount] = useState<BankAccount|null>( route.params?.account || null );

    const [confirmDelete, setConfirmDelete] = useState(false);

    const canEditType = route.params?.transaction?.type == undefined || false;
    const candEditEnvelope = route.params?.transaction?.envelope_id == undefined || false;
    const canEditAccount = route.params?.account == undefined || false;

    const isFocused = useIsFocused();

    const amount = parseFloat(strAmount);

    const { dbManager } = useContext(DatabaseContext);

    //const transactionDao = dbManager.getDAOFromType<AccountTransaction>(DaoType.ACCOUNT_TRANSACTION);
    const transactionDao = dbManager.getDAOFromType<Transaction>(DaoType.TRANSACTION);
    const accountTxDao = dbManager.getDAOFromType<TransactionAccount>(DaoType.TRANSACTION_ACCOUNT);
    const bankAccountDao = dbManager.getDAOFromType<BankAccount>(DaoType.BANK_ACCOUNT);
    const envelopeDao = dbManager.getDAOFromType<Envelope>(DaoType.ENVELOPE);
    const revenueDao = dbManager.getDAOFromType<Revenue>(DaoType.REVENUE);
    const categoryDao = dbManager.getDAOFromType<Category>(DaoType.CATEGORY);

    const setEnvelopeHandler = (value: string) => {
        envelopeDao.find(value).then(envelope => {
            setEnvelope(envelope);
            console.log('envelope : ', envelope)
            categoryDao.find({ _id: envelope?.category_id }).then(setCategory).catch(console.error);
        });
    }

    const setRevenueHandler = (value:string) => {
        revenueDao.find({_id: value}).then(setRevenue).catch(console.error);
    };

    const setAccountHandler = (value:string) => {
        bankAccountDao.find(value).then(setAccount);
    };

    const setDestinationAccountHandler = (value:string) => {
        bankAccountDao.find(value).then(setDestinationAccount);
    }

    const outcomeHandler = () => {

        if( account != null ) {
            /*
            transaction.name = name;
            transaction.type = type;
            transaction.amount = amount;
            transaction.category_id = envelope?.category_id || '';
            transaction.envelope_id = envelope?._id || '';
            transaction.account_id = account._id;
            transaction.date = date;
            transaction.reconciled = false;
            */

            const category_debit = {
                account_id: category?.account_id,
                debit: amount,
                credit: 0
            };

            const capital_debit = {
                account_id: capitalAccount?._id,
                debit: amount,
                credit: 0
            };

            const envelope_credit = {
                account_id: envelope?.account_id,
                debit: 0,
                credit: amount
            } as Movement;

            const bank_credit = {
                account_id: account._id,
                debit: 0,
                credit: amount
            } as Movement;

            const trx = {
                _id: uuid.v4(),
                name: name,
                date: date,
                movements: [category_debit, capital_debit, envelope_credit, bank_credit]
            } as Transaction;
            
            transactionDao.add(trx).then(result => {
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            }).catch(console.error);
        }
    };

    const incomeHandler = () => {
        if( account != null ) {
            /*
            transaction.name = name;
            transaction.type = type;
            transaction.amount = amount;
            transaction.category_id = envelope?.category_id || '';
            transaction.envelope_id = envelope?._id || '';
            transaction.account_id = account._id;
            transaction.date = date;
            transaction.reconciled = false;
            

            transactionDao.add(transaction).then(result => {
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            }).catch(console.error);
            */

            const bank_debit = {
                account_id: account._id,
                debit: amount,
                credit: 0
            } as Movement;

            const revenue_credit = {
                account_id: revenue?.account_id,
                debit: 0,
                credit: amount
            } as Movement;

            const trx = {
                _id: uuid.v4(),
                name: name,
                date: date,
                movements: [bank_debit, revenue_credit]
            } as Transaction;

            transactionDao.add(trx).then(result => {
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            }).catch(console.error);
        }
    };

    const transferHandler = () => {

        if( account != null && account.balance - amount > 0) {

            /*
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

            console.log('add transfer from', transferFrom, ' to ', transferTo);

            transactionDao.addAll([transferFrom, transferTo])//
            .then(result => {
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            }).catch(err => {
                console.error('Cannot create transaction')
                console.error(err);
            });
            */

            const bank_credit = {
                account_id: destinationAccount?._id,
                credit: amount,
                debit: 0
            };

            const bank_debit = {
                account_id: account?._id,
                credit: 0,
                debit: amount
            } as Movement;

            const trx = {
                _id: uuid.v4(),
                name: name,
                date: date,
                movements: [bank_credit, bank_debit]
            } as Transaction;
            
            transactionDao.add(trx).then(result => {
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            }).catch(console.error);

        }
    };

    const fillHandler = () => {

        navigation.navigate({name: 'FillEnvelope', params: {envelope: envelope}});

    };

    const updateHandler = () => {

    };

    const deleteHandler = () => {

        transactionDao.remove(transaction).then(result => {
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
        }).catch(err => {
            console.error('Cannot create transaction')
            console.error(err);
        });

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
        
        accountTxDao.find({name: 'Capital', type: 'Capital'}).then(setCapitalAccount);

        revenueDao.load().then(revenues => {
            return revenues.map(revenue => {
                return {
                    label: `${revenue.name}`,
                    value: `${revenue._id}`.trim()
                }
            });
        }).then(setRevenueItems);

        envelopeDao.load().then(envelopes => {

            /*
            if( transaction ) {
                setEnvelope( _.find(envelopes, env => env._id == transaction.envelope_id) );
            }
            */

            return envelopes.map(envelope => {
                return {
                    label: `${envelope.category} - ${envelope.name} [${envelope.funds.toFixed(2)}]`,
                    value: envelope._id
                };
            });
        }).then(setEnvelopItems);

        bankAccountDao.load().then(accounts => {
            return accounts.map(account => {
                return {
                    label: `${account.name} [${account.balance.toFixed(2)}]`,
                    value: `${account._id}`.trim()
                };
            });
        }).then(setAccountItems);

    }, [isFocused]);

    const destinationAccountItems = _.filter(accountItems, item => item.value !== `${account?._id}`);

    const fillButton = (
         (envelope && amount > envelope.funds) ? (
            <Button text={t('buttons:fill')} onPress={fillHandler} ></Button>
         ) : (
            null
         )
    );

    console.log('account.balance: ', account?.balance);
    console.log('envelope.funds: ', envelope?.funds);
    console.log('revenue: ', revenue)

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
                                { fillButton }
                            </View>
                        ) : (
                            <View style={{flex: 1, margin: 2, flexDirection: "row"}}>
                                <Text style={{ marginTop: 12, marginBottom: 12, flex: 1 }}>{t('common:envelope')}: { envelope?.category } - { envelope?.name } [{ envelope?.amount }] </Text>
                                { fillButton }
                            </View>
                        ) }
                    </View>
                ) : ( type == TransactionType.INCOME ? ( 
                    <View style={styles_form.row}>
                        <View style={styles_form.group}>
                            <Text style={{ fontSize: 12 }}>{t('common:revenue')}</Text>
                            <Picker placeholder={t('common:revenue')} items={revenueItems} value={ `${revenue ? revenue?._id : ''}` } onValueChange={setRevenueHandler} ></Picker>
                        </View>
                    </View>
                    ) : (
                        null
                    )
                 )}
                

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

                    (
                        route.params?.transaction == null
                    ) ? (
                        <Button text={t('buttons:pay')} disabled={ name.trim().length == 0 || !account || !envelope  || amount == 0.0 || amount > account.balance || amount > envelope.funds } onPress={outcomeHandler} style={{margin: 5, flexGrow: 1}} />
                    ) : (
                        <>
                            <Button text={t('buttons:edit')} disabled={ !account || !envelope || amount > account.balance || amount > envelope.funds } onPress={updateHandler} style={{margin: 5, flexGrow: 1}} />
                            <Button style={{margin: 5, flexGrow: 1}} text={ t('common:delete') } status="danger" onPress={() => setConfirmDelete(true)}></Button>
                        </>
                    )

                ) : ( type == TransactionType.INCOME ? (
                    <Button text={t('buttons:add')} disabled={ !account || !revenue || amount < 0 } onPress={incomeHandler} style={{margin: 5, flexGrow: 1}} />
                ) : (
                    <Button text={t('buttons:transfer')} disabled={ !account || !destinationAccount || amount < 0 || account.balance - amount <= 0 || account.envelope_balance - amount < 0} onPress={transferHandler} style={{margin: 5, flexGrow: 1}} />
                ) ) }  
            </View>

            <DeleteConfirmModal options={{title: t('title:confirm_delete')}} visible={confirmDelete} onCancel={() => setConfirmDelete(false)} onConfirm={() => deleteHandler()} />

        </Layout>
    );

}