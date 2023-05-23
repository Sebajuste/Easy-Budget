import { View } from "react-native";
import { Section, SectionContent, Text } from "react-native-rapi-ui";
import { EnvelopeTransaction, Movement } from "../../services/transaction";


/** @deprecated */
export default function EnvelopeTransactionView({transaction} : {transaction: EnvelopeTransaction}) {

    return (
        <Section style={{marginTop: 10}}>
            <SectionContent style={{flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                    <Text>{transaction.name}</Text>
                    <Text>{typeof transaction.date == 'string' ? new Date(transaction.date).toLocaleDateString() : transaction.date.toLocaleDateString()}</Text>
                    <Text>{transaction.amount.toFixed(2)} €</Text>
                </View>
            </SectionContent>
        </Section>
    );

}

export function EnvelopeMovementView({movement } : {movement : Movement}) {
    return (
        <Section style={{marginTop: 10}}>
            <SectionContent style={{flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                    <Text>{movement.name}</Text>
                    <Text>{typeof movement.date == 'string' ? new Date(movement.date).toLocaleDateString() : movement.date.toLocaleDateString()}</Text>
                    <Text>{ movement.debit.toFixed(2) } €</Text>
                </View>
            </SectionContent>
        </Section>
    );
}
