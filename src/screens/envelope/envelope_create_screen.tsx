import { StackActions } from "@react-navigation/native";
import { useState } from "react";
import { View } from "react-native";
import { Button, Layout, Picker, Text, TextInput } from "react-native-rapi-ui";
import { SelectDateComponent } from "../../components/select-date";
import { EnvelopeDaoStorage } from "../../services/async_storage/budget_async_storage";
import { budgetPerMonth, Envelope, EnvelopeCategory, Period, periodFromString, periodToString } from "../../services/budget";
import uuid from 'react-native-uuid';


const operation_type_picker_items = [
    { label: 'month', value : "month" },
    { label: 'trimester', value : "trimester" },
    { label: 'semester', value : 'semester' },
    { label: 'year', value : 'year' },
];


export default function EnvelopeCreateScreen({ navigation, route } : {navigation : any, route : any}) {

    const envelopeCategory : EnvelopeCategory = route.params?.envelopeCategory;

    const envelope : Envelope = route.params?.envelope;

    const [name, setName] = useState( envelope ? envelope.name : '');

    const [amount, setAmount] = useState( envelope ? $`${envelope.amount}` : '');

    const [period, setPeriod] = useState(  envelope ? envelope.period : Period.MONTH );

    const [dueDate, setDueDate] = useState( envelope ? envelope.date : new Date() );

    const showDueDate = period != Period.MONTH;

    const formValid = name.trim().length > 0 && amount.trim().length > 0 && parseFloat(amount) != 0;

    const saveHandler = () => {

        const envelopeDao = new EnvelopeDaoStorage();

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

        /*
        const budgetDao = new BudgetDaoStorage();

        const envelope : Envelope = {
            _id: uuid.v4(),
            name: name,
            amount: parseFloat(amount),
            funds: 0,
            period: period,
            dueDate: dueDate
        } as Envelope;

        budgetDao.get().then(budget => {

            const cat = budget?.categories.filter(cat => cat._id == envelopeCategory._id && cat.name == envelopeCategory.name)[0];
            if( cat ) {
                if( ! cat.envelopes ) {
                    cat.envelopes = [];
                }
                cat.envelopes.push(envelope);
                budgetDao.save(budget).then(v => {
                    const popAction = StackActions.pop(1);
                    navigation.dispatch(popAction);
                }).catch(err => {
                    console.error(err);
                })
            }
        }).catch(err => {
            console.error(err);
        }):
        */

    };

    const deleteHandler = () => {

    };

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
                        { showDueDate ? (<SelectDateComponent label="Due Date" date={dueDate} onChange={(newDate: Date) => setDueDate(newDate) } />) : (<></>) }
                    </View>

                </View>


            </View>

            <View style={{ flexDirection: 'row'}} >
                { envelope ? <Button style={{margin: 5, flexGrow: 1}} text="DELETE" status="danger" onPress={() => deleteHandler()}></Button> : <></> }
                <Button style={{margin: 5, flexGrow: 1}} text="SAVE" status="primary" disabled={!formValid} onPress={() => saveHandler()}></Button>
            </View>
            
        </Layout>
    );

}
