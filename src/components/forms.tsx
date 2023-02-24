import { View } from "react-native";


export function ResponsiveContent({children, style} : {children: any, style?:any}) {

    console.log('children: ', Array.isArray(children) )

    

    return (
        <View style={style}>
            {children}
        </View>
    );

}
