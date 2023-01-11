import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from "react";
import { View } from "react-native";
import { Button, Text } from "react-native-rapi-ui";


export function SelectDateComponent({date, label, onChange, style} : {date : Date, label?: string, onChange : any, style ?: any}) {

    const dateStr = date.toISOString().slice(0,10);// .replace(/-/g,"");

    const [showDatePicker, setShowDatePicker] = useState(false);

    const onDateChange = (event: any, newDate ?: Date) => {
        setShowDatePicker(false);
        if( onChange ) onChange(newDate);
    };

    return (
        <View style={style}>
            <Text style={{ fontSize: 12 }} >{ label }</Text>
            <Text style={{ fontSize: 20, margin: 2, padding: 10, borderWidth: 1, borderRadius: 5, borderColor: '#ccc', backgroundColor: 'white'}} onPress={() => setShowDatePicker(true)}>{dateStr}</Text>
            { showDatePicker ? <DateTimePicker value={date} onChange={onDateChange} /> : <></>}
        </View>
    );

}