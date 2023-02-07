import { StackActions } from "@react-navigation/native";
import _ from "lodash";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Layout, Picker, Text, TextInput } from "react-native-rapi-ui";
import { Envelope, EnvelopeCategory, EnvelopeCategoryDao, EnvelopeDao } from "../../services/envelope";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import { ColorPicker } from "react-native-color-picker";
import { fromHsv, toHsv } from "react-native-color-picker/dist/utils";


const icon_picker_items = [
    { label: 'aa', value : 'a' },
    { label: 'bb', value : "bb" },
    { label: 'cc', value : 'cc' },
    { label: 'dd', value : 'dd' },
];

export default function CategoryScreen({navigation, route} : {navigation : any, route : any}) {

    const envelopeCategory : EnvelopeCategory = route.params?.envelopeCategory;

    const [name, setName] = useState( envelopeCategory ? envelopeCategory.name : '');

    const [colorHSV, setColorHSV] = useState( envelopeCategory ? toHsv(envelopeCategory?.color || 'blue') : toHsv('blue') );

    const [hasEnvelope, setHasEnvelope] = useState(false);

    const categoryDao = DAOFactory.getDAO(EnvelopeCategoryDao, DATABASE_TYPE); // getDao<EnvelopeCategoryDao>(EnvelopeCategoryDao, Database.ASYNC_STORAGE);
    const envelopeDao = DAOFactory.getDAO(EnvelopeDao, DATABASE_TYPE);// getDao<EnvelopeDao>(EnvelopeDao, Database.ASYNC_STORAGE);

    useEffect(() => {

        envelopeDao?.load()//
            .then(envelopes => _.filter(envelopes, envelope => envelope.category_id == envelopeCategory._id))//
            .then(envelopes => envelopes.length > 0)//
            .then(setHasEnvelope);

    }, []);

    const saveHandler = async () => {

        if( envelopeCategory ) {

            envelopeCategory.name = name;
            envelopeCategory.color = fromHsv(colorHSV);

            categoryDao.update(envelopeCategory).then(v => {
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            });

        } else {

            const newEnvelopeCategory = {
                name: name,
                color: fromHsv(colorHSV)
            } as EnvelopeCategory;

            categoryDao.add(newEnvelopeCategory).then(v => {
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            });

        }

    };

    const deleteHandler = () => {

        categoryDao?.remove(envelopeCategory).then(v => {
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
        });

    };

    const deleteDisabled = hasEnvelope;

    return (
        <Layout style={{margin: 10}}>

            <View style={{margin: 2}}>
                <Text style={{ marginBottom: 10 }}>Category name</Text>
                <TextInput
                    placeholder="Enter the category name"
                    value={name}
                    onChangeText={(val) => setName(val)}
                />
            </View>

            <View style={{margin: 2}}>
                <Text style={{ marginBottom: 10 }}>Color</Text>
                <View style={{margin: 2, minHeight: 200}}>
                    <ColorPicker color={colorHSV} onColorChange={setColorHSV} style={{flex: 1}} hideSliders={true} />
                </View>
            </View>

            <View style={{ flexDirection: 'row'}}>
                { envelopeCategory ? <Button style={{margin: 5, flexGrow: 1}} status="danger" text="DELETE" disabled={deleteDisabled} onPress={deleteHandler}></Button> : <></> }
                <Button style={{margin: 5, flexGrow: 1}} status="primary" text="SAVE" onPress={saveHandler}></Button>
            </View>
        </Layout>
    );

}