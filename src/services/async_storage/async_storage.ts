import { AsyncStorage } from "react-native";



export async function clearAsyncStorageDB() {
    await AsyncStorage.setItem('accounts', JSON.stringify([]));
    // await AsyncStorage.setItem('budget', JSON.stringify(DEFAULT_BUDGET));
    await AsyncStorage.setItem('transactions', JSON.stringify([]));
    await AsyncStorage.setItem('envelope_categories', JSON.stringify([]));
    await AsyncStorage.setItem('envelopes', JSON.stringify([]));
}