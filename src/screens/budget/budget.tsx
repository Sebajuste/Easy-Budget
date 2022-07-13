import { ScrollView } from "react-native";
import { Button, Section, SectionContent, Text, TopNav } from "react-native-rapi-ui";

import { SafeAreaView } from "react-native-safe-area-context";
import { Budget, BudgetOperation, budgetOperationTypeToString, budgetPerYear, useBudget } from "../../services/budget";
import { scroll_styles } from "../../styles";

import Icon from 'react-native-vector-icons/FontAwesome';


function BudgetSection({navigation, title, budget} : {title: string, budget : Budget}) {

    const operations = budget.operations;

    const total_year = budgetPerYear(operations);
  
    const section_items = operations ? operations.map((operation : BudgetOperation, index : number) => {
      return (<Text key={index}>{operation.name} : {operation.value} € / { budgetOperationTypeToString(operation.type) } </Text>);
    }) : (<></>);
  

    const edit = () => {
      navigation.navigate({name: 'EditBudget', params: {budget: budget}});
    };

    return (
      <>
        <TopNav middleContent={title} rightContent={ <Icon name="edit" size={20} /> } rightAction={edit} />
  
        <Section>
          <SectionContent>
            {section_items}
          </SectionContent>
          <SectionContent>
            <Text>Total An   : {total_year.toFixed(2)} €</Text>
            <Text>Total Mois : {(total_year/12).toFixed(2)} €</Text>
          </SectionContent>
        </Section>
      </>
    );
  
  }

export default function BudgetScreen({navigation}) {

    const [budget_list, setBudget] = useBudget();

    const budget_items = budget_list.map((item : Budget, index : number) => {
        return (<BudgetSection key={index} title={item.name} budget={item} navigation={navigation}></BudgetSection>);
      });
    
    
      const total_year = budget_list//
        .map( (item : Budget) => budgetPerYear(item.operations) )//
        .reduce( (current : number, previous : number) => current + previous, 0 );
      
      return (
        
        <SafeAreaView style={scroll_styles.container}>
          <ScrollView style={scroll_styles.scrollView}>
            
              
              {budget_items}
    
              <Section>
                <SectionContent>
                  <Text>Total Année : {total_year.toFixed(2)} €</Text>
                  <Text>Prévisions mois : {(total_year/12).toFixed(2)} €</Text>
                </SectionContent>
              </Section>
    
              <Button text="Add"></Button>
    
            
          </ScrollView>
          </SafeAreaView>
      );
}
