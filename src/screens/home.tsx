import { SafeAreaView, ScrollView, View } from "react-native";
import { Button, Text } from "react-native-rapi-ui";
import _ from "lodash";

import { Envelope } from "../services/envelope";
import { scroll_styles } from "../styles";
import { AccountTransaction, TransactionType } from "../services/transaction";
import NextPaymentListView from "./payment/payment-list-view";

import { t } from '../services/i18n';

export default function HomeScreen({navigation} : any) {

    const paymentHandler = (envelope : Envelope) => {

      const transaction = {
        name: `Paiement ${envelope.name}`,
        amount: envelope.amount,
        envelope_id: envelope._id,
        date: new Date().toISOString() as any,
        type: TransactionType.OUTCOME
      } as AccountTransaction;

      navigation.navigate({name: 'Transaction', params: {transaction: transaction} });
    
    };

    const startTuto = () => {
      navigation.navigate({name: 'TutoScreen'});
    };

    return (
      <SafeAreaView style={scroll_styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Button text={ t('buttons:start_tutorial') } onPress={startTuto}></Button>
        </View>
        <View style={{ flex: 1, margin: 10 }}>
          <Text>{ t('common:next_paiements') } : </Text>
          <ScrollView style={scroll_styles.scrollView}>
            <NextPaymentListView onPayment={paymentHandler} />
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }