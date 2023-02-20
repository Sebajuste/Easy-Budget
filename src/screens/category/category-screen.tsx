import { StackActions } from "@react-navigation/native";
import _ from "lodash";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Layout, Text, TextInput } from "react-native-rapi-ui";
import { Category, CategoryDao } from "../../services/category";
import { Envelope, EnvelopeDao } from "../../services/envelope";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import { ColorPicker } from "react-native-color-picker";
import { fromHsv, toHsv } from "react-native-color-picker/dist/utils";
import ErrorMessage from "../../components/error-message";


export default function CategoryScreen({navigation, route} : {navigation : any, route : any}) {

    const category : Category | undefined = route.params?.category;

    const [error, setError] = useState<null|any>(null);

    const [name, setName] = useState( category ? category.name : '');

    const [colorHSV, setColorHSV] = useState( category ? toHsv(category?.color || 'blue') : toHsv('blue') );

    const [hasEnvelope, setHasEnvelope] = useState(false);

    const categoryDao = DAOFactory.getDAO<Category>(CategoryDao, DATABASE_TYPE); // getDao<CategoryDao>(CategoryDao, Database.ASYNC_STORAGE);
    const envelopeDao = DAOFactory.getDAO<Envelope>(EnvelopeDao, DATABASE_TYPE);// getDao<EnvelopeDao>(EnvelopeDao, Database.ASYNC_STORAGE);

    useEffect(() => {

        envelopeDao.load()//
            .then(envelopes => _.filter(envelopes, envelope => category && envelope.category_id == category._id))//
            .then(envelopes => envelopes.length > 0)//
            .then(setHasEnvelope);

    }, []);

    const saveHandler = async () => {
        
        setError(null);

        if( category ) {

            category.name = name;
            category.color = fromHsv(colorHSV);

            categoryDao.update(category).then(v => {
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            }).catch(err => {
                console.error(err);
                setError(err);
            });

        } else {

            const newCategory = {
                name: name,
                color: fromHsv(colorHSV)
            } as Category;

            categoryDao.add(newCategory).then(v => {
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            }).catch(err => {
                console.error(err);
                setError(err);
            });

        }

    };

    const deleteHandler = () => {

        if( category) {
            categoryDao.remove(category).then(v => {
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            }).catch(console.error);
        }
    };

    const deleteDisabled = hasEnvelope;

    return (
        <Layout style={{margin: 10}}>

            <ErrorMessage error={error} />

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
                { category ? <Button style={{margin: 5, flexGrow: 1}} status="danger" text="DELETE" disabled={deleteDisabled} onPress={deleteHandler}></Button> : <></> }
                <Button style={{margin: 5, flexGrow: 1}} status="primary" text="SAVE" disabled={name.trim().length == 0} onPress={saveHandler}></Button>
            </View>
        </Layout>
    );

}