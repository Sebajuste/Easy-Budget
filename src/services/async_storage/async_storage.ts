import { AsyncStorage } from "react-native";
import { DEFAULT_SETTINGS } from "../settings";



export async function clearAsyncStorageDB() {
    await AsyncStorage.setItem('accounts', JSON.stringify([]));
    // await AsyncStorage.setItem('budget', JSON.stringify(DEFAULT_BUDGET));
    await AsyncStorage.setItem('transactions', JSON.stringify([]));
    await AsyncStorage.setItem('envelope_categories', JSON.stringify([]));
    await AsyncStorage.setItem('envelopes', JSON.stringify([]));
    await AsyncStorage.setItem('settings', JSON.stringify(DEFAULT_SETTINGS));
}