import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native'; // I18nManager as RNI18nManager

import Router from './src/router';
import i18n from './src/services/i18n';
import { LanguageProvider } from './src/services/i18n/language-provider';


function test() {
  const RNDir = RNI18nManager.isRTL ? 'RTL' : 'LTR';
        // RN doesn't always correctly identify native
        // locale direction, so we force it here.
        if (i18n.dir !== RNDir) {
            const isLocaleRTL = i18n.dir === 'RTL';
            RNI18nManager.forceRTL(isLocaleRTL);
            // RN won't set the layout direction if we
            // don't restart the app's JavaScript.
            Updates.reloadFromCache();
        }
}

export default function App() {


  /*
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useState(() => {
    
    i18n.init()
      .then(() => {
        console.log('test')
        test();
        setIsI18nInitialized(true);
      })
      .catch((error) => console.error(error));
    
    setIsI18nInitialized(true);
  }, []);

  if( isI18nInitialized ) {
    return (
        <Router />
    );
  }

  return (
    <View style={styles.loadingScreen}>
        <ActivityIndicator />
    </View>
  );
  */

  return (
    <LanguageProvider>
      <Router />
    </LanguageProvider>
  );

}

const styles = StyleSheet.create({
  loadingScreen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
  }
});