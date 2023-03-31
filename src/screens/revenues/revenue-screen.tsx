import { StackActions } from "@react-navigation/native";
import { useState } from "react"
import { View } from "react-native"
import { Button, Layout, Text, TextInput } from "react-native-rapi-ui";
import ErrorMessage from "../../components/error-message";
import { DeleteConfirmModal } from "../../components/modal";
import { SelectDateComponent } from "../../components/select-date";
import { DaoType } from "../../services/dao";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";

import { t } from "../../services/i18n";
import { Revenue, RevenueDao } from "../../services/revenue";
import { styles, styles_form } from "../../styles";



export default function RevenueScreen({navigation, route} : any) {

    const revenue : Revenue = route.params?.revenue;

    console.log('RevenueScreen: ', revenue)

    const [error, setError] = useState(null);

    const [name, setName] = useState( revenue?.name || '' );

    const [amount, setAmount] = useState( revenue?.amount.toString() || '' );

    console.log('revenue?.expecteDate: ', revenue?.expectDate )

    const [expectDate, setExpectDate] = useState<Date>( revenue?.expectDate ? (new Date(revenue.expectDate)) : new Date() );

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const revenueDao = DAOFactory.getDAOFromType<Revenue>(DaoType.REVENUE, DATABASE_TYPE);

    const saveHandler = () => {
        
        setError(null);
        if( revenue) {
            revenue.name = name;
            revenue.amount = parseFloat(amount.trim());
            revenue.expecteDate = expectDate.toISOString();
            revenueDao.update(revenue).then(() => {
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            }).catch(console.error);
        } else {
            revenueDao.add({_id: 0, name: name, amount: parseFloat(amount.trim()), expecteDate: expectDate.toISOString()}).then((id) => {
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

            <DeleteConfirmModal visible={deleteModalVisible} onCancel={() => setDeleteModalVisible(false)} onConfirm={deleteHandler} />

            <ErrorMessage error={error} />

            <View style={styles_form.container}>

                <View style={styles_form.row}>
                    <View style={styles_form.group}>
                        <Text style={{ fontSize: 12 }}>{t('forms:revenues_name')}</Text>
                        <TextInput
                            placeholder={t('forms:revenues_enter_name')}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>
                </View>

                <View style={styles_form.row}>
                    <View style={styles_form.group}>
                        <Text style={{ fontSize: 12 }}>{t('common:amount')}</Text>
                        <TextInput
                            placeholder={t('forms:revenues_enter_amount')}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View style={styles_form.row}>
                    <View style={styles_form.group}>
                        <SelectDateComponent label={t('forms:revenues_due_date')} date={expectDate} minimumDate={now} onChange={(newDate: Date) => setExpectDate(newDate) } />
                    </View>
                </View>

            </View>

            <View style={{ flexDirection: 'row'}} >
                { revenue ? <Button style={{margin: 5, flexGrow: 1}} text={t('common:delete')} status="danger" onPress={() => setDeleteModalVisible(true)}></Button> : <></> }
                <Button style={{margin: 5, flexGrow: 1}} text={t('common:save')} status="primary" disabled={!formValid} onPress={saveHandler}></Button>
            </View>
            
        </Layout>
    )
}