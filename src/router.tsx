import React, { useContext, useEffect, useRef, useState } from "react";
import { DrawerActions, NavigationContainer } from "@react-navigation/native";
import { BottomTabNavigationOptions, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { ThemeProvider } from "react-native-rapi-ui";
import { TouchableOpacity, useWindowDimensions, Pressable, View, ActivityIndicator } from 'react-native';
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
import { LanguageContext, t } from "./services/i18n";
import DrawerContent from "./screens/drawer/left-drawer";
import SettingsScreen from "./screens/settings/settings-screen";
import { DAOFactory, DATABASE_TYPE } from "./services/dao-manager";
import { DaoType } from "./services/dao";
import { styles } from "./styles";
import InitConfigScreen from "./screens/settings/init-config-screen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


const navTo = (navigation: any, pageName : string) => {
    navigation.navigate(pageName);
};


const TABS_LIST = [
    {label: 'common:home', route: 'Home', component: HomeScreen, type: Icon, activeIcon: 'home' },
    {label: 'common:envelops', route: 'Envelops', component: EnvelopesScreen, type: Icon, activeIcon: 'envelope-o', headerRight: {icon: 'plus', route: 'CreateEnvelop'} },
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
    }, [focused]);

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
        return (<Tab.Screen key={index} name={item.route} component={item.component} options={optionsHandler} ></Tab.Screen>);
    });

    return (
        <Tab.Navigator initialRouteName="Home" screenOptions={{
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

const Drawer = createDrawerNavigator();

function AppDrawer() {

    return (
        <Drawer.Navigator
            initialRouteName="Main"
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

function MainStackScreen() {

    const [isInit, setIsInit] = useState(false);

    const [loading, setLoading] = useState(false);

    const settingsDao = DAOFactory.getDAOFromType(DaoType.SETTINGS, DATABASE_TYPE);

    useEffect(() => {
        setLoading(true);
        settingsDao.find('language').then(r => {
            console.log('check init with lang : ', r)
            if( r ) {
                setIsInit(true);
                // navigation.navigate('Drawer');
            } else {
                setIsInit(false);
            }

        }).finally(() => {
            setLoading(false);
        })

    }, []);

    if( loading ) {
        return (
            <View style={styles.loadingScreen}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <Stack.Navigator initialRouteName={isInit ? "Drawer" : "InitConfigScreen"}>

            <Stack.Screen name="InitConfigScreen" component={InitConfigScreen} options={{ headerShown: false }}/>

            <Stack.Screen name="Drawer" component={AppDrawer} options={{ headerShown: false }}/>
            
            <Stack.Screen name="CreateRevenue" component={ RevenueScreen } options={{title: t('title:revenue_new')}}/>
            <Stack.Screen name="EditRevenue" component={ RevenueScreen } options={{title: t('title:revenue_edit')}}/>

            <Stack.Screen name="CreateCategory" component={ CategoryScreen } options={{title: t('title:category_new')}}/>
            <Stack.Screen name="EditCategory" component={ CategoryScreen } options={{title: t('title:category_edit')}}/>

            <Stack.Screen name="ConfigEnvelop" component={ EnvelopeConfigScreen } options={{title: t('common:envelope')}}/>
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





export default function Router() {

    return (
        <ThemeProvider theme="light">
            <NavigationContainer>
                <MainStackScreen />
            </NavigationContainer>
        </ThemeProvider>
    );

}