import { Slider } from "@miblanchard/react-native-slider";
import React, { useContext, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, Layout, Picker, Text } from "react-native-rapi-ui";
import { BankAccount } from "../../services/account";
import { Envelope } from "../../services/envelope";
import _ from "lodash";
import uuid from 'react-native-uuid';
import { StackActions } from "@react-navigation/native";
import { EnvelopeTransaction, Movement, MovementDao, Transaction, TransactionAccount } from "../../services/transaction";
import { scroll_styles } from "../../styles";
import EnvelopeTransactionView, { EnvelopeMovementView } from "../transactions/transaction-view";
import { DaoType } from "../../services/dao";
import { t } from "../../services/i18n";
import { DatabaseContext } from "../../services/db-context";
import { getBankTotalAvailabity } from "../../services/sqlite/account-sqlite";


export function EnvelopFillScreen({navigation, route} : any) {

    const envelopeCategory = route.params?.envelopeCategory;

    const [envelope, setEnvelope] = useState<Envelope>( route.params?.envelope );

    const funds = envelope ? envelope.funds : 0;

    const [solde, setSolde] = useState<number>( funds );

    const [totalAvailable, setTotalAvailable] = useState(0);
    
    const [movements, setMovements] = useState<Movement[]>([]);

    const amount = solde - funds;

    const { dbManager } = useContext(DatabaseContext);

    const transactionDao = dbManager.getDAOFromType<Transaction>(DaoType.TRANSACTION);
    const movementDao = dbManager.getDAOFromType<Movement>(DaoType.TRANSACTION_MOVEMENT) as MovementDao;
    const accountTxDao = dbManager.getDAOFromType<TransactionAccount>(DaoType.TRANSACTION_ACCOUNT);

    const saveHandler = () => {

        accountTxDao.find({name: 'Budget Used', type: 'Budget_Used'}).then(transactionAccount => {

            if( transactionAccount == null ) {
                throw new Error('Invalid budget account');
            }

            const fill_debit = {
                account_id: envelope.account_id,
                debit: amount,
                credit: 0
            } as Movement;

            const fill_credit = {
                account_id: transactionAccount._id, // Budget Used
                debit: 0,
                credit: amount
            } as Movement;

            const transaction = {
                _id: uuid.v4(),
                name: `Fill Envelope ${envelope.name}`,
                date: new Date(),
                movements: [fill_debit, fill_credit]
            } as Transaction;

            return transactionDao.add(transaction);

        }).then(v => {
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
        }).catch(err => {
            console.error(err);
        });

    };

    const editHandler = () => {
        const action = StackActions.replace('ConfigEnvelop', {envelopeCategory: envelopeCategory, envelope: envelope});
        navigation.dispatch(action);
    };

    useEffect(() => {

        movementDao.loadFilter({account_id: envelope.account_id})//
            .then(items => _.orderBy(items, ['date'], ['desc'] ) )//
            .then(setMovements);

        getBankTotalAvailabity(movementDao).then(setTotalAvailable);
            

    }, []);

    if( !envelope ) {
        return (
            <Layout style={{margin: 10}}>
                <Text>No Envelope</Text>
            </Layout>
        );
    }

    const formValid = (amount - envelope.funds) <= totalAvailable;

    const movements_items = movements.map((movement, index) => <EnvelopeMovementView movement={movement} key={index} /> );

    const maxEnvelope = Math.min(totalAvailable + funds, envelope.amount);;

    return (
        <Layout style={{margin: 10}}>

            { envelopeCategory ?
                <Button text={ t('buttons:edit') } onPress={editHandler}></Button>
            :
                null
            }
            
            <View>
                <Slider
                    value={solde}
                    disabled={ false }
                    minimumValue={0}
                    maximumValue={maxEnvelope}
                    step={1}
                    onValueChange={(values: any) => setSolde(values[0])}
                />
                <View style={{flexDirection: 'row', margin: 10}}>
                    <Text style={{flex: 1, textAlign: "center"}}>{ t('common:envelope') }: {solde.toFixed(2)} €</Text>
                    <Text style={{flex: 1, textAlign: "center"}}>{ t('common:availability') }: {(totalAvailable - (solde-funds)).toFixed(2)} €</Text>
                </View>
            </View>

            <View style={{ flexDirection: 'row'}} >
                <Button style={{margin: 5, flexGrow: 1}} text={ t('buttons:save') } status="primary" disabled={!formValid} onPress={saveHandler}></Button>
            </View>

            <View style={{marginTop: 10, flex: 1}}>
                <Text style={{padding: 10}}>{ t('common:last_transactions') } :</Text>
                <ScrollView style={scroll_styles.scrollView}>
                    {movements_items}
                </ScrollView>
            </View>

        </Layout>
    );

}