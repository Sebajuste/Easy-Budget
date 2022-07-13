import { StyleSheet } from "react-native";
import { StatusBar } from 'expo-status-bar';


export const styles = StyleSheet.create({
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
  
export const scroll_styles = StyleSheet.create({
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