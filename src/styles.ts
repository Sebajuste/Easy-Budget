import { StyleSheet } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { verticalScale } from "./util/ui-metrics";


export const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    screen: {
      paddingBottom: 16
    },
    expense_valid: {
      color: 'green'
    },
    expense_invalid: {
      color: 'red'
    },
    loadingScreen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
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

export const styles_form = StyleSheet.create({
  container: {
      flex: 1
  },
  row: {
      flexDirection: 'row',
      minHeight: verticalScale(100),
      // height: verticalScale(120)
  },
  group: {
    flex: 1,
    margin: 2
  }
});