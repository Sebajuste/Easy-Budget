import { StackActions } from "@react-navigation/native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Layout, Picker, Text, TextInput } from "react-native-rapi-ui";
import { Budget, BudgetOperation, BudgetOperationType, budgetOperationTypeToString, useBudget } from "../../services/budget";



const edit_styles = StyleSheet.create({
    line: {
        flexDirection: 'row'
    },
    line_item: {
        margin: 20,
        flexGrow: 1
    }
});


const operation_type_picker_items = [
    { label: 'month', value : "month" },
    { label: 'trimester', value : "trimester" },
    { label: 'semester', value : 'semester' },
    { label: 'year', value : 'year' },
];


export default function EditBudgetScreen({ navigation, route } : {navigation : any, route : any}) {

    const [budget, setBudget] = useState(route.params?.budget);

    const [bugetName, setBudgetName] = useState(budget.name);

    console.log('Edit : ', budget.name);
    console.log('Operations : ', budget.operations);

    const [budget_list, setBudgetList] = useBudget();

    const renameBudget = (name: string) => {
        budget.name = name;
        setBudgetName(name);
    };

    const deleteOperation = (index: number) => {
        budget.operations.splice(index, 1);
        setBudget(budget);
    };

    const deleteBudget = () => {

        const new_budget_list = budget_list.filter((item: Budget) => item.name != budget.name );

        setBudget(new_budget_list);

        const popAction = StackActions.pop(1);
        navigation.dispatch(popAction);
    };

    const operation_items = budget.operations.map((operation : BudgetOperation, index : number) => {

        return (
            <View key={index} style={edit_styles.line}>
                <View style={{margin: 20, flexGrow: 10}}>
                    <TextInput placeholder="Operation Name" value={operation.name}   />
                </View>
                <Text style={edit_styles.line_item} >{operation.value} €</Text>
                <View style={edit_styles.line_item} >
                    <Picker items={operation_type_picker_items} value={ budgetOperationTypeToString(operation.type) } />
                    
                </View>
                <Button text="D" status="danger" onPress={() => deleteOperation(index)}></Button>
            </View>
        );
    });

    return (
        <Layout>
            <TextInput placeholder="Enter your text" value={bugetName} onChangeText={renameBudget} />

            {operation_items}

            <Button text="Delete" status="danger" onPress={deleteBudget}></Button>
        </Layout>
    );

}