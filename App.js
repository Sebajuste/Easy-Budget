import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView , StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Layout, ThemeProvider } from "react-native-rapi-ui";
import { Button, Section, SectionContent, TopNav } from 'react-native-rapi-ui';

function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home!</Text>
    </View>
  );
}

const bank_budget = [
  {
    "name": "PEL",
    "value": 50,
    "type": "month"
  }, {
    "name": "Livret A",
    "value": 50,
    "type": "month"
  }
];

const home_budget = [
  {
    "name": "Loyer",
    "value": 645.05,
    "type": "month"
  }, {
    "name": "Charges",
    "value": 350,
    "type": "trimester"
  }, {
    "name": "Taxe habitation",
    "value": 735,
    "type": "year"
  }, {
    "name": "Taxe foncière",
    "value": 752,
    "type": "year"
  }, {
    "name": "Assurance hab.",
    "value": 29,
    "type": "month"
  }, {
    "name": "Electricite",
    "value": 62.99,
    "type": "month"
  }
];

const food_budget = [
  {
    "name": "Restaurants",
    "value": 50,
    "type": "month"
  }, {
    "name": "Supermarché",
    "value": 200,
    "type": "month"
  }
  , {
    "name": "Chat",
    "value": 100,
    "type": "trimester"
  }
];

const loisir_budget = [
  {
    "name": "Sorties",
    "value": 50,
    "type": "month"
  }, {
    "name": "Voyages",
    "value": 600,
    "type": "year"
  }, {
    "name": "Cadeaux",
    "value": 25*12,
    "type": "year"
  }, {
    "name": "Cinema",
    "value": 15,
    "type": "month"
  }, {
    "name": "Jeux Vidéos",
    "value": 30,
    "type": "month"
  }, {
    "name": "Décoration",
    "value": 20,
    "type": "month"
  }
];

const shopping_budget = [
  {
    "name": "Vêtement",
    "value": 30,
    "type": "trimester"
  }, {
    "name": "Livres",
    "value": 5*12,
    "type": "year"
  }, {
    "name": "Produits entretiens",
    "value": 20,
    "type": "month"
  }, {
    "name": "Imprévus",
    "value": 30,
    "type": "month"
  }
];

const transport_budget  = [
  {
    "name": "Essence",
    "value": 80,
    "type": "month"
  }, {
    "name": "Assurance",
    "value": 894.28,
    "type": "year"
  }, {
    "name": "Autoroute",
    "value": 15,
    "type": "month"
  }, {
    "name": "Transports",
    "value": 5,
    "type": "month"
  }
];

const health_budget  = [
  {
    "name": "Divers",
    "value": 100,
    "type": "year"
  }
];

const communication_budget = [
  {
    "name": "Internet",
    "value": 38.99,
    "type": "month"
  }, {
    "name": "Licences",
    "value": 15,
    "type": "month"
  }, {
    "name": "Dons",
    "value": 15,
    "type": "month"
  }
];


function budgetPerYear(budgets) {

  if( !budgets ) {
    return 0;
  }

  let result = 0;

  budgets.forEach(item => {
    switch(item.type) {
      case 'month': {
        result += item.value * 12;
        break;
      }
      case 'trimester': {
        result += item.value * 4;
        break;
      }
      case 'year': {
        result += item.value;
        break;
      }
    }
  });

  return result;
}

function typeToValue(type) {
  if( type == 'month') return 0;
  if( type == 'trimester') return 1;
  if( type == 'semester') return 2;
  if( type == 'year') return 3;
}

function compareType(typeA, typeB) {
  return typeToValue(typeA) - typeToValue(typeB);
}


function BudgetSection({budget, title}) {

  const total_year = budgetPerYear(budget);

  const section_items = budget ? budget.map((item, index) => {
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


const budget_list = [
  {
    name: "Banque",
    operations: bank_budget,
    reserve: 0
  }, {
    name: "Logement",
    operations: home_budget,
    reserve: 0
  }, {
    name: "Alimentation",
    operations: food_budget,
    reserve: 0
  }, {
    name: "Loisirs",
    operations: loisir_budget,
    reserve: 0
  }, {
    name: "Achat & Shopping",
    operations: shopping_budget,
    reserve: 0
  }, {
    name: "Transport",
    operations: transport_budget,
    reserve: 0
  }, {
    name: "Santé",
    operations: health_budget,
    reserve: 0
  }, {
    name: "Téléphonie & Abonnements",
    operations: communication_budget,
    reserve: 0
  }
];


function BudgetScreen() {

  const budget_items = budget_list.map((item) => {
    return (<BudgetSection title={item.name} budget={item.operations}></BudgetSection>);
  });


  const total_year = budget_list//
    .map( (item) => budgetPerYear(item.operations) )//
    .reduce( (current, previous) => current + previous, 0 );
  
  return (
    
    <SafeAreaView style={scroll_styles.container}>
      <ScrollView style={scroll_styles.scrollView}>
        <Layout>
          
          {budget_items}

          <BudgetSection title="Scolarité & Enfants"></BudgetSection>

          <Section>
            <SectionContent>
              <Text>Total Année : {total_year.toFixed(2)} €</Text>
              <Text>Prévisions mois : {(total_year/12).toFixed(2)} €</Text>
            </SectionContent>
          </Section>

          <Button title="Add" text="Add"></Button>

        </Layout>
      </ScrollView>
      </SafeAreaView>
  );
}


function CagnotteScreen() {

  const reserve_items = budget_list.map((item, index) => {
    return (<Text key={index}>{item.name} : {item.reserve} €</Text>);
  });

  return (
    <SafeAreaView style={scroll_styles.container}>
      <ScrollView style={scroll_styles.scrollView}>
        <Layout>

          {reserve_items}

        </Layout>
      </ScrollView>
    </SafeAreaView>
  );

}







function ExpenseAvailableScreen() {

  /*
  const budget = {
    name: "Achat & Shopping",
    operations: shopping_budget,
    reserve: 80
  };
  */

  

  const perMonth = function(budget) {
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


const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <ThemeProvider theme="light">
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Budget" component={BudgetScreen} />
          <Tab.Screen name="Cagnottes" component={CagnotteScreen} />
          <Tab.Screen name="Dépenses possibles" component={ExpenseAvailableScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

/*
export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app! :)</Text>
      <StatusBar style="auto" />
    </View>
  );
}
*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  expense_valid: {
    color: 'green'
  },
  expense_invalid: {
    color: 'red'
  }

});

const scroll_styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  scrollView: {
    marginHorizontal: 20,
  },
  text: {
    fontSize: 42,
  },
});