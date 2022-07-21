import { StackActions } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Button, Layout, Text, TextInput } from "react-native-rapi-ui";
import { Budget, BudgetCategory, loadBudget, saveBudget } from "../../services/budget";

export default function CreateBudgetScreen({navigation} : {navigation : any}) {

    const [name, setName] = useState('');

    const addAction = () => {

        const budget : Budget = loadBudget();

        const budgetCategory = {name: name, operations: [], reserve: 0} as BudgetCategory;
        

        budget.categories.push(budgetCategory);
        saveBudget(budget);

        const popAction = StackActions.pop(1);
        navigation.dispatch(popAction);
    };

    /*
    useEffect(() => {

        return () => {

            const budget : Budget = loadBudget();

            const budgetCategory = {} as BudgetCategory;
            budgetCategory.name = name;

            budget.categories.push(budgetCategory);

            saveBudget(budget);

        };

    });
    */

    return (
        <Layout>

            <Text style={{ marginBottom: 10 }}>Category name</Text>
            <TextInput
                placeholder="Enter the category name"
                value={name}
                onChangeText={(val) => setName(val)}
            />

            <Button text="Add" onPress={addAction}></Button>
        </Layout>
    );

}