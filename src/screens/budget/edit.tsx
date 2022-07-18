import { StackActions } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Layout, Picker, Text, TextInput } from "react-native-rapi-ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { Budget, BudgetCategory, BudgetOperation, BudgetOperationType, budgetOperationTypeFromString, budgetOperationTypeToString, loadBudget, saveBudget, saveBudgetCategory, useBudget } from "../../services/budget";
import { scroll_styles } from "../../styles";






const operation_type_picker_items = [
    { label: 'month', value : "month" },
    { label: 'trimester', value : "trimester" },
    { label: 'semester', value : 'semester' },
    { label: 'year', value : 'year' },
];


export default function EditBudgetScreen({ navigation, route } : {navigation : any, route : any}) {

 
    const [budgetCategory, setBudgetCategory] = useState( Object.assign({}, route.params?.budgetCategory) );


    const [date, setDate] = useState(new Date());

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
                    console.log('CATEGORY FOUND')
                    break;
                }

            }

            console.log('use effect done ', budgetCategory, budget.categories[i])
            saveBudget(budget);
        }
    });


    const renameBudget = (name: string) => {
        setBudgetCategory((oldBudgetCategory : BudgetCategory) => {
            oldBudgetCategory.name = name;
            // return oldBudgetCategory;
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
            // return oldBudgetCategory;
            return Object.assign({}, oldBudgetCategory);
        });

    };

    const addBudgetOperation = () => {
        setBudgetCategory((oldBudgetCategory : BudgetCategory) => {
            const budgetCategory = {} as BudgetCategory;
            // oldBudgetCategory.operations.push(budgetCategory);
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

        const new_budget_list = budgetCategory.categories.filter((item: BudgetCategory) => item.name != budgetCategory.name );

        // setBudget(new_budget_list);

        const popAction = StackActions.pop(1);
        navigation.dispatch(popAction);
    };

    const operation_items = budgetCategory.operations.map((operation : BudgetOperation, index : number) => {

        const showDueDate = operation?.type != BudgetOperationType.MONTH;

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

                    

                 </View>

                <Button style={{margin: 0, flexGrow: 1}} text="D" status="danger" onPress={() => deleteOperation(index)}></Button>
                
            </View>
        );
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