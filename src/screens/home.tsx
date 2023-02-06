import { SafeAreaView, ScrollView, View } from "react-native";
import { Button, Text } from "react-native-rapi-ui";
import { Envelope, EnvelopeDao } from "../services/envelope";
import { scroll_styles } from "../styles";
import { useEffect, useState } from "react";
import _ from "lodash";
//import { EnvelopeDaoStorage } from "../services/async_storage/envelope-async-storage";
//import { AccountDaoStorage } from "../services/async_storage/account_async_storage";
// import { DatabaseManager, DATABASE_TYPE, getDao } from "../services/dao-manager";
// import { SettingsDao } from "../services/settings";
import { DAOFactory, DATABASE_TYPE } from "../services/dao-manager";
import { AccountTransaction, EnvelopeTransactionDao } from "../services/transaction";
import { AccountDao } from "../services/account";
import NextPaymentListView from "./payment/payment-list-view";


async function checkDatabase() {
  const transactionDao = DAOFactory.getDAO(EnvelopeTransactionDao, DATABASE_TYPE); // new TransactionDaoStorage();
  const envelopeDao = DAOFactory.getDAO(EnvelopeDao, DATABASE_TYPE);
  const accountDao = DAOFactory.getDAO(AccountDao, DATABASE_TYPE);

  /*
  const total_fill = await transactionDao.load()//
    .then(transactions => _.filter(transactions, transaction => transaction.transactionType == TransactionType.FILL) )//
    .then(transactions => _.sum(_.map(transactions, transaction => transaction.amount ) ) );
  */
 

  const total_funds = await envelopeDao.load().then(envelopes => _.sum(_.map(envelopes, envelope => envelope.funds )) );

  const total_account_filled = await accountDao.load()//
    .then(accounts => _.map(accounts, account => account.balance - account.envelope_balance))//
    .then(totals => _.sum(totals));

  return Math.abs(total_account_filled - total_funds) < 0.001;
  
}

export default function HomeScreen({navigation} : any) {

    const [databaseCheck, setDatabaseCheck] = useState(false);

    const dbManager = DAOFactory.getDatabaseManager(DATABASE_TYPE);

    const clearDatabaseHandler = () => {
      console.log('Clear DB')
      dbManager.delete().then(() => {
        return dbManager.init();
      }).then(() => {
        console.log('Database ready');
      }).catch(err => {
        console.error(err);
      });
    };

    const paymentHandler = (envelope : Envelope) => {
      // navigation.navigate('', {par});

      
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

    useEffect(() => {
      
      checkDatabase().then(setDatabaseCheck).catch(console.error);
      /*
      const settingsDao = getDao<SettingsDao>(SettingsDao, DATABASE_TYPE);

      settingsDao.load().then(settings => {
        if( !settings.tuto_shown ) {
          startTuto();
        }
      });
      */
    }, []);

    // 

    return (
      <SafeAreaView style={scroll_styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Home</Text>
          <Text>Check database : { databaseCheck ? 'OK': 'ERROR' }  </Text>
          <Button text="Clear Database" onPress={clearDatabaseHandler}></Button>
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