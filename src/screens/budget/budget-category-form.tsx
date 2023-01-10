import { StackActions } from "@react-navigation/native";
import _, { uniqueId } from "lodash";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Layout, Text, TextInput } from "react-native-rapi-ui";
import { EnvelopeCategory } from "../../services/budget";
import uuid from 'react-native-uuid';
import { EnvelopeCategoryDaoStorage } from "../../services/async_storage/budget_async_storage";

export default function CreateCategoryScreen({navigation, route} : {navigation : any, route : any}) {

    const envelopeCategory : EnvelopeCategory = route.params?.envelopeCategory;

    const [name, setName] = useState( envelopeCategory ? envelopeCategory.name : '');

    // const [budget, setBudget] = useBudget( );
    // const budgetDao = new BudgetDaoStorage();

    const categoryDao = new EnvelopeCategoryDaoStorage();

    const saveHandler = async () => {

        if( envelopeCategory ) {

            console.log('update category');

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

            /*
            budgetDao.get().then(budget => {
                if( budget ) {
                    const cat = budget.categories.filter(cat => cat._id == envelopeCategory._id && cat.name == envelopeCategory.name)[0];
                    cat.name = name;
                    budgetDao.save(budget).then(v => {
                        const popAction = StackActions.pop(1);
                        navigation.dispatch(popAction);
                    });
                }
            });
            */
            
        } else {

            console.log('add category');

            const newEnvelopeCategory = {
                _id: uuid.v4(),
                name: name,
                envelopes: []
            } as EnvelopeCategory;

            categoryDao.add(newEnvelopeCategory).then(v => {
                const popAction = StackActions.pop(1);
                navigation.dispatch(popAction);
            });

            /*
            budgetDao.get().then(budget => {
                if( budget ) {
                    budget.categories.push(newEnvelopeCategory);
                    budgetDao.save(budget).then(v => {
                        const popAction = StackActions.pop(1);
                        navigation.dispatch(popAction);
                    });
                }
            });
            */
        }

    };

    const deleteHandler = () => {

        categoryDao.remove(envelopeCategory).then(v => {
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
        });

        /*
        budgetDao.get().then(budget => {
            if( budget ) {
                const index = budget.categories.findIndex( cat => cat._id == envelopeCategory._id && cat.name == envelopeCategory.name);
                budget.categories.splice(index, 1);
                budgetDao.save(budget).then(v => {
                    const popAction = StackActions.pop(1);
                    navigation.dispatch(popAction);
                });
            }

        });
        */

    };


    return (
        <Layout style={{margin: 10}}>

            <Text style={{ marginBottom: 10 }}>Category name</Text>
            <TextInput
                placeholder="Enter the category name"
                value={name}
                onChangeText={(val) => setName(val)}
            />

            <View style={{ flexDirection: 'row'}}>
                { envelopeCategory ? <Button style={{margin: 5, flexGrow: 1}} status="danger" text="DELETE" onPress={deleteHandler}></Button> : <></> }
                <Button style={{margin: 5, flexGrow: 1}} status="primary" text="SAVE" onPress={saveHandler}></Button>
            </View>
        </Layout>
    );

}