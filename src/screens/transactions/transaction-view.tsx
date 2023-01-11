import { View } from "react-native";
import { CheckBox, Section, SectionContent, Text } from "react-native-rapi-ui";
import { Transaction } from "../../services/transaction";



export default function TransactionView({transaction} : {transaction: Transaction}) {

    return (
        <Section style={{marginTop: 10}}>
            <SectionContent style={{flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                    <Text>{transaction.name}</Text>
                    <Text>{typeof transaction.date == 'string' ? new Date(transaction.date).toDateString() : transaction.date.toDateString()}</Text>
                    <Text>{transaction.amount.toFixed(2)} €</Text>
                </View>
                <View>
                    <CheckBox value={transaction.reconciled} disabled={true} />
                </View>
            </SectionContent>
        </Section>
    );

}
