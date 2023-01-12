import { AsyncStorage } from "react-native";
import { SettingsDao, Settings, DEFAULT_SETTINGS } from "../settings";

export class SettingsDaoStorage implements SettingsDao {

    async load() : Promise<Settings> {
        const json = await AsyncStorage.getItem('settings');
        if( json ) {
            return JSON.parse(json);
        }
        return DEFAULT_SETTINGS;
    }

    async save(settings : Settings) : Promise<void> {

        await AsyncStorage.setItem('settings', JSON.stringify(settings) );

    }

}
