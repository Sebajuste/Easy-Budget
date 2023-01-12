import { StackActions } from "@react-navigation/native";
import _ from "lodash";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Layout, Text, TextInput } from "react-native-rapi-ui";
import { EnvelopeCategory } from "../../services/envelope";
import uuid from 'react-native-uuid';
import { EnvelopeCategoryDaoStorage, EnvelopeDaoStorage } from "../../services/async_storage/envelope-async-storage";

export default function CreateCategoryScreen({navigation, route} : {navigation : any, route : any}) {

    const envelopeCategory : EnvelopeCategory = route.params?.envelopeCategory;

    const [name, setName] = useState( envelopeCategory ? envelopeCategory.name : '');

    const [hasEnvelope, setHasEnvelope] = useState(false);

    const categoryDao = new EnvelopeCategoryDaoStorage();
    const envelopeDao = new EnvelopeDaoStorage();

    useEffect(() => {

        envelopeDao.load()//
            .then(envelopes => _.filter(envelopes, envelope => envelope.category_id == envelopeCategory._id))//
            .then(envelopes => envelopes.length > 0)//
            .then(setHasEnvelope);

    }, []);

    const saveHandler = async () => {

        if( envelopeCategory ) {

            categoryDao.load().then(categories => {

                const cat = _.find(categories, cat => cat._id == envelopeCategory._id );
                if( cat ) {
                    cat.name = name;
                }
                return categoryDao.save(categories);
            }).then(v => {
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            });

        } else {

            const newEnvelopeCategory = {
                _id: uuid.v4(),
                name: name,
                envelopes: []
            } as EnvelopeCategory;

            categoryDao.add(newEnvelopeCategory).then(v => {
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            });

        }

    };

    const deleteHandler = () => {

        categoryDao.remove(envelopeCategory).then(v => {
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
        });

    };

    const deleteDisabled = hasEnvelope;

    return (
        <Layout style={{margin: 10}}>

            <Text style={{ marginBottom: 10 }}>Category name</Text>
            <TextInput
                placeholder="Enter the category name"
                value={name}
                onChangeText={(val) => setName(val)}
            />

            <View style={{ flexDirection: 'row'}}>
                { envelopeCategory ? <Button style={{margin: 5, flexGrow: 1}} status="danger" text="DELETE" disabled={deleteDisabled} onPress={deleteHandler}></Button> : <></> }
                <Button style={{margin: 5, flexGrow: 1}} status="primary" text="SAVE" onPress={saveHandler}></Button>
            </View>
        </Layout>
    );

}