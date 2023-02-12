
import { useState } from 'react';
import { ActivityIndicator, I18nManager as RNI18nManager, StyleSheet, View } from 'react-native';
import Router from './src/router';
import i18n from './src/services/i18n';

export default function App() {

  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useState(() => {
    i18n.init()
      .then(() => {
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
        setIsI18nInitialized(true);
        // this.setState({ isI18nInitialized: true });
      })
      .catch((error) => console.warn(error));
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

}

const styles = StyleSheet.create({
  loadingScreen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
  }
});