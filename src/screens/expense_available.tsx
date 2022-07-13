import { ScrollView, View } from "react-native";
import { Layout, Section, SectionContent, Text, TopNav } from "react-native-rapi-ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { loadBudgetList } from "../services/budget";
import { scroll_styles, styles } from "../styles";


function typeToValue(type : string) : number {
  if( type == 'month') return 0;
  if( type == 'trimester') return 1;
  if( type == 'semester') return 2;
  if( type == 'year') return 3;
  return -1;
}

function compareType(typeA : any, typeB : any) : number {
  return typeToValue(typeA) - typeToValue(typeB);
}

export default function ExpenseAvailableScreen() {
    
  const budget_list = loadBudgetList();
  
  const perMonth = function(budget : any) {
    switch(budget.type) {
      case 'month':
        return budget.value;
      case 'trimester':
        return budget.value / 3;
      case 'semester':
          return budget.value / 6;
      case 'year':
        return budget.value / 12;
    }
  };


  const expenses_items = budget_list.map((budget, budget_index) => {

    const budget_available = budget.operations.map((item) => perMonth(item)).reduce((previous, current) => previous + current, 0);

    let new_reserve = budget.reserve + budget_available;
  
    const items = budget.operations.map((item) => {
      return {
        name: item.name,
        value: perMonth(item),
        total: item.value,
        type: item.type
      };
    })//
    .sort( (a, b ) => compareType(a.type, b.type))//
    .map( (item, index) => {
      const text_item = (<Text key={index} style={ new_reserve >= item.total ? styles.expense_valid : styles.expense_invalid} >{item.name} : {item.total} €</Text>);
      if( new_reserve >= item.total ) {
        new_reserve = new_reserve - item.total; 
      }
      return text_item;
    });

    return (
      <Section key={budget_index}>
        <TopNav middleContent={budget.name} />
        <SectionContent>
          {items}
          <Text>Reste : {new_reserve.toFixed(2)} €</Text>
        </SectionContent>
      </Section>
    );


  });

  


  return (
    <SafeAreaView style={scroll_styles.container}>
      <ScrollView style={scroll_styles.scrollView}>
        <Layout>
      
          {expenses_items}
        </Layout>
      </ScrollView>
    </SafeAreaView>
  );

}
