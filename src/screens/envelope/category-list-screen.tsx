import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { Button, Text } from "react-native-rapi-ui";
import * as Animatable from 'react-native-animatable'

import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import { EnvelopeCategory, EnvelopeCategoryDao } from "../../services/envelope";
import { useIsFocused } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";



function CategoryItem({category, index, navigation} : {category: EnvelopeCategory, index: number, navigation: any}) {

    const selectHandler = () => {
        navigation.navigate({name: 'EditCategory', params: {category: category} });
    };

    return (
        <Animatable.View
            animation={"zoomInRight"}
            duration={1000}
            delay={index * 150}
        >
            <TouchableOpacity style={styles.item} onPress={selectHandler}>
                <View style={{ ...styles.avatar, backgroundColor: category.color}}>
                    <View />
                </View>
                <View style={styles.details}>
                    <Text style={styles.name}>{category.name}</Text>
                </View>
            </TouchableOpacity>
        </Animatable.View>
    );
}


export function CategoryListScreen({navigation} : any) {

    const viewRef = useRef(null);

    const [loading, setLoading] = useState(false);

    const [ categories, setCategories] = useState<EnvelopeCategory[]>([]);

    const isFocused = useIsFocused();

    const categoryDao = DAOFactory.getDAO(EnvelopeCategoryDao, DATABASE_TYPE);

    const itemSeparatorHandler = () => (<View style={styles.seperator} />);

    const renderItemHandler = ({item, index} : {item: EnvelopeCategory, index: number}) => {

        return (<CategoryItem category={item} index={index} navigation={navigation} />);
    };

    const addCategoryHandler = () => {
        navigation.navigate('CreateCategory');
    };

    useEffect(() => {
        setLoading(true);
        categoryDao.load().then(setCategories).catch(console.error).finally(() => { setLoading(false); });

        const unsubscribe = navigation.addListener('focus', () => {
            viewRef.current.animate({ 0: { opacity: 0.5, }, 1: { opacity: 1 } });
        });
        // ToastAndroid.show(animation+ ' Animation', ToastAndroid.SHORT);
        return () => unsubscribe;

    }, [navigation, isFocused]);

    if( loading ) {
        return (
            <Text>Loading...</Text>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Animatable.View
                ref={viewRef}
                easing={'ease-in-out'}
                duration={500}
                style={styles.container}
            >
                <FlatList
                    data={categories}
                    keyExtractor={(category, i) => `${category._id}` }
                    renderItem={renderItemHandler}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={itemSeparatorHandler}
                />
                <View style={styles.footer}>
                    <Button text="ADD" onPress={addCategoryHandler} />
                </View>
            </Animatable.View>
        </SafeAreaView>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    seperator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'gray',
    },
    item: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    avatar: {
        height: 36,
        width: 36,
        borderRadius: 18,
        backgroundColor: 'red',
        alignItems: 'center',
        justifyContent: 'center',
    },
    details: {
        margin: 8,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
        color: 'black',
    },
    footer: {
        margin: 10
    }
});