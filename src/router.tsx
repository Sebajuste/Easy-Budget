import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ThemeProvider } from "react-native-rapi-ui";


import HomeScreen from "./screens/home";
import BudgetScreen from "./screens/budget";
import CagnotteScreen from "./screens/cagnotte";
import ExpenseAvailableScreen from "./screens/expense_available";



const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

export default function Router() {

    return (
        <ThemeProvider theme="light">
        <NavigationContainer>
            <Tab.Navigator>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Budget" component={BudgetScreen} />
            <Tab.Screen name="Cagnottes" component={CagnotteScreen} />
            <Tab.Screen name="Dépenses possibles" component={ExpenseAvailableScreen} />
            </Tab.Navigator>
        </NavigationContainer>
        </ThemeProvider>
    );

}