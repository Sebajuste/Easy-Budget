import { View } from "react-native";
import { Section, SectionContent, Text } from "react-native-rapi-ui";
import { EnvelopeTransaction } from "../../services/transaction";



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
