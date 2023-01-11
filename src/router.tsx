import { NavigationContainer, StackActions } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Layout, Text, TextInput, ThemeProvider } from "react-native-rapi-ui";
import { Button, TouchableWithoutFeedback, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import HomeScreen from "./screens/home";
import EnvelopesScreen from "./screens/envelope/envelopes_screen";
import CreateCategoryScreen from "./screens/envelope/category-screen";
import { AccountsScreen } from "./screens/account/accounts-screen";
import { TransactionListScreen } from "./screens/transactions/transaction-list-screen";
import { TransactionScreen } from "./screens/transactions/transaction-screen";
import { AccountScreen } from "./screens/account/account-screen";
import { EnvelopFillScreen } from "./screens/envelope/envelope-fill";
import { EnvelopeConfigScreen } from "./screens/envelope";






const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();



const navTo = (navigation: any, pageName : string) => {
    navigation.navigate(pageName);
};


function MainStackScreen({navigation} : any) {

    

    return (
        <Stack.Navigator>
            <Stack.Screen name="Main" component={BudgetStackScreen} options={{title: '', headerShown: false}}/>

            <Stack.Screen name="CreateCategory" component={ CreateCategoryScreen } options={{title: 'Add'}}/>
            <Stack.Screen name="EditCategory" component={ CreateCategoryScreen } options={{title: 'Edit'}}/>

            <Stack.Screen name="ConfigEnvelope" component={ EnvelopeConfigScreen } options={{title: 'Envelope'}}/>
            <Stack.Screen name="CreateEnvelope" component={ EnvelopeConfigScreen } options={{title: 'New Envelope'}}/>
            <Stack.Screen name="FillEnvelope" component={ EnvelopFillScreen } options={{title: 'Fill Envelope'}} />
            
            <Stack.Screen name="AccountTransaction" component={ TransactionListScreen } options={{title: 'Transactions' }} />
            <Stack.Screen name="Transaction" component={ TransactionScreen } options={{title: 'Transaction'}}/>

            <Stack.Screen name="CreateAccount" component={ AccountScreen } options={{title: 'Create Account'}}/>
        </Stack.Navigator>
    );

}

function BudgetStackScreen() {

    return (
        <Tab.Navigator>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Envelopes" component={EnvelopesScreen} options={ ({navigation}) => { return {headerRight: () => (<Button title="+" onPress={() => navTo(navigation, 'CreateCategory')}></Button>)} } } />
            <Tab.Screen name="Accounts" component={AccountsScreen} options={ ({navigation}) => { return {headerRight: () => (<Button title="+" onPress={() => navTo(navigation, 'CreateAccount')}></Button>) }; } } />
        </Tab.Navigator>
    );

}

export default function Router() {

    return (
        <ThemeProvider theme="light">
            <NavigationContainer>
                <MainStackScreen />
            </NavigationContainer>
        </ThemeProvider>
    );

}