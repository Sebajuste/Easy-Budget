import { Text, View } from "react-native";


export default function ErrorMessage({error} : {error : any}) {

    if( error != null ) {
        return (
            <View style={{margin: 2}}>
                <Text style={{ marginBottom: 10, padding: 10, borderWidth: 1, borderColor: 'red', color: 'red', fontWeight: 'bold', borderRadius: 5 }}>{ error.toString() }</Text>
            </View>
        );
    }

    return null;
}