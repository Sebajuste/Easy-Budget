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
      marginHorizontal: 0,
    },
    text: {
      fontSize: 42,
    },
});

export const container_state_styles = StyleSheet.create({
  danger: {
    backgroundColor: '#cc261b'
  },
  info: {
    backgroundColor: 'cyan'
  },
  success: {
    backgroundColor: '#57a140'
  }
});

export const text_state_styles = StyleSheet.create({
  danger: {
    color: 'red'
  },
  info: {
    color: 'cyan'
  },
  success: {
    color: '#57a140'
  }
});