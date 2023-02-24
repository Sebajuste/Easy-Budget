import { useIsFocused } from "@react-navigation/native";
import _ from "lodash";
import { useEffect, useState } from "react";
import { View } from "react-native-animatable";
import { ScrollView } from "react-native-gesture-handler";
import { Button, Text } from "react-native-rapi-ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { Account, AccountDao } from "../../services/account";
import { DaoType } from "../../services/dao";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import { Envelope, EnvelopeDao } from "../../services/envelope";
import { EnvelopeTransactionDao } from "../../services/transaction";


async function checkDatabase() {

    const envelopeDao = DAOFactory.getDAOFromType<Envelope>(DaoType.ENVELOPE, DATABASE_TYPE);
    const accountDao = DAOFactory.getDAOFromType<Account>(DaoType.ACCOUNT, DATABASE_TYPE);
  
    /*
    const total_fill = await transactionDao.load()//
      .then(transactions => _.filter(transactions, transaction => transaction.transactionType == TransactionType.FILL) )//
      .then(transactions => _.sum(_.map(transactions, transaction => transaction.amount ) ) );
    */

    const total_funds = await envelopeDao.load().then(envelopes => _.sum(_.map(envelopes, envelope => envelope.funds )) );
  
    const total_account_filled = await accountDao.load()//
      .then(accounts => _.map(accounts, account => account.balance - account.envelope_balance))//
      .then(totals => _.sum(totals));
  
    console.log(`total_account_filled: ${total_account_filled}, total_funds: ${total_funds}`);

    return Math.abs(total_account_filled - total_funds) < 0.001;
    
}





export function DatabaseScreen() {

    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState<string|null>(null)

    const [databaseCheck, setDatabaseCheck] = useState(false);

    const [databaseResult, setDatabaseResult] = useState([]);

    const dbManager = DAOFactory.getDatabaseManager(DATABASE_TYPE);

    const isFocused = useIsFocused();

    const clearDatabaseHandler = () => {
        setMessage(null);
        dbManager.delete().then(() => {
          return dbManager.init();
        }).then(() => {
          console.log('Database ready');
          setMessage('Database ready');
        }).catch(err => {
          console.error(err);
          setMessage(err.message);
        });
    };

    useEffect(() => {
      setLoading(true);
      checkDatabase().then(setDatabaseCheck).catch(console.error).finally(() => setLoading(false));

      setDatabaseResult( dbManager.getLastError() )

    }, [isFocused]);

    if( loading ) {
      return (
        <View>
          <Text>Loading...</Text>
        </View>
      );
    }

    const errorItems = _.filter(databaseResult, (item: any) =>  item.hasOwnProperty('error') ).map( (item: any, index: number) => {
      console.log(item.error);
      return (
        <Text key={index}>{item.error.toString()}</Text>
      );
    });

    return (
        <SafeAreaView style={{flex: 1, margin: 5}}>
          <View style={{flex: 1, margin: 20}}>
            <ScrollView>
              {errorItems}
            </ScrollView>
          </View>
          <View style={{margin: 20}}>
            <Text style={{marginBottom: 20}}>Database Integrity : { databaseCheck ? 'OK': 'ERROR' }  </Text>
            { message ? <Text style={{marginBottom: 20}}>{message}</Text> : null }
            <Button text="DELETE Database" onPress={clearDatabaseHandler}></Button>
          </View>
        </SafeAreaView>
    );

}
