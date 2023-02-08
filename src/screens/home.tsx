import { SafeAreaView, ScrollView, View } from "react-native";
import { Button, Text } from "react-native-rapi-ui";
import _ from "lodash";

import { Envelope } from "../services/envelope";
import { scroll_styles } from "../styles";
import { AccountTransaction } from "../services/transaction";
import NextPaymentListView from "./payment/payment-list-view";



export default function HomeScreen({navigation} : any) {

    const paymentHandler = (envelope : Envelope) => {

      const transaction = {
        name: `Paiement ${envelope.name}`,
        amount: envelope.amount,
        envelope_id: envelope._id,
        date: new Date().toISOString() as any,
      } as AccountTransaction;

      navigation.navigate({name: 'Transaction', params: {transaction: transaction} });
    
    };

    const startTuto = () => {
      navigation.navigate({name: 'TutoScreen'});
    };

    return (
      <SafeAreaView style={scroll_styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          
          <Button text="Start tuto" onPress={startTuto}></Button>
        </View>
        <View style={{ flex: 1, margin: 10 }}>
          <Text>Next paiements : </Text>
          <ScrollView style={scroll_styles.scrollView}>
            <NextPaymentListView onPayment={paymentHandler} />
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }