import { View } from "react-native";
import { Button, Text } from "react-native-rapi-ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { scroll_styles } from "../../styles";
import { AccountsScreen } from "../account/accounts-screen";
import EnvelopesScreen from "../envelope/envelopes_screen";

export function TutoInfoFinalScreen({navigation} : any) {

    const nextHandler = () => {

        // navigation.navigate({name: 'TutoEnvelopeScreen'});

    };

    const closeHandler = () => {
        navigation.navigate({name: 'Home'});
    };

    return (
        <SafeAreaView style={scroll_styles.container}>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{margin: 10, fontSize: 24}}>Each month, fill the envelopes with the amount.</Text>
            </View>

            <View style={{margin: 10}}>
                <Button text="CLOSE" onPress={closeHandler}></Button>
            </View>

        </SafeAreaView>
    );

}


export function TutoEnvelopeScreen({navigation} : any) {

    const nextHandler = () => {
        navigation.navigate({name: 'TutoInfoFinalScreen'});
    };


    return (
        <>
            <EnvelopesScreen navigation={navigation} />
            <View style={{margin: 10}}>
                <Button text="NEXT" onPress={nextHandler}></Button>
            </View>
        </>
    );

}

export function TutoInfoEnvelopeScreen({navigation} : any) {

    const nextHandler = () => {

        navigation.navigate({name: 'TutoEnvelopeScreen'});

    };

    return (
        <SafeAreaView style={scroll_styles.container}>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{margin: 10, fontSize: 24}}>Create your categeroes, and the envelopes before config them.</Text>
            </View>

            <View style={{margin: 10}}>
                <Button text="NEXT" onPress={nextHandler}></Button>
            </View>

        </SafeAreaView>
    );

}


export function TutoAccountScreen({navigation} : any) {

    const nextHandler = () => {

        navigation.navigate({name: 'TutoInfoEnvelopeScreen'});

    };

    return (
        <>
            <AccountsScreen navigation={navigation}></AccountsScreen>
            <View style={{margin: 10}}>
                <Button text="NEXT" onPress={nextHandler}></Button>
            </View>
        </>
    );

}


export function TutoScreen({navigation} : any) {


    const nextHandler = () => {

        navigation.navigate({name: 'TutoAccountScreen'});

    };

    return (
        <SafeAreaView style={scroll_styles.container}>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{margin: 10, fontSize: 24}}>Start to create your accounts, and initialize them with the current balance.</Text>
            </View>

            <View style={{margin: 10}}>
                <Button text="NEXT" onPress={nextHandler}></Button>
            </View>

        </SafeAreaView>
    );

}
