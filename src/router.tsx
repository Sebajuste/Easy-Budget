import { DrawerActions, NavigationContainer } from "@react-navigation/native";
import { BottomTabNavigationOptions, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
// import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Text, ThemeProvider } from "react-native-rapi-ui";
import { Button, Image, StyleSheet, TouchableOpacity, useWindowDimensions, Pressable, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/FontAwesome';
// import { Icon } from "react-native-elements";


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
import { Colors } from "react-native/Libraries/NewAppScreen";
import { useEffect, useRef } from "react";
import { fontSize } from "react-native-rapi-ui/constants/typography";

import { CategoryListScreen } from "./screens/envelope/category-list-screen";
import { DatabaseScreen } from "./screens/database/database-screen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
// const Tab = createMaterialBottomTabNavigator();


const navTo = (navigation: any, pageName : string) => {
    navigation.navigate(pageName);
};


const TABS_LIST = [
    {label: 'Home', route: 'Home', component: HomeScreen, type: Icon, activeIcon: 'home' },
    {label: 'Envelopes', route: 'Envelopes', component: EnvelopesScreen, type: Icon, activeIcon: 'envelope-o', headerRight: {icon: 'plus', route: 'CreateEnvelope'} },
    {label: 'Revenues', route: 'Revenues', component: RevenueListScreen, type: Icon, activeIcon: 'euro' },
    {label: 'Accounts', route: 'Accounts', component: AccountsScreen, type: Icon, activeIcon: 'bank', headerRight: {icon: 'plus', route: 'CreateAccount'} },
]


const TabButton = ({item, onPress, accessibilityState} : any) => {
    const viewRef = useRef();
    const focused = accessibilityState.selected;

    useEffect( () => {
        if (viewRef && viewRef.current ) {
            if( focused ) {
                viewRef.current.animate({0: {scale: 1}, 1: {scale: 1.5}});
            } else {
                viewRef.current.animate({0: {scale: 1.5}, 1: {scale: 1}});
            }
        }
    }, [focused])

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={1} >
            <Animatable.View ref={viewRef} duration={500} style={styles.container} >
                <Icon name={item.activeIcon} size={25} color={focused ? Colors.primary : Colors.primaryLite} />
            </Animatable.View>
        </TouchableOpacity>
    );
}

function BudgetStackScreen({navigation} : any) {

    /*
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

    
            <Tab.Screen name="Home" component={HomeScreen} options={ ({navigation}) => ({tabBarIcon: homeIconHandler}) } />            
            <Tab.Screen name="Envelopes" component={EnvelopesScreen} options={ ({navigation}) => ( {headerRight: () => (<Button title="+" onPress={() => navTo(navigation, 'CreateCategory')}></Button>), tabBarIcon: envelopeIconHandler} ) } />
            <Tab.Screen name="Revenues" component={RevenueListScreen} options={ ({navigation}) => ({tabBarIcon: revenueIconHandler}) } />
            <Tab.Screen name="Accounts" component={AccountsScreen} options={ ({navigation}) => ( {headerRight: () => (<Button title="+" onPress={() => navTo(navigation, 'CreateAccount')}></Button>), tabBarIcon: accountIconHandler } ) } />        
    */

    const menuHandler = () => {
        // navigation.openDrawer();
        navigation.dispatch(DrawerActions.openDrawer());
        // navigation.navigate('Categories');
    };

    const screens = TABS_LIST.map((item, index) => {
        const optionsHandler = ({navigation} : any) => {
            return {
                tabBarShowLabel: false,
                tabBarLabel: item.label,
                tabBarIcon: ({color, focused}) => (<Icon name={item.activeIcon} size={25} color={color} />),
                tabBarButton: (props) => (<TabButton {...props} item={item} />),
                headerRight: () => ( item.headerRight ? (<Pressable style={{padding: 15}} onPress={() => navTo(navigation, item.headerRight.route)} ><Icon name={item.headerRight.icon} style={{fontSize: 17}} /></Pressable>) : null )
            } as BottomTabNavigationOptions;
        }
        return (<Tab.Screen key={index} name={item.route} component={item.component} options={optionsHandler} style={styles.screen} ></Tab.Screen>);
    });

    return (
        <Tab.Navigator screenOptions={{
            headerShown: true,
            tabBarStyle: {
                height: 60,
            },
            headerLeft: () => (
                <Pressable style={{padding: 15}} onPress={menuHandler}>
                    <Icon name="navicon" style={{fontSize: 17}} />
                </Pressable>
            )
        }} >
            {screens}
        </Tab.Navigator>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    screen: {
        paddingBottom: 16
    }
});


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
            <Stack.Screen name="Drawer" component={AppDrawer} options={{ headerShown: false }}/>
            
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



const Drawer = createDrawerNavigator();

function DrawerContent(props: any) {

    const dimension = useWindowDimensions();

    return (
        <View style={{flex: 1}}>
            <View style={{height: 200, alignItems: "center"}} >
                <Image source={ require('../assets/icon.png') } style={{flex: 1, height: 200, width: 200, resizeMode: 'cover'}} />
            </View>
            <DrawerContentScrollView>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>
        </View>
    );
}

function AppDrawer() {

    const dimension = useWindowDimensions();
    const drawerType = dimension.width >= 700 ? 'permanent' : 'front';

    return (
        <Drawer.Navigator
            initialRouteName="Main"
            drawerType={drawerType}
            edgeWith={300}
            drawerContent={(props) => <DrawerContent {...props} /> }
        >
            <Drawer.Screen name="Main" component={BudgetStackScreen} options={{headerShown: false}} />
            <Drawer.Screen name="Categories" component={CategoryListScreen} />
            <Drawer.Screen name="TutoScreen" component={TutoScreen} options={{title: 'Tutorial'}} />
            <Drawer.Screen name="Database" component={DatabaseScreen} />
        </Drawer.Navigator>
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