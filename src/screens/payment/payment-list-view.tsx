import { useIsFocused } from "@react-navigation/native";
import _ from "lodash";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, Section, Text } from "react-native-rapi-ui";
import { DaoType } from "../../services/dao";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import { Envelope, EnvelopeDao, updateNextDueDate } from "../../services/envelope";
import { t } from "../../services/i18n";
import { container_state_styles, scroll_styles } from "../../styles";


export default function NextPaymentListView({onPayment} : {onPayment?: (envelop: Envelope) => void}) {

    const [nextPaiements, setNextPaiements] = useState<Envelope[]>([]);

    const isFocused = useIsFocused();

    const envelopeDao = DAOFactory.getDAOFromType<Envelope>(DaoType.ENVELOPE, DATABASE_TYPE);

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


    const next_paiment_items = nextPaiements.map((envelope, index) => {

        const dateStr : string = envelope.dueDate && typeof envelope.dueDate === 'string' ? new Date(envelope.dueDate).toDateString() : '';

        const statusStyle = envelope.funds < envelope.amount  ? container_state_styles.danger : container_state_styles.success

        return (
            <Section key={index} style={{margin: 10}} >
                <View style={{flexDirection: 'row', padding: 10, ...statusStyle}}>
                    <View style={{flex: 1}}>
                         <Text style={{fontSize: 24}}>{envelope.name}</Text>
                            
                            <Text>{ dateStr }</Text>
                            <Text>{envelope.funds} € / {envelope.amount} €</Text>
                    </View>
                    <View >
                        <Button text={t('buttons:pay')} onPress={() => { if( onPayment ) { onPayment(envelope); } } }></Button>
                    </View>
                </View>
            </Section>
        );
    });

    return (

        <ScrollView style={scroll_styles.scrollView}>
            {next_paiment_items}
        </ScrollView>

    );

}
