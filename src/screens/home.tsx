import { View } from "react-native";
import { Button, Text } from "react-native-rapi-ui";
import { clearAsyncStorageDB } from "../services/async_storage/async_storage";


export default function HomeScreen() {

    const clearDatabaseHandler = () => {
        clearAsyncStorageDB();
    };

    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Home</Text>
        <Button text="Clear Database" onPress={clearDatabaseHandler}></Button>
      </View>
    );
  }