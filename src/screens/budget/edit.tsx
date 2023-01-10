import RNDateTimePicker from "@react-native-community/datetimepicker";
import DateTimePicker from '@react-native-community/datetimepicker';
import { StackActions } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, Layout, Picker, Text, TextInput } from "react-native-rapi-ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { Budget, BudgetCategory, BudgetOperation, BudgetOperationType, budgetOperationTypeFromString, budgetOperationTypeToString, loadBudget, saveBudget, saveBudgetCategory, useBudget } from "../../services/budget";
import { deleteCategory } from "../../services/sqlite/budget_dao_sqlite";
import { scroll_styles } from "../../styles";


const operation_type_picker_items = [
    { label: 'month', value : "month" },
    { label: 'trimester', value : "trimester" },
    { label: 'semester', value : 'semester' },
    { label: 'year', value : 'year' },
];


function ChangeDate({date, onChange} : {date : Date, onChange : any}) {

    const dateStr = date.toISOString().slice(0,10);// .replace(/-/g,"");

    const [showDatePicker, setShowDatePicker] = useState(false);

    const onDateChange = (event: any, newDate ?: Date) => {
        setShowDatePicker(false);
        if( onChange ) onChange(newDate);
    };

    return (
        <View>
            <Text>Due date : {dateStr}</Text>
            <Button text="Change" onPress={() => setShowDatePicker(true)} />
            { showDatePicker ? <DateTimePicker value={date} onChange={onDateChange} /> : <></>}
        </View>
    );

}




function EditBudgetOperationScreen({ operation, onUpdate, onDelete } : { operation : BudgetOperation, onUpdate : any, onDelete : any}) {


    const [name, setName] = useState( operation.name );

    const [value, setValue] = useState( operation.value.toString() );

    const [type, setType] = useState( operation.type );

    const [dueDate, setDueDate] = useState( operation.dueDate != undefined ? operation.dueDate : new Date() );

    const showDueDate = type != BudgetOperationType.MONTH;

    const changeName = (name : string) => {
        setName(name);
        onUpdate('name', name);
    }

    const changeValue = (value : string) => {
        setValue(value);
        onUpdate('value', parseFloat(parseFloat(value).toFixed(2)) );
    }

    const changeType = (value : BudgetOperationType) => {
        setType(value);
        onUpdate('type', value);
    };

    const changeDueDate = (value : Date) => {
        setDueDate(value);
        onUpdate('dueDate', value);
    }

    return (
        <View style={{ flex: 1, flexDirection: 'row', marginTop: 5, marginBottom: 5 }}>

            <View style={{margin: 10, flexGrow: 5, flexDirection: 'column'}}>
                <TextInput placeholder="Operation Name" value={name} onChangeText={(val) => changeName(val)} />
                
                <View style={{margin: 5, flexDirection: 'row'}}>
                    
                    <View style={{margin: 0, flexGrow: 2, flexDirection: 'row', alignItems: 'center'}}>
                        <View style={{ flexGrow: 2 }}>
                            <TextInput placeholder="Value" value={value} onChangeText={(val) => changeValue(val)} />
                        </View>
                        <Text style={{ flexGrow: 1, margin: 2 }}>€</Text>
                    </View>

                    <Picker style={{margin: 0, flexGrow: 1}} items={operation_type_picker_items} value={ budgetOperationTypeToString(type) } onValueChange={(val) => changeType( budgetOperationTypeFromString(val) )} ></Picker>
                 </View>

                { showDueDate ? (<ChangeDate date={dueDate} onChange={(newDate: Date) => changeDueDate(newDate) } />) : (<></>) }

             </View>

            <Button style={{margin: 0, flexGrow: 1}} text="D" status="danger" onPress={() => onDelete()}></Button>
            
        </View>
    );

}


