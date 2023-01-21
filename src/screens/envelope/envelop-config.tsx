import { StackActions } from "@react-navigation/native";
import { useState } from "react";
import { View } from "react-native";
import { Button, Layout, Picker, Text, TextInput } from "react-native-rapi-ui";
import { SelectDateComponent } from "../../components/select-date";
import { budgetPerMonth, Envelope, EnvelopeCategory, EnvelopeDao, Period, periodFromString, periodToString } from "../../services/envelope";
import uuid from 'react-native-uuid';
import _ from "lodash";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";


const operation_type_picker_items = [
    { label: 'month', value : "month" },
    { label: 'trimester', value : "trimester" },
    { label: 'semester', value : 'semester' },
    { label: 'year', value : 'year' },
];



export function EnvelopeConfigScreen({ navigation, route } : {navigation : any, route : any}) {

    const envelopeCategory : EnvelopeCategory = route.params?.envelopeCategory;

    const envelope : Envelope = route.params?.envelope || {
        _id: uuid.v4(),
        name: '',
        amount: 0,
        funds: 0,
        period: Period.MONTH,
        dueDate: new Date(),
        category_id: envelopeCategory._id
    } as Envelope;

    const updateForm = route.params.envelope ? true : false;

    const [name, setName] = useState( envelope ? envelope.name : '');

    const [amount, setAmount] = useState( envelope ? `${envelope.amount}` : '');

    const [period, setPeriod] = useState(  envelope ? envelope.period : Period.MONTH );

    const [dueDate, setDueDate] = useState( envelope && envelope.dueDate ? (typeof envelope.dueDate === 'string' ? new Date(envelope.dueDate) : envelope.dueDate) : new Date() );

    const showDueDate = period != Period.MONTH;

    const envelopeDao = DAOFactory.getDAO<Envelope>(EnvelopeDao, DATABASE_TYPE); // getDao<EnvelopeDao>(EnvelopeDao, Database.ASYNC_STORAGE);

    const addHandler = () => {

        const envelope : Envelope = {
            _id: uuid.v4(),
            name: name,
            amount: parseFloat(amount),
            funds: 0,
            period: period,
            dueDate: dueDate,
            category_id: envelopeCategory._id
        } as Envelope;

        envelopeDao.add(envelope).then(v => {
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
        });

    };

    const updateHandler = () => {

        const envelopeUpdate = {
            _id: envelope._id,
            name : name,
            amount : parseFloat(amount),
            period :  period,
            dueDate : dueDate,
            funds : envelope.funds,
            category_id : envelope.category_id
        } as Envelope;

        envelopeDao.update(envelopeUpdate).then(v => {
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
        });

    }

    const deleteHandler = () => {
        envelopeDao?.remove(envelope).then(v => {
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
        });
    };

    const now = new Date();

    const formValid = name.trim().length > 0 && amount.trim().length > 0 && parseFloat(amount) != 0;

    return (
        <Layout style={{margin: 10}}>
        
            <View style={{ flex: 1 }}>

                <View style={{ flexDirection: 'row' }}>

                    <View style={{flex: 1, margin: 2}}>
                        <Text style={{ fontSize: 12 }}>Envelope name</Text>
                        <TextInput
                            placeholder="Enter the envelope name"
                            value={name}
                            onChangeText={(val) => setName(val)}
                        />
                    </View>

                    <View style={{flex: 1, margin: 2}}>
                        <Text style={{ fontSize: 12 }}>Budget Amount</Text>
                        <TextInput
                            placeholder="0.00"
                            value={amount}
                            onChangeText={(val) => setAmount(val)}
                        />
                    </View>

                </View>

                <View style={{ flexDirection: 'row' }}>

                    <View style={{flex: 1, margin: 2}}>
                        <Text style={{ fontSize: 12 }}>Budget Period</Text>
                        <Picker placeholder="Period" items={operation_type_picker_items} value={ periodToString(period) } onValueChange={(val: string) =>  setPeriod( periodFromString(val) )} ></Picker>
                    </View>

                    <View style={{flex: 1, margin: 10}}>
                        <Text style={{ flex: 1, alignItems: "flex-end", color: '#888'}}>{ budgetPerMonth(parseFloat(amount), period).toFixed(2) } </Text>
                        <Text style={{ flex: 2, fontSize: 12, color: '#888' }}>Montly</Text>
                    </View>

                </View>
                <View>

                    <View>
                        { showDueDate ? (<SelectDateComponent label="Due Date" date={dueDate} minimumDate={now} onChange={(newDate: Date) => setDueDate(newDate) } />) : (<></>) }
                    </View>

                </View>


            </View>

            <View style={{ flexDirection: 'row'}} >
            { updateForm ? <Button style={{margin: 5, flexGrow: 1}} text="DELETE" status="danger" onPress={deleteHandler}></Button> : <></> }
                <Button style={{margin: 5, flexGrow: 1}} text="SAVE" status="primary" disabled={!formValid} onPress={updateForm ? updateHandler : addHandler}></Button>
            </View>
            
        </Layout>
    );

}
