import { ScrollView, View } from "react-native";
import { Button, Layout, Section, SectionContent, Text, TopNav } from "react-native-rapi-ui";

import { SafeAreaView } from "react-native-safe-area-context";
import { budgetPerYear, loadBudgetList } from "../services/budget";
import { scroll_styles } from "../styles";

function BudgetSection({title, budget} : {title: string, budget : any}) {

    const total_year = budgetPerYear(budget);
  
    const section_items = budget ? budget.map((item : any, index : number) => {
      return (<Text key={index}>{item.name} : {item.value} € / {item.type} </Text>);
    }) : (<></>);
  
    return (
      <>
        <TopNav middleContent={title} />
  
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

export default function BudgetScreen() {

    const budget_list = loadBudgetList();

    const budget_items = budget_list.map((item, index) => {
        return (<BudgetSection key={index} title={item.name} budget={item.operations}></BudgetSection>);
      });
    
    
      const total_year = budget_list//
        .map( (item) => budgetPerYear(item.operations) )//
        .reduce( (current, previous) => current + previous, 0 );
      
      return (
        
        <SafeAreaView style={scroll_styles.container}>
          <ScrollView style={scroll_styles.scrollView}>
            <Layout>
              
              {budget_items}
    
              <Section>
                <SectionContent>
                  <Text>Total Année : {total_year.toFixed(2)} €</Text>
                  <Text>Prévisions mois : {(total_year/12).toFixed(2)} €</Text>
                </SectionContent>
              </Section>
    
              <Button text="Add"></Button>
    
            </Layout>
          </ScrollView>
          </SafeAreaView>
      );
}
