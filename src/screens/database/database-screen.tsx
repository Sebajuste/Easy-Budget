import { useIsFocused } from "@react-navigation/native";
import _ from "lodash";
import { useEffect, useState } from "react";
import { View } from "react-native-animatable";
import { Button, Text } from "react-native-rapi-ui";
import { AccountDao } from "../../services/account";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import { EnvelopeDao } from "../../services/envelope";
import { EnvelopeTransactionDao } from "../../services/transaction";


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





export function DatabaseScreen() {

    const [loading, setLoading] = useState(false);

    const [databaseCheck, setDatabaseCheck] = useState(false);

    const dbManager = DAOFactory.getDatabaseManager(DATABASE_TYPE);

    const isFocused = useIsFocused();

    const clearDatabaseHandler = () => {
        dbManager.delete().then(() => {
          return dbManager.init();
        }).then(() => {
          console.log('Database ready');
        }).catch(err => {
          console.error(err);
        });
    };

    useEffect(() => {
      setLoading(true);
      checkDatabase().then(setDatabaseCheck).catch(console.error).finally(() => setLoading(false));
    }, [isFocused]);

    if( loading ) {
      return (
        <View>
          <Text>Loading...</Text>
        </View>
      );
    }

    return (
        <View style={{margin: 5}}>
            <View style={{margin: 20}}>
                <Text>Database Integrity : { databaseCheck ? 'OK': 'ERROR' }  </Text>
            </View>
            <Button text="DELETE Database" onPress={clearDatabaseHandler}></Button>
        </View>
    );

}
