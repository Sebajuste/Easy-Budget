import { useContext, useState } from "react";
import { View } from "react-native";
import { Button, Layout, Text, TextInput } from "react-native-rapi-ui";
import { BankAccount } from "../../services/account";
import uuid from 'react-native-uuid';
import { StackActions } from "@react-navigation/native";
import { DaoType } from "../../services/dao";
import { t } from "../../services/i18n";
import ErrorMessage from "../../components/error-message";
import { styles_form } from "../../styles";
import { DeleteConfirmModal } from "../../components/modal";
import { DatabaseContext } from "../../services/db-context";
import { AccountTransaction, TransactionType } from "../../services/transaction";

export function AccountConfigScreen({navigation, route} : any) {

    const account : BankAccount = route.params?.account;

    const [error, setError] = useState<string|null>(null);

    const [name, setName] = useState( account ? account.name: '');

    const [balance, setBalance] = useState( account ? `${account.balance}` : '0');

    const [reconciled, setReconciled] = useState( (account ? `${account.total_reconciled.toFixed(2)}` : '0' ) );

    const [confirm, setConfirm] = useState(false);

    const { dbManager } = useContext(DatabaseContext);

    const accountDao = dbManager.getDAOFromType<BankAccount>(DaoType.BANK_ACCOUNT);
    // const accountTransactionDao = dbManager.getDAOFromType<AccountTransaction>(DaoType.ACCOUNT_TRANSACTION);

    const openDeleteHandler = () => {
        setConfirm(true);
    };

    const saveHandler = () => {
        const balanceFloat = parseFloat(balance);
        
        if(accountDao != null) {

            if( route.params?.account ) {
                account.name = name;
                accountDao.update(account).then(v => {
                    const popAction = StackActions.pop(2);
                    navigation.dispatch(popAction);
                }).catch(err => {
                    console.error(err);
                    setError(err.message);
                });
                
            } else {
                const account = {
                    _id: uuid.v4(),
                    name: name,
                    balance: balanceFloat,
                    envelope_balance: balanceFloat,
                } as BankAccount;
                accountDao.add(account).then(v => {
                    const popAction = StackActions.pop(1);
                    navigation.dispatch(popAction);
                }).catch(err => {
                    console.error(err);
                    setError(err.message);
                });
            }

            
        } else {
            console.error('Invalid DAO');
        }

    };

    const correctHandler = () => {

        /*
        const correction = parseFloat(reconciled) - (account.total_reconciled || 0);

        const transaction = {
            name: 'Correction',
            type: TransactionType.INCOME,
            amount: Math.trunc(correction * 100) / 100,
            date: new Date(),
            account_id: account._id,
            category_id: '',
            envelope_id: '',
            reconciled: true

        } as AccountTransaction;

        accountTransactionDao.add(transaction)//
        .then(r => console.log('result: ', r))//
        .catch(console.error);
        */

    };

    const deleteHandler = () => {
        accountDao.remove(account).then(v => {
            const popAction = StackActions.pop(2);
            navigation.dispatch(popAction);
        }).catch(err => {
            console.error(err);
            setError(err.message);
        });
    };

    const formValid = name.trim().length > 0 && balance.trim().length > 0;

    const disableCorrection = !account || Math.abs( parseFloat(reconciled) - (account.total_reconciled || 0)) < 0.01;

    return (
        <Layout style={{margin: 10}}>

            <ErrorMessage error={error} />

            <DeleteConfirmModal options={{title: t('title:confirm_delete')}} visible={confirm} onCancel={() => setConfirm(false)} onConfirm={() => deleteHandler()} />

            <View style={styles_form.container}>
                <View style={styles_form.row}>
                    <View style={styles_form.group}>
                        <Text style={{ fontSize: 12 }}>{ t('forms:account_name') }</Text>
                        <TextInput
                            placeholder={ t('forms:enter_account_name') }
                            value={name}
                            onChangeText={setName}
                        />
                    </View>
                </View>

                { route.params?.account ? (
                    <>
                    <View style={styles_form.row}>

                        <View style={styles_form.group}>
                            <Text>Correction</Text>
                        </View>

                        <View style={styles_form.group}>
                            <Text style={{ fontSize: 12 }}>{ t('common:amount') }</Text>
                            <TextInput
                                placeholder="0.00"
                                value={reconciled}
                                onChangeText={setReconciled}
                                keyboardType="numeric"
                            />
                        </View>

                    </View>
                    <View style={styles_form.row}>
                        <View style={styles_form.group}>
                            <Button text="Correct" disabled={disableCorrection} onPress={correctHandler}></Button>
                        </View>
                    </View>
                    </>
                ) : (
                    <View style={styles_form.row}>
                        <View style={styles_form.group}>
                            <Text style={{ fontSize: 12 }}>{ t('common:amount') }</Text>
                            <TextInput
                                placeholder="0.00"
                                value={balance}
                                onChangeText={setBalance}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                )}
                
            </View>

            <View style={{ flexDirection: 'row'}} >
                { account ? <Button style={{margin: 5, flexGrow: 1}} text={ t('common:delete') } status="danger" onPress={openDeleteHandler}></Button> : <></> }
                <Button style={{margin: 5, flexGrow: 1}} text={ t('common:save') } status="primary" disabled={!formValid} onPress={saveHandler}></Button>
            </View>

        </Layout>
    );

}