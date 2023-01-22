import { NavigationContainer, StackActions } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Layout, Text, TextInput, ThemeProvider } from "react-native-rapi-ui";
import { Button, TouchableWithoutFeedback, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import HomeScreen from "./screens/home";

import EnvelopesScreen from "./screens/envelope/envelopes-screen";
import { AccountsScreen } from "./screens/account/accounts-screen";

import CategoryScreen from "./screens/envelope/category-screen";

import { AccountTransactionListScreen } from "./screens/transactions/transaction-list-screen";
import { AccountTransactionScreen } from "./screens/transactions/transaction-screen";
import { AccountScreen } from "./screens/account/account-screen";
import { EnvelopFillScreen } from "./screens/envelope/envelope-fill";
import { EnvelopeConfigScreen } from "./screens/envelope";
import { TutoAccountScreen, TutoEnvelopeScreen, TutoFinalScreen, TutoFirstFillEnvelopeScreen, TutoInfoEnvelopeScreen, TutoInfoFillEnvelopeScreen, TutoRevenueScreen, TutoScreen } from "./screens/tuto/tuto-screen";
import RevenueScreen from "./screens/revenues/revenue-screen";
import RevenueListScreen from "./screens/revenues/revenue-list-screen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();



const navTo = (navigation: any, pageName : string) => {
    navigation.navigate(pageName);
};


function BudgetStackScreen() {

    const screenOptionsHandler = ({route} : any) => {(
        {
            tabBarIcon: ({ focused, color, size } : any) => {
                let iconName;
    
                if (route.name === 'Home') {
                iconName = focused
                    ? 'ios-information-circle'
                    : 'ios-information-circle-outline';
                } else if (route.name === 'Settings') {
                iconName = focused ? 'ios-list-box' : 'ios-list';
                }
    
                // You can return any component that you like here!
                return <Text>Test</Text>;
            },
            tabBarActiveTintColor: 'tomato',
            tabBarInactiveTintColor: 'gray',
        }
    )};

    const homeIconHandler = ({ tintColor } : any) => (
        <Icon name="home" size={25} color={tintColor} style={{color: tintColor}} />
    );

    const revenueIconHandler = ({tintColor} : any) => (
        <Icon name="euro" size={25} color={tintColor} style={{color: tintColor}} />
    );

    const envelopeIconHandler = ({ tintColor } : any) => (
        <Icon name="envelope-o" size={25} color={tintColor} style={{color: tintColor}} />
    );

    const accountIconHandler = ({ tintColor } : any) => (
        <Icon name="bank" size={25} color={tintColor} style={{color: tintColor}} />
    );

    /*
           

        
    */

    return (
        <Tab.Navigator >
            <Tab.Screen name="Home" component={HomeScreen} options={ ({navigation}) => ({tabBarIcon: homeIconHandler}) } />
            <Tab.Screen name="Revenues" component={RevenueListScreen} options={ ({navigation}) => ({tabBarIcon: revenueIconHandler}) } />
            <Tab.Screen name="Envelopes" component={EnvelopesScreen} options={ ({navigation}) => ( {headerRight: () => (<Button title="+" onPress={() => navTo(navigation, 'CreateCategory')}></Button>), tabBarIcon: envelopeIconHandler} ) } />
            <Tab.Screen name="Accounts" component={AccountsScreen} options={ ({navigation}) => ( {headerRight: () => (<Button title="+" onPress={() => navTo(navigation, 'CreateAccount')}></Button>), tabBarIcon: accountIconHandler } ) } />
        </Tab.Navigator>
    );

}


/*

    <Stack.Screen name="CreateCategory" component={ CategoryScreen } options={{title: 'Add'}}/>
            <Stack.Screen name="EditCategory" component={ CategoryScreen } options={{title: 'Edit'}}/>

            <Stack.Screen name="ConfigEnvelope" component={ EnvelopeConfigScreen } options={{title: 'Envelope'}}/>
            <Stack.Screen name="CreateEnvelope" component={ EnvelopeConfigScreen } options={{title: 'New Envelope'}}/>
            <Stack.Screen name="FillEnvelope" component={ EnvelopFillScreen } options={{title: 'Fill Envelope'}} />
            
            <Stack.Screen name="AccountTransaction" component={ AccountTransactionListScreen } options={{title: 'Transactions' }} />
            <Stack.Screen name="Transaction" component={ AccountTransactionScreen } options={{title: 'Transaction'}}/>

            <Stack.Screen name="CreateAccount" component={ AccountScreen } options={{title: 'Create Account'}}/>

            <Stack.Screen name="TutoScreen" component={ TutoScreen } options={{title: 'Create Account'}} />
            <Stack.Screen name="TutoAccountScreen" component={ TutoAccountScreen } options={({navigation}) => ({title: 'Create Account', headerRight: () => (<Button title="+" onPress={() => navigation.navigate({name: 'CreateAccount'})}></Button>) })}/>
            <Stack.Screen name="TutoRevenueScreen" component={ TutoRevenueScreen } options={{title: 'Revenue'}} />
            <Stack.Screen name="TutoInfoEnvelopeScreen" component={TutoInfoEnvelopeScreen} options={{title: 'Create Envelopes'}} />
            <Stack.Screen name="TutoEnvelopeScreen" component={TutoEnvelopeScreen} options={ ({navigation}) => ({title: 'Create Envelopes', headerRight: () => (<Button title="+" onPress={() => navTo(navigation, 'CreateCategory')}></Button>)} ) } />
            <Stack.Screen name="TutoInfoFillEnvelopeScreen" component={TutoInfoFillEnvelopeScreen} options={{title: 'Fill Envelopes'}} />
            <Stack.Screen name="TutoFirstFillEnvelopeScreen" component={TutoFirstFillEnvelopeScreen} options={{title: 'Fill Envelopes'}} />
            <Stack.Screen name="TutoFinalScreen" component={TutoFinalScreen} options={{title: 'Ready'}} />

*/


function MainStackScreen({navigation} : any) {

    return (
        <Stack.Navigator>
            <Stack.Screen name="Main" component={BudgetStackScreen} options={{title: '', headerShown: false}}/>
            
            <Stack.Screen name="CreateRevenue" component={ RevenueScreen } options={{title: 'Add'}}/>
            <Stack.Screen name="EditRevenue" component={ RevenueScreen } options={{title: 'Edit'}}/>


            <Stack.Screen name="CreateCategory" component={ CategoryScreen } options={{title: 'Add'}}/>
            <Stack.Screen name="EditCategory" component={ CategoryScreen } options={{title: 'Edit'}}/>

            <Stack.Screen name="ConfigEnvelope" component={ EnvelopeConfigScreen } options={{title: 'Envelope'}}/>
            <Stack.Screen name="CreateEnvelope" component={ EnvelopeConfigScreen } options={{title: 'New Envelope'}}/>
            <Stack.Screen name="FillEnvelope" component={ EnvelopFillScreen } options={{title: 'Fill Envelope'}} />
            
            <Stack.Screen name="AccountTransaction" component={ AccountTransactionListScreen } options={{title: 'Transactions' }} />
            <Stack.Screen name="Transaction" component={ AccountTransactionScreen } options={{title: 'Transaction'}}/>

            <Stack.Screen name="CreateAccount" component={ AccountScreen } options={{title: 'Create Account'}}/>

            <Stack.Screen name="TutoScreen" component={ TutoScreen } options={{title: 'Create Account'}} />
            <Stack.Screen name="TutoAccountScreen" component={ TutoAccountScreen } options={({navigation}) => ({title: 'Create Account', headerRight: () => (<Button title="+" onPress={() => navigation.navigate({name: 'CreateAccount'})}></Button>) })}/>
            <Stack.Screen name="TutoRevenueScreen" component={ TutoRevenueScreen } options={{title: 'Revenue'}} />
            <Stack.Screen name="TutoInfoEnvelopeScreen" component={TutoInfoEnvelopeScreen} options={{title: 'Create Envelopes'}} />
            <Stack.Screen name="TutoEnvelopeScreen" component={TutoEnvelopeScreen} options={ ({navigation}) => ({title: 'Create Envelopes', headerRight: () => (<Button title="+" onPress={() => navTo(navigation, 'CreateCategory')}></Button>)} ) } />
            <Stack.Screen name="TutoInfoFillEnvelopeScreen" component={TutoInfoFillEnvelopeScreen} options={{title: 'Fill Envelopes'}} />
            <Stack.Screen name="TutoFirstFillEnvelopeScreen" component={TutoFirstFillEnvelopeScreen} options={{title: 'Fill Envelopes'}} />
            <Stack.Screen name="TutoFinalScreen" component={TutoFinalScreen} options={{title: 'Ready'}} />

            
        </Stack.Navigator>
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