import { ScrollView, View } from "react-native";
import { Layout, Section, SectionContent, Text, TopNav } from "react-native-rapi-ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { Budget, BudgetOperation, BudgetOperationType, loadBudget } from "../services/budget";
import { scroll_styles, styles } from "../styles";


function typeToValue(type : BudgetOperationType) : number {
  if( type == BudgetOperationType.MONTH) return 0;
  if( type == BudgetOperationType.TRIMESTER) return 1;
  if( type == BudgetOperationType.SEMESTER) return 2;
  if( type == BudgetOperationType.YEAR) return 3;
  return -1;
}

function compareType(typeA : BudgetOperationType, typeB : BudgetOperationType) : number {
  return typeToValue(typeA) - typeToValue(typeB);
}

export default function ExpenseAvailableScreen() {
    
  const budget : Budget = loadBudget();
  
  const perMonth = function(budgetOperation : BudgetOperation) {
    switch(budgetOperation.type) {
      case BudgetOperationType.MONTH:
        return budgetOperation.value;
      case BudgetOperationType.TRIMESTER:
        return budgetOperation.value / 3;
      case BudgetOperationType.SEMESTER:
          return budgetOperation.value / 6;
      case BudgetOperationType.YEAR:
        return budgetOperation.value / 12;
    }
  };


  const expenses_items = budget.categories.map((budget, budget_index) => {

    const budget_available = budget.operations.map((item) => perMonth(item)).reduce((previous, current) => previous + current, 0);

    let new_reserve = budget.funds + budget_available;
  
    const items = budget.operations.map((operation : BudgetOperation) => {
      return {
        name: operation.name,
        value: perMonth(operation),
        total: operation.value,
        type: operation.type
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
