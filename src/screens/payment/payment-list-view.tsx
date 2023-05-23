import { useIsFocused } from "@react-navigation/native";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, Section, Text } from "react-native-rapi-ui";
import { DaoType } from "../../services/dao";
import { Envelope, envelopePreviousDueDate, isValidEnvelope, updateNextDueDate } from "../../services/envelope";
import { t } from "../../services/i18n";
import { EnvelopeTransaction, EnvelopeTransactionDao } from "../../services/transaction";
import { container_state_styles, scroll_styles } from "../../styles";
import { DatabaseContext } from "../../services/db-context";


function NextPaimentItem({envelope, onPayment} : {envelope:Envelope, onPayment?: (envelope:Envelope) => void}) {

    const [totalFill, setTotalFill] = useState(0);

    const now = new Date();

    const dateStr : string = envelope.dueDate && typeof envelope.dueDate === 'string' ? new Date(envelope.dueDate).toDateString() : '';

    const { dbManager } = useContext(DatabaseContext);

    // const envelopeTransactionDao = dbManager.getDAOFromType<EnvelopeTransaction>(DaoType.ENVELOPE_TRANSACTION) as EnvelopeTransactionDao;

    const statusStyle = isValidEnvelope(envelope, totalFill)  ? container_state_styles.success : container_state_styles.danger;

    useEffect(() => {
        /*
        envelopeTransactionDao.range(envelope, envelopePreviousDueDate(envelope), now).then(transactions => {
            setTotalFill( _.sum( _.map(transactions, 'amount') ) );
        });
        */
    }, []);

    return (
        <Section style={{margin: 10}} >
            <View style={{flexDirection: 'row', padding: 10, ...statusStyle}}>
                <View style={{flex: 1}}>
                     <Text style={{fontSize: 24}}>{envelope.name}</Text>
                        <Text>{ dateStr }</Text>
                        <Text>{envelope.funds.toFixed(2)} € / {envelope.amount.toFixed(2)} €</Text>
                </View>
                <View >
                    <Button text={t('buttons:pay')} onPress={() => { if( onPayment ) { onPayment(envelope); } } }></Button>
                </View>
            </View>
        </Section>
    );

}


export default function NextPaymentListView({onPayment} : {onPayment?: (envelope: Envelope) => void}) {

    const [nextPaiements, setNextPaiements] = useState<Envelope[]>([]);

    const isFocused = useIsFocused();


    const { dbManager } = useContext(DatabaseContext);

    const envelopeDao = dbManager.getDAOFromType<Envelope>(DaoType.ENVELOPE);

    useEffect(() => {

        const now = new Date();

        const envelopeFilter = (envelope : Envelope) => {

            const date : Date = typeof envelope.dueDate === 'string' ? new Date(envelope.dueDate) : envelope.dueDate as Date;
            return date.getTime() < now.getTime() || envelope.funds > envelope.amount;
        }

        envelopeDao.load().then(envelopes => {

            // Change Due Date
            for( const envelope of updateNextDueDate(envelopes) ) {
                envelopeDao.update(envelope);
            }

            return _.orderBy( _.filter(envelopes, envelopeFilter) as Envelope[], ['dueDate'], ['asc']);
        }).then(setNextPaiements)//
        .catch(console.error);


    }, [isFocused]);


    const next_paiment_items = nextPaiements.map((envelope, index) => <NextPaimentItem key={index} envelope={envelope} onPayment={onPayment} />);

    return (

        <ScrollView style={scroll_styles.scrollView}>
            {next_paiment_items}
        </ScrollView>

    );

}
