import React, { useEffect, useRef } from "react";
import { DrawerActions, NavigationContainer } from "@react-navigation/native";
import { BottomTabNavigationOptions, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Text, ThemeProvider } from "react-native-rapi-ui";
import { Button, StyleSheet, TouchableOpacity, useWindowDimensions, Pressable, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/FontAwesome';


import HomeScreen from "./screens/home";

import EnvelopesScreen from "./screens/envelope/envelopes-screen";
import { AccountListScreen } from "./screens/account/account-list-screen";

import CategoryScreen from "./screens/category/category-screen";

import { AccountTransactionListScreen } from "./screens/transactions/transaction-list-screen";
import { AccountTransactionScreen } from "./screens/transactions/transaction-screen";
import { AccountScreen } from "./screens/account/account-screen";
import { EnvelopFillScreen } from "./screens/envelope/envelope-fill";
import { EnvelopeConfigScreen } from "./screens/envelope";
import { TutoAccountScreen, TutoEnvelopeScreen, TutoFinalScreen, TutoFirstFillEnvelopeScreen, TutoInfoEnvelopeScreen, TutoInfoFillEnvelopeScreen, TutoInfoRevenueScreen, TutoRevenueScreen, TutoScreen } from "./screens/tuto/tuto-screen";
import RevenueScreen from "./screens/revenues/revenue-screen";
import RevenueListScreen from "./screens/revenues/revenue-list-screen";
import { Colors } from "react-native/Libraries/NewAppScreen";



import { CategoryListScreen } from "./screens/category/category-list-screen";
import { DatabaseScreen } from "./screens/database/database-screen";
import { t } from "./services/i18n";
import DrawerContent from "./screens/drawer/left-drawer";
import SettingsScreen from "./screens/settings/settings-screen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


const navTo = (navigation: any, pageName : string) => {
    navigation.navigate(pageName);
};


const TABS_LIST = [
    {label: 'common:home', route: 'Home', component: HomeScreen, type: Icon, activeIcon: 'home' },
    {label: 'common:envelops', route: 'Envelops', component: EnvelopesScreen, type: Icon, activeIcon: 'envelope-o', headerRight: {icon: 'plus', route: 'CreateEnvelope'} },
    {label: 'common:revenues', route: 'Revenues', component: RevenueListScreen, type: Icon, activeIcon: 'euro', headerRight: {icon: 'plus', route: 'CreateRevenue'} },
    {label: 'common:accounts', route: 'Accounts', component: AccountListScreen, type: Icon, activeIcon: 'bank', headerRight: {icon: 'plus', route: 'CreateAccount'} },
]


const TabButton = ({item, onPress, accessibilityState} : any) => {
    const viewRef = useRef<any>();
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

    const menuHandler = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    const screens = TABS_LIST.map((item, index) => {
        const optionsHandler = ({navigation} : any) => {
            return {
                tabBarShowLabel: false,
                title: t(item.label),
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



function MainStackScreen({navigation} : any) {

    return (
        <Stack.Navigator>
            <Stack.Screen name="Drawer" component={AppDrawer} options={{ headerShown: false }}/>
            
            <Stack.Screen name="CreateRevenue" component={ RevenueScreen } options={{title: t('title:revenue_new')}}/>
            <Stack.Screen name="EditRevenue" component={ RevenueScreen } options={{title: t('title:revenue_edit')}}/>

            <Stack.Screen name="CreateCategory" component={ CategoryScreen } options={{title: t('title:category_new')}}/>
            <Stack.Screen name="EditCategory" component={ CategoryScreen } options={{title: t('title:category_edit')}}/>

            <Stack.Screen name="ConfigEnvelop" component={ EnvelopeConfigScreen } options={{title: t('common:envelop')}}/>
            <Stack.Screen name="CreateEnvelop" component={ EnvelopeConfigScreen } options={{title: t('title:envelop_new')}}/>
            <Stack.Screen name="FillEnvelope" component={ EnvelopFillScreen } options={{title: t('title:envelop_fill')}} />
            
            <Stack.Screen name="AccountTransaction" component={ AccountTransactionListScreen } options={{title: t('common:transactions') }} />
            <Stack.Screen name="Transaction" component={ AccountTransactionScreen } options={{title: t('common:transaction') }}/>

            <Stack.Screen name="CreateAccount" component={ AccountScreen } options={{title: t('title:account_create')}}/>

                                                                                                                                                        
            <Stack.Screen name="TutoAccountScreen" component={ TutoAccountScreen } options={({navigation}) => ({title: t('title:account_create'), headerRight: () => (<Pressable style={{padding: 15}} onPress={() => navigation.navigate({name: 'CreateAccount'})} ><Icon name="plus" style={{fontSize: 17}} /></Pressable>) })}/>
            <Stack.Screen name="TutoInfoRevenueScreen" component={TutoInfoRevenueScreen} options={{title: t('common:revenue')}} />
            <Stack.Screen name="TutoRevenueScreen" component={ TutoRevenueScreen } options={({navigation}) => ({title: t('common:revenue'), headerRight: () => (<Pressable style={{padding: 15}} onPress={() => navigation.navigate({name: 'CreateRevenue'})} ><Icon name="plus" style={{fontSize: 17}} /></Pressable>) })} />
            <Stack.Screen name="TutoInfoEnvelopeScreen" component={TutoInfoEnvelopeScreen} options={{title: t('title:envelop_create')}} />
            <Stack.Screen name="TutoEnvelopeScreen" component={TutoEnvelopeScreen} options={ ({navigation}) => ({title: t('title:envelop_create'), headerRight: () => (<Pressable style={{padding: 15}} onPress={() => navigation.navigate({name: 'CreateEnvelop'})} ><Icon name="plus" style={{fontSize: 17}} /></Pressable>)} ) } />
            <Stack.Screen name="TutoInfoFillEnvelopeScreen" component={TutoInfoFillEnvelopeScreen} options={{title: t('title:envelop_fill')}} />
            <Stack.Screen name="TutoFirstFillEnvelopeScreen" component={TutoFirstFillEnvelopeScreen} options={{title: t('title:envelop_fill')}} />
            <Stack.Screen name="TutoFinalScreen" component={TutoFinalScreen} options={{title: t('common:ready')}} />

        </Stack.Navigator>
    );

}



const Drawer = createDrawerNavigator();



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
            <Drawer.Screen name="Main" component={BudgetStackScreen} options={{headerShown: false, title: t('menus:home') }} />
            <Drawer.Screen name="Categories" component={CategoryListScreen} options={{title: t('menus:categories') }} />
            <Drawer.Screen name="TutoScreen" component={TutoScreen} options={{title: t('menus:tutorial') }} />
            <Drawer.Screen name="SettingsScreen" component={SettingsScreen} options={{title: t('menus:settings') }} />
            <Drawer.Screen name="Database" component={DatabaseScreen} options={{title: t('menus:database') }} />
        </Drawer.Navigator>
    );

}



type ErrorBundaryState = {
    hasError: boolean;
    error?: any;
    errorInfo?: any;
};

class ErrorBundary extends React.Component<any, ErrorBundaryState> {

    constructor(props : any) {
        super(props);
        this.state = {
            hasError: false
        };
    }

    static getDerivedStateFromError(error:any) {
        return { hasError: true, error: error };
    }

    componentDidCatch(error:any, errorInfo:any) {
        // errorService.log({ error, errorInfo });
        console.error('Error : ', error);
        console.error('Error info : ', JSON.stringify(errorInfo) );
        /*
        this.setState({
            error: error,
            errorInfo: errorInfo,
          });
          */
    }


    render() {

        if (this.state.hasError) {
            return (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Oops, something went wrong.</Text>
                    { this.state.error ? (<Text>Error: {this.state.error.toString()}</Text>) : null }
                    { this.state.errorInfo ? (<Text>Error Info: {JSON.stringify(this.state.errorInfo.toString())}</Text>) : null }
                </View>
            );
        }
        return this.props.children; 
    }

}


export default function Router() {

    return (
        <ErrorBundary>
            <ThemeProvider theme="light">
                <NavigationContainer>
                    <MainStackScreen />
                </NavigationContainer>
            </ThemeProvider>
        </ErrorBundary>
    );

}