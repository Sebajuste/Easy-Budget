import { useIsFocused } from "@react-navigation/native";
import _ from "lodash";
import { useEffect, useState } from "react";
import { ScrollView, TouchableHighlight, View } from "react-native";
import { Button, Section, SectionContent, Text } from "react-native-rapi-ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { DaoType } from "../../services/dao";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import { Revenue } from "../../services/revenue";
import { scroll_styles } from "../../styles";



function RevenueView({ onSelect, revenue } : { onSelect?: (revenue: Revenue) => void, revenue : Revenue}) {

    const selectHandler = (event : any) => {
        if( onSelect ) {
            onSelect(revenue);
        }
    };

    return (
        <TouchableHighlight onPress={selectHandler} >
            <Section style={{margin: 5}}>
                <SectionContent>
                    <Text>{revenue.name}</Text>
                    <Text>{revenue.amount} €</Text>
                </SectionContent>
            </Section>
        </TouchableHighlight>
    );

}


export default function RevenueListScreen({navigation, onChange} : {navigation: any, onChange?: (revenues: Revenue[]) => void }) {

    const [revenues, setRevenues] = useState<Revenue[]>([]);

    const revenueDao = DAOFactory.getDAOFromType<Revenue>(DaoType.REVENUE, DATABASE_TYPE);

    const isFocused = useIsFocused();

    const addRevenueHandler = () => {
        navigation.navigate('CreateRevenue')
    };

    const onSelectHandler = (revenue : Revenue) => {
        navigation.navigate({name: 'EditRevenue', params: {revenue: revenue} });
    };

    useEffect(() => {
        revenueDao.load().then(revenues => {
            setRevenues(revenues);
            if( onChange ) onChange(revenues);
        });
    }, [isFocused]);

    

    const total = _.sum( _.map(revenues, revenue => revenue.amount) );

    const revenue_items = revenues.map((revenue, index) => <RevenueView key={index} onSelect={onSelectHandler} revenue={revenue} />)

    return (
        <SafeAreaView style={scroll_styles.container}>
            <ScrollView style={scroll_styles.scrollView}>
                <Text style={{textAlign: 'right', margin: 10}}>All revenues : {total} €</Text>
                {revenue_items}
            </ScrollView>

            <View style={{flex: 1, margin: 20, justifyContent: 'center', alignItems: 'center'}}>
                <Button text="ADD" onPress={addRevenueHandler} />
            </View>

        </SafeAreaView>
    );

}