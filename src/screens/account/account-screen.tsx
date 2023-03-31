import { useState } from "react";
import { View } from "react-native";
import { Button, Layout, Text, TextInput } from "react-native-rapi-ui";
import { Account, AccountDao } from "../../services/account";
import uuid from 'react-native-uuid';
import { StackActions } from "@react-navigation/native";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import { DaoType } from "../../services/dao";
import { t } from "../../services/i18n";
import ErrorMessage from "../../components/error-message";
import { styles_form } from "../../styles";
import { DeleteConfirmModal } from "../../components/modal";

export function AccountScreen({navigation, route} : any) {

    const account : Account = route.params?.account;

    const [error, setError] = useState<string|null>(null);

    const [name, setName] = useState( account ? account.name: '');

    const [balance, setBalance] = useState( account ? `${account.balance}` : '0');

    const [confirm, setConfirm] = useState(false);

    const accountDao = DAOFactory.getDAOFromType<Account>(DaoType.ACCOUNT, DATABASE_TYPE);

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
                } as Account;
                accountDao.add(account).then(v => {
                    const popAction = StackActions.pop(1);
                    navigation.dispatch(popAction);
                }).catch(err => {
                    console.error(err);
                    setError(err.message);
                });
            }

            
        }

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
                    null
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