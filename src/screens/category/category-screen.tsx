import { StackActions } from "@react-navigation/native";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Layout, Text, TextInput } from "react-native-rapi-ui";
import DropDownPicker from "react-native-dropdown-picker";
import Icon from 'react-native-vector-icons/FontAwesome';

import { Category } from "../../services/category";
import { Envelope } from "../../services/envelope";
import { ColorPicker } from "react-native-color-picker";
import { fromHsv, toHsv } from "react-native-color-picker/dist/utils";
import ErrorMessage from "../../components/error-message";
import { DaoType } from "../../services/dao";
import { t } from "../../services/i18n";
import { styles_form } from "../../styles";
import { DatabaseContext } from "../../services/db-context";
import { DeleteConfirmModal } from "../../components/modal";

const items = [
    { label: 'Option 1', value: 'home', icon: () => <Icon name="home" size={24} color="black" /> },
    { label: 'Option 2', value: 'spoon', icon: () => <Icon name="spoon" size={24} color="black" /> },
    { label: 'Option 3', value: 'beer', icon: () => <Icon name="beer" size={24} color="black" /> },
    { label: 'Option 3', value: 'bank', icon: () => <Icon name="bank" size={24} color="black" /> },
    { label: 'Option 3', value: 'shopping-cart', icon: () => <Icon name="shopping-cart" size={24} color="black" /> },
    { label: 'Option 3', value: 'car', icon: () => <Icon name="car" size={24} color="black" /> },
    { label: 'Option 3', value: 'heart', icon: () => <Icon name="heart" size={24} color="black" /> },
  ];

export default function CategoryScreen({navigation, route} : {navigation : any, route : any}) {

    const category : Category | undefined = route.params?.category;

    const [error, setError] = useState<null|any>(null);

    const [name, setName] = useState( category?.name || '');

    const [colorHSV, setColorHSV] = useState( category ? toHsv(category?.color || 'blue') : toHsv('blue') );

    const [iconSelectorOpened, setIconSelectorOpened] = useState(false);

    const [icon, setIcon] = useState( category?.icon || 'home');

    const [hasEnvelope, setHasEnvelope] = useState(false);

    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const { dbManager } = useContext(DatabaseContext);

    const categoryDao = dbManager.getDAOFromType<Category>(DaoType.CATEGORY);
    const envelopeDao = dbManager.getDAOFromType<Envelope>(DaoType.ENVELOPE);

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
            category.icon = icon;
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
                icon: icon,
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

            <DeleteConfirmModal options={{title: t('title:confirm_delete')}} visible={showConfirmDelete} onCancel={() => setShowConfirmDelete(false)} onConfirm={() => deleteHandler()} />

            <View style={styles_form.container}>

                <View style={styles_form.row}>
                    <View style={styles_form.group}>
                        <Text style={{ marginBottom: 10 }}>{ t('forms:category_name') }</Text>
                        <TextInput
                            placeholder={ t('forms:enter_category_name') }
                            value={name}
                            onChangeText={(val) => setName(val)}
                        />
                    </View>
                </View>

                <View style={styles_form.row}>
                    <View style={styles_form.group}>
                        <Text style={{ marginBottom: 10 }}>Color</Text>
                        <View style={{margin: 2, minHeight: 200}}>
                            <ColorPicker color={colorHSV} onColorChange={setColorHSV} style={{flex: 1}} hideSliders={true} />
                        </View>
                    </View>
                </View>

                <View style={styles_form.row}>
                    <View style={styles_form.group}>
                        <Text style={{ marginBottom: 10 }}>{ t('forms:icon') }</Text>
                        <DropDownPicker
                            open={iconSelectorOpened}
                            setOpen={setIconSelectorOpened}
                            items={items}
                            value={icon}
                            setValue={setIcon}
                            placeholder={ t('forms:select_icon') }
                            containerStyle={{ height: 40 }}
                        />
                    </View>
                </View>
            </View>

            <View style={{ flexDirection: 'row'}}>
                { category ? <Button style={{margin: 5, flexGrow: 1}} status="danger" text={ t('common:delete') } disabled={deleteDisabled} onPress={() => setShowConfirmDelete(true)}></Button> : <></> }
                <Button style={{margin: 5, flexGrow: 1}} status="primary" text={ t('common:save') } disabled={name.trim().length == 0} onPress={saveHandler}></Button>
            </View>
        </Layout>
    );

}