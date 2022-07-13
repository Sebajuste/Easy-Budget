import { StackActions } from "@react-navigation/native";
import { useState } from "react";
import { Button, Layout, Text, TextInput } from "react-native-rapi-ui";

export default function CreateBudgetScreen({navigation, onAddBudget} : {navigation : any, onAddBudget: any}) {

    const [name, setName] = useState('');

    const addAction = () => {

        const budget = {
            name: name,
            operations: [],
            reserve: 0
        };

        if( onAddBudget ) {
            onAddBudget(budget);
        }

        const popAction = StackActions.pop(1);
        navigation.dispatch(popAction);
    };

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