export default function EditBudgetScreen({ navigation, route } : {navigation : any, route : any}) {

 
    const [budgetCategory, setBudgetCategory] = useState( Object.assign({}, route.params?.budgetCategory) );


    const [date, setDate] = useState(new Date());

    /*
    useEffect(() => {

        const unsubscribe = navigation.addListener('focus', () => {

        });

        return () => {

            unsubscribe();

            const budget : Budget = loadBudget();

            let i = 0;

            for(let index=0; index < budget.categories.length; ++index) {

                const category = budget.categories[index];
                if( category.name == route.params?.budgetCategory.name) {
                    i = index;
                    budget.categories.splice(index, 1, budgetCategory);
                    console.log('CATEGORY FOUND ', category.name)
                    break;
                }

            }

            console.log('use effect done ')
            saveBudget(budget);
        }
    });
    */


    const renameBudget = (name: string) => {
        setBudgetCategory((oldBudgetCategory : BudgetCategory) => {
            oldBudgetCategory.name = name;
            return Object.assign({}, oldBudgetCategory);
        });
    };

    const setOperationName = (index: number, name : string) => {
        setBudgetCategory((oldBudgetCategory : BudgetCategory) => {
            oldBudgetCategory.operations[index].name = name;
            return Object.assign({}, oldBudgetCategory);
        });
    }

    const setOperationValue = (index: number, value : number) => {
        setBudgetCategory((oldBudgetCategory : BudgetCategory) => {
            oldBudgetCategory.operations[index].value = value;
            return Object.assign({}, oldBudgetCategory);
        });
    };

    const setOperationType = (index : number, operationType : BudgetOperationType) => {

        setBudgetCategory((oldBudgetCategory : BudgetCategory) => {
            oldBudgetCategory.operations[index].type = operationType;
            return Object.assign({}, oldBudgetCategory);
        });

    };

    const setOperationDueDate = (index: number, date : Date) => {
        setBudgetCategory((oldBudgetCategory : BudgetCategory) => {
            oldBudgetCategory.operations[index].dueDate = date;
            return Object.assign({}, oldBudgetCategory);
        });
    };

    const addBudgetOperation = () => {
        setBudgetCategory((oldBudgetCategory : BudgetCategory) => {
            const budgetOperation = {name: '', type: BudgetOperationType.MONTH, value: 0} as BudgetOperation;
            oldBudgetCategory.operations.push(budgetOperation);
            return Object.assign({}, oldBudgetCategory);
        });
    }

    const updateBudgetOperation = (index: number, property : string, value : any) => {
        Alert.alert('test '+ property + ' ' + value )
        setBudgetCategory((oldBudgetCategory : BudgetCategory) => {
            oldBudgetCategory.operations[index][property] = value;
            return Object.assign({}, oldBudgetCategory);
        });
    }

    const deleteOperation = (index: number) => {
        setBudgetCategory((oldBudgetCategory : BudgetCategory) => {
            oldBudgetCategory.operations.splice(index, 1);
            return Object.assign({}, oldBudgetCategory);
        });
    };

    const deleteBudget = () => {


        // const new_budget_list = budgetCategory.categories.filter((item: BudgetCategory) => item.name != budgetCategory.name );

        // setBudget(new_budget_list);

        const budget : Budget = loadBudget();
        budget.categories = budget.categories.filter((item: BudgetCategory) => item.name != budgetCategory.name );
        saveBudget( budget );


        deleteCategory(budgetCategory).then(() => {

        }, err => {
            console.log('error : ', err);
        });

        const popAction = StackActions.pop(1);
        navigation.dispatch(popAction);
    };

    const operation_items = budgetCategory.operations.map((operation : BudgetOperation, index : number) => {

        return (<EditBudgetOperationScreen key={index} operation={operation} onUpdate={(property : string, value : any) => updateBudgetOperation(index, property, value)} onDelete={() => deleteOperation(index) } />);

        /*
        const showDueDate = operation?.type != BudgetOperationType.MONTH;

        const dueDate = operation.dueDate != undefined ? operation.dueDate : new Date();

        return (
            <View key={index} style={{ flex: 1, flexDirection: 'row', marginTop: 5, marginBottom: 5 }}>

                <View style={{margin: 10, flexGrow: 5, flexDirection: 'column'}}>
                    <TextInput placeholder="Operation Name" value={operation?.name} onChangeText={(val) => setOperationName(index, val)} />
                    
                    <View style={{margin: 5, flexDirection: 'row'}}>
                        
                        <View style={{margin: 0, flexGrow: 2, flexDirection: 'row', alignItems: 'center'}}>
                            <View style={{ flexGrow: 2 }}>
                                <TextInput placeholder="Value" value={operation?.value.toString()} onChangeText={(val) => setOperationValue(index, parseFloat(val))} />
                            </View>
                            <Text style={{ flexGrow: 1, margin: 2 }}>€</Text>
                        </View>

                        <Picker style={{margin: 0, flexGrow: 1}} items={operation_type_picker_items} value={ budgetOperationTypeToString(operation?.type) } onValueChange={(val) => setOperationType(index, budgetOperationTypeFromString(val) )} ></Picker>
                     </View>

                    { showDueDate ? (<ChangeDate date={dueDate} onChange={(newDate: Date) => setOperationDueDate(index, newDate) } />) : (<></>) }

                 </View>

                <Button style={{margin: 0, flexGrow: 1}} text="D" status="danger" onPress={() => deleteOperation(index)}></Button>
                
            </View>
        );

        */
    });

    return (
        <Layout>
            <TextInput placeholder="Enter your text" value={budgetCategory.name} onChangeText={renameBudget} />

            <SafeAreaView style={scroll_styles.container}>

                <ScrollView style={scroll_styles.scrollView}>

                    {operation_items}

                    <Button style={{marginTop: 10}} text="New" status="primary" onPress={addBudgetOperation} ></Button>

                    <Button style={{marginTop: 10}} text="Delete" status="danger" onPress={deleteBudget}></Button>
                </ScrollView>

            </SafeAreaView>
        </Layout>
    );

}

const edit_styles = StyleSheet.create({
    line: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    line_item: {
        margin: 0,
        flexGrow: 1
    }
});