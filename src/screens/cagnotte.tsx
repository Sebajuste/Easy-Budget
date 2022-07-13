import { ScrollView, View } from "react-native";
import { Layout, Text } from "react-native-rapi-ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { loadBudgetList } from "../services/budget";
import { scroll_styles } from "../styles";


export default function CagnotteScreen() {

  const budget_list = loadBudgetList();

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
