import { useContext, useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { View } from "react-native-animatable";
import { ScrollView } from "react-native-gesture-handler";
import { Button, Text } from "react-native-rapi-ui";
import { SafeAreaView } from "react-native-safe-area-context";
import _ from "lodash";

import { DeleteConfirmModal } from "../../components/modal";
import { Account } from "../../services/account";
import { DaoType } from "../../services/dao";

import { Envelope} from "../../services/envelope";
import { Settings } from "../../services/settings";
import { DatabaseContext } from "../../services/db-context";
import { DatabaseManager } from "../../services/database-manager";


async function checkDatabase(dbManager : DatabaseManager ) {



    const envelopeDao = dbManager.getDAOFromType<Envelope>(DaoType.ENVELOPE);
    const accountDao = dbManager.getDAOFromType<Account>(DaoType.ACCOUNT);
  
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

    const [version, setVersion] = useState('');

    const [message, setMessage] = useState<string|null>(null)

    const [databaseCheck, setDatabaseCheck] = useState(false);

    const [databaseResult, setDatabaseResult] = useState([]);

    const [deleteVisible, setDeleteVisible] = useState(false);

    const { dbManager } = useContext(DatabaseContext);

    const settingsDao = dbManager.getDAOFromType<Settings>(DaoType.SETTINGS);

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

    const saveBackupHandler = () => {

      const dbPath = `${FileSystem.documentDirectory}SQLite/easy_budget.db`;

      const timestamp = new Date().toISOString();
      const backupFileUri = `${FileSystem.cacheDirectory}easy_budget_${timestamp}.db`;

      dbManager.close().then(v => {
        return FileSystem.copyAsync({ from: dbPath, to: backupFileUri });
      })//
      .then( r => {
        return Sharing.shareAsync(`file://${backupFileUri}`);
      })//
      .then( r => {
        return FileSystem.deleteAsync(backupFileUri);
      })//
      .finally( () => dbManager.open() ) //
      .catch(console.error);

    };

    const restoreBackupHandler = async () => {

      const dbPath = `${FileSystem.documentDirectory}SQLite/easy_budget.db`;

      try {
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/octet-stream' });
        // const result = await DocumentPicker.getDocumentAsync();

        if (result.type === 'success' && result.uri) {

          await dbManager.close();

          await FileSystem.copyAsync({ from: result.uri, to: dbPath });

          await dbManager.open();

          await dbManager.init();

          console.log('La restauration de la sauvegarde a réussi');
        } else {
          console.log('Aucun fichier n\'a été sélectionné');
        }

      } catch(err) {
        console.error(err);
      }

    };

    useEffect(() => {
      setLoading(true);

      const p1 = settingsDao.find('version').then(setting => setVersion(setting ? setting.value : 'unknown'));

      settingsDao.load().then(console.log);

      const p2 = checkDatabase(dbManager).then(setDatabaseCheck).catch(console.error);

      Promise.all([p1, p2]).finally(() => setLoading(false));

      // checkDatabase().then(setDatabaseCheck).catch(console.error).finally(() => setLoading(false));

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
          <View style={{margin: 20}}>
            <Button text="Save Backup" onPress={saveBackupHandler} style={{marginBottom: 10}} />
            <Button text="Restore Backup" onPress={restoreBackupHandler} style={{marginBottom: 10}} />
          </View>
          <View style={{flex: 1, margin: 20}}>
            <ScrollView>
              {errorItems}
            </ScrollView>
          </View>
          <View style={{margin: 20}}>
            <Text style={{marginBottom: 20}}>Database Integrity : { databaseCheck ? 'OK': 'ERROR' }  </Text>
            <Text style={{marginBottom: 20}}>Database Version   : { version }  </Text>
            { message ? <Text style={{marginBottom: 20}}>{message}</Text> : null }
            <Button text="DELETE Database" onPress={()=> setDeleteVisible(true)}></Button>
          </View>
          <DeleteConfirmModal visible={deleteVisible} onConfirm={clearDatabaseHandler} onCancel={ ()=> setDeleteVisible(false)} options={{title: 'Delete Database'}} />
        </SafeAreaView>
    );

}
