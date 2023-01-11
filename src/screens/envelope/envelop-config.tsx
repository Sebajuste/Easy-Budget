import { StackActions } from "@react-navigation/native";
import { useState } from "react";
import { View } from "react-native";
import { Button, Layout, Picker, Text, TextInput } from "react-native-rapi-ui";
import { SelectDateComponent } from "../../components/select-date";
import { EnvelopeDaoStorage } from "../../services/async_storage/budget_async_storage";
import { budgetPerMonth, Envelope, EnvelopeCategory, Period, periodFromString, periodToString } from "../../services/budget";
import uuid from 'react-native-uuid';
import _ from "lodash";
import { resolveUri } from "expo-asset/build/AssetSources";


const operation_type_picker_items = [
    { label: 'month', value : "month" },
    { label: 'trimester', value : "trimester" },
    { label: 'semester', value : 'semester' },
    { label: 'year', value : 'year' },
];




export function EnvelopForm({envelope, onChange, children} : {envelope: Envelope, onChange: (envelope: Envelope) => void, children?: any}) {

    const [amount, setAmount] = useState( `${envelope.amount}`);

    const [env, setEnv] = useState(envelope);


    const nameHandler = (name: string) => {
        env.name = name;
        setEnv({...env, name: name});
        onChange(env);
    };

    const amountHandler = (amount: string) => {
        env.amount = parseFloat(amount);
        setAmount(amount);
        setEnv({...env, amount: env.amount});
        onChange(env);
    };

    const periodHandler = (period: Period) => {
        env.period = period;
        setEnv({...env, period: env.period});
        onChange(envelope);
    };

    const dueDateHandler = (date: Date) => {
        env.dueDate = date;
        setEnv({...env, dueDate: env.dueDate});
        onChange(envelope);
    };

    // const showDueDate = env.period != Period.MONTH;

    return (
        <Layout style={{margin: 10}}>
        
            <View style={{ flex: 1 }}>

                <View style={{ flexDirection: 'row' }}>

                    <View style={{flex: 1, margin: 2}}>
                        <Text style={{ fontSize: 12 }}>Envelope name</Text>
                        <TextInput
                            placeholder="Enter the envelope name"
                            value={env.name}
                            onChangeText={nameHandler}
                        />
                    </View>

                    <View style={{flex: 1, margin: 2}}>
                        <Text style={{ fontSize: 12 }}>Budget Amount</Text>
                        <TextInput
                            placeholder="0.00"
                            value={amount}
                            onChangeText={amountHandler}
                        />
                    </View>

                </View>

                <View style={{ flexDirection: 'row' }}>

                    <View style={{flex: 1, margin: 2}}>
                        <Text style={{ fontSize: 12 }}>Budget Period</Text>
                        <Picker placeholder="Period" items={operation_type_picker_items} value={ periodToString(env.period) } onValueChange={(val: string) =>  periodHandler( periodFromString(val) )} ></Picker>
                    </View>

                    <View style={{flex: 1, margin: 10}}>
                        <Text style={{ flex: 1, alignItems: "flex-end", color: '#888'}}>{ budgetPerMonth(env.amount, env.period).toFixed(2) } </Text>
                        <Text style={{ flex: 2, fontSize: 12, color: '#888' }}>Montly</Text>
                    </View>

                </View>
                <View>

                    <View>
                        <SelectDateComponent label="Due Date" date={env.dueDate ? (typeof env.dueDate === 'string' ? new Date(env.dueDate) : env.dueDate) : new Date()} onChange={dueDateHandler} />
                    </View>

                </View>


            </View>

            {children}
            
        </Layout>
    );

}

export function EnvelopeConfigScreen({ navigation, route } : {navigation : any, route : any}) {

    const envelopeCategory : EnvelopeCategory = route.params?.envelopeCategory;

    const [envelope, setEnvelope] = useState<Envelope>( route.params?.envelope || {
        _id: uuid.v4(),
        name: '',
        amount: 0,
        funds: 0,
        period: Period.MONTH,
        dueDate: new Date(),
        category_id: envelopeCategory._id
    } as Envelope );

    const updateForm = route.params.envelope ? true : false;

    const envelopeDao = new EnvelopeDaoStorage();

    const changeHandler = (envelope: Envelope) => {
        setEnvelope(envelope);
    };

    const addHandler = () => {
        envelopeDao.add(envelope).then(v => {
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
        });
    }

    const updateHandler = () => {
        envelopeDao.load().then(envelopes => {
            const env = _.find(envelopes, item => item._id == envelope._id);
            if( env ) {
                env.name = envelope.name;
                env.amount = envelope.amount;
                env.period = envelope.period;
                env.dueDate = envelope.dueDate;
                return envelopeDao.save(envelopes).then(v => {
                    const popAction = StackActions.pop(1);
                    navigation.dispatch(popAction);
                });
            }
        });
    }

    const deleteHandler = () => {
        envelopeDao.remove(envelope).then(v => {
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
        });
    };

    const formValid = envelope.name.trim().length > 0 && envelope.amount > 0 ;

    // { updateForm ? <Button style={{margin: 5, flexGrow: 1}} text="DELETE" status="danger" onPress={deleteHandler}></Button> : <></> }
    return (
        <EnvelopForm envelope={envelope} onChange={changeHandler}>
            <View style={{ flexDirection: 'row'}} >
                <Button style={{margin: 5, flexGrow: 1}} text="SAVE" status="primary" disabled={!formValid} onPress={updateForm ? updateHandler : addHandler}></Button>
            </View>
        </EnvelopForm>
    );

}

/*
export function EnvelopeCreateScreen({ navigation, route } : {navigation : any, route : any}) {

    const envelopeCategory : EnvelopeCategory = route.params?.envelopeCategory;

    const envelope : Envelope = route.params?.envelope;

    const [name, setName] = useState( envelope ? envelope.name : '');

    const [amount, setAmount] = useState( envelope ? `${envelope.amount}` : '');

    const [period, setPeriod] = useState(  envelope ? envelope.period : Period.MONTH );

    const [dueDate, setDueDate] = useState( envelope && envelope.dueDate ? envelope.dueDate : new Date() );

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
*/
