import { Alert, ScrollView } from "react-native";
import { Button, Section, SectionContent, Text, TopNav } from "react-native-rapi-ui";

import { SafeAreaView } from "react-native-safe-area-context";
import { Budget, BudgetCategory, BudgetOperation, budgetOperationTypeToString, budgetPerYear, loadBudget, subscribeBudget, useBudget } from "../../services/budget";
import { scroll_styles } from "../../styles";

import Icon from 'react-native-vector-icons/FontAwesome';
import { useEffect, useState } from "react";


function BudgetSection({navigation, title, budgetCategory} : {navigation : any, title: string, budgetCategory : BudgetCategory}) {

    const operations = budgetCategory.operations;

    const total_year = budgetPerYear(operations);
  
    const section_items = operations ? operations.map((operation : BudgetOperation, index : number) => {
      return (<Text key={index}>{operation.name} : {operation.value} € / { budgetOperationTypeToString(operation.type)}</Text>);
    }) : (<></>);
  

    const editAction = () => {
      navigation.navigate({name: 'EditBudget', params: {budgetCategory: budgetCategory}});
    };

    
    return (
      <>
        <TopNav middleContent={title} rightContent={ <Icon name="edit" size={20} /> } rightAction={editAction} />
  
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

export default function BudgetScreen({navigation} : {navigation : any}) {

    // const [budget, setBudget] = useBudget();

    // let budget = loadBudget();


    const [budget, setBudget] = useState( {categories: []} ) ;

    const [refreshCount, setRefreshCount] = useState(0);

    // const budget = loadBudget();


    const [categories, setCategories] = useState([]);


    useEffect(() => {

      

      return navigation.addListener('focus', () => {
        // const new_budget = loadBudget();
        // Alert.alert('Refreshed');
        // console.log('BudgetScreen Refreshed ', new_budget.categories[0]);

        setRefreshCount( old => old + 1);
        // setBudget( old => loadBudget() );
      });

    }, [navigation, budget]);


    // const categories : Array<BudgetCategory> = [];

    const budget_section_items = categories.map((item : BudgetCategory, index : number) => {
      return (<BudgetSection key={index} title={item.name} budgetCategory={item} navigation={navigation}></BudgetSection>);
    });
      
    const total_year = categories//
      .map( (item : BudgetCategory) => budgetPerYear(item.operations) )//
      .reduce( (current : number, previous : number) => current + previous, 0 );
      
    return (
        
        <SafeAreaView style={scroll_styles.container}>
          <ScrollView style={scroll_styles.scrollView}>
            
              {budget_section_items}
    
              <Section>
                <SectionContent>
                  <Text>Total Année : {total_year.toFixed(2)} €</Text>
                  <Text>Prévisions mois : {(total_year/12).toFixed(2)} €</Text>
                </SectionContent>
              </Section>
    
              <Button text="Add" onPress={() => navigation.navigate('AddBudget')}></Button>
    
          </ScrollView>
          </SafeAreaView>
    );
}
