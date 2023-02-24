import { Image, View, Text } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import * as Application from 'expo-application';


const package_json = require('../../../package.json')

export default function DrawerContent(props: any) {

    const version = package_json && package_json.version ? package_json.version : '?.?.?';

    // const version = Application.nativeApplicationVersion;

    const build = Application.nativeBuildVersion;
    
    return (
        <View style={{flex: 1}}>
            <View style={{height: 200, alignItems: "center"}} >
                <Image source={ require('../../../assets/icon.png') } style={{flex: 1, height: 200, width: 200, resizeMode: 'cover'}} />
            </View>
            <DrawerContentScrollView>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>
            <View>
                <Text style={{textAlign: "center", padding: 10, fontSize: 12}}>v{version} - {Application.nativeApplicationVersion} ({build})</Text>
            </View>
        </View>
    );
}
