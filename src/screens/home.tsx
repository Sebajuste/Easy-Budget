import { SafeAreaView, ScrollView, View } from "react-native";
import { Button, Text } from "react-native-rapi-ui";
import { clearAsyncStorageDB } from "../services/async_storage/async_storage";
import { Envelope } from "../services/budget";
import { Transaction, TransactionType } from "../services/transaction";
import { scroll_styles } from "../styles";
import PaiementListView from "./paiment/paiment-list-view";
import uuid from 'react-native-uuid';

export default function HomeScreen({navigation} : any) {

    const clearDatabaseHandler = () => {
        clearAsyncStorageDB();
    };

    const paimentHandler = (envelope : Envelope) => {
      // navigation.navigate('', {par});

      const transaction = {
        _id: uuid.v4(),
        name: `Paiement ${envelope.name}`,
        transactionType: TransactionType.PAIMENT,
        amount: envelope.amount,
        envelope_id: envelope._id,
        date: new Date().toISOString() as any,
      } as Transaction;

      navigation.navigate({name: 'Transaction', params: {transaction: transaction} });
    };

    return (
      <SafeAreaView style={scroll_styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Home</Text>
          <Button text="Clear Database" onPress={clearDatabaseHandler}></Button>
        </View>
        <View style={{ flex: 1, margin: 10 }}>
          <Text>Next paiements :</Text>
          <ScrollView style={scroll_styles.scrollView}>
            <PaiementListView onPaiement={paimentHandler} />
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }