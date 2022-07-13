import { NavigationContainer, StackActions } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Layout, Text, TextInput, ThemeProvider } from "react-native-rapi-ui";
import { Button, View } from 'react-native';


import HomeScreen from "./screens/home";
import BudgetScreen from "./screens/budget/budget";
import CagnotteScreen from "./screens/cagnotte";
import ExpenseAvailableScreen from "./screens/expense_available";
import { useState } from "react";
import { Budget, BudgetOperation, useBudget } from "./services/budget";
import CreateBudgetScreen from "./screens/budget/create";
import EditBudgetScreen from "./screens/budget/edit";






const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();




function BudgetStackScreen() {

    return (
        <Stack.Navigator>
            <Stack.Screen name="Main" component={BudgetScreen} options={{title: ''}}/>
            <Stack.Screen name="AddBudget" component={ CreateBudgetScreen } options={{title: 'Add'}}/>
            <Stack.Screen name="EditBudget" component={ EditBudgetScreen } options={{title: 'Edit'}}/>
        </Stack.Navigator>
    );

}

export default function Router() {

    const nav = (navigation: any) => {
        console.log('navigate');
        navigation.navigate('AddBudget');
    };


    return (
        <ThemeProvider theme="light">
            <NavigationContainer>
                <Tab.Navigator>
                    <Tab.Screen name="Home" component={HomeScreen} />
                    <Tab.Screen name="Budget" component={BudgetStackScreen} options={ ({navigation}) => { return {headerRight: () => (<Button title="+" onPress={() => nav(navigation)}></Button>)} } } />
                    <Tab.Screen name="Cagnottes" component={CagnotteScreen} />
                    <Tab.Screen name="Dépenses possibles" component={ExpenseAvailableScreen} />
                </Tab.Navigator>
            </NavigationContainer>
        </ThemeProvider>
    );

}