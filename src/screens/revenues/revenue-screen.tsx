import { StackActions } from "@react-navigation/native";
import { useState } from "react"
import { View } from "react-native"
import { Button, Layout, Text, TextInput } from "react-native-rapi-ui";
import ErrorMessage from "../../components/error-message";
import { SelectDateComponent } from "../../components/select-date";
import { DaoType } from "../../services/dao";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";

import { t } from "../../services/i18n";
import { Revenue, RevenueDao } from "../../services/revenue";



export default function RevenueScreen({navigation, route} : any) {

    const revenue : Revenue = route.params?.revenue;

    const [error, setError] = useState(null);

    const [name, setName] = useState( revenue?.name || '' );

    const [amount, setAmount] = useState( revenue?.amount.toString() || '' );

    const [expectDate, setExpectDate] = useState( revenue?.expecteDate || new Date() );

    const revenueDao = DAOFactory.getDAOFromType<Revenue>(DaoType.REVENUE, DATABASE_TYPE);

    const saveHandler = () => {
        
        setError(null);
        if( revenue) {
            revenue.name = name;
            revenue.amount = parseFloat(amount.trim());
            revenue.expecteDate = expectDate;
            revenueDao.update(revenue).then(() => {
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            }).catch(console.error);
        } else {
            revenueDao.add({_id: 0, name: name, amount: parseFloat(amount.trim()), expecteDate: expectDate}).then((id) => {
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            }).catch(console.error);
        }

    };

    const deleteHandler = () => {
        setError(null);
        revenueDao.remove(revenue).then(() => {
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
        }).catch(console.error);
    };

    const now = new Date();

    const formValid = name.trim().length > 0 && amount.trim().length > 0;

    return (
        <Layout style={{margin: 10}}>

            <ErrorMessage error={error} />            

            <View style={{margin: 2}}>
                <Text style={{ fontSize: 12 }}>{t('forms:revenues_name')}</Text>
                <TextInput
                    placeholder={t('forms:revenues_enter_name')}
                    value={name}
                    onChangeText={setName}
                />
            </View>
            <View style={{margin: 2}}>
                <Text style={{ fontSize: 12 }}>{t('common:amount')}</Text>
                <TextInput
                    placeholder={t('forms:revenues_enter_amount')}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                />
            </View>

            <SelectDateComponent label={t('forms:revenues_due_date')} date={expectDate} minimumDate={now} onChange={(newDate: Date) => setExpectDate(newDate) } />

            <View style={{ flexDirection: 'row'}} >
                { revenue ? <Button style={{margin: 5, flexGrow: 1}} text={t('common:delete')} status="danger" onPress={deleteHandler}></Button> : <></> }
                <Button style={{margin: 5, flexGrow: 1}} text={t('common:save')} status="primary" disabled={!formValid} onPress={saveHandler}></Button>
            </View>
            
        </Layout>
    )
}