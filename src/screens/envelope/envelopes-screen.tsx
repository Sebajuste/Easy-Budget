import { Dimensions, FlatList, ScrollView, SectionList, StyleSheet, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { Button, Section, SectionContent, Text, TopNav } from "react-native-rapi-ui";
import * as Animatable from 'react-native-animatable'

import { SafeAreaView } from "react-native-safe-area-context";
import { Envelope, periodToString, budgetPerYear, EnvelopeDao } from "../../services/envelope";
import { Category, CategoryDao } from "../../services/category";
import { container_state_styles, scroll_styles } from "../../styles";

import Icon from 'react-native-vector-icons/FontAwesome';
import { useEffect, useRef, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import _ from "lodash";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import { RevenueDao } from "../../services/revenue";
import { Colors } from "react-native/Libraries/NewAppScreen";


function EnvelopeListItem(props : any) {

  const { envelope, category, navigation, index } = props;

  const selectHandler = () => {
    navigation.navigate({name: 'FillEnvelope', params: {envelope: envelope, envelopeCategory: category}});
  };

  const dueDate = envelope.dueDate ? ( typeof envelope.dueDate === 'string' ? (new Date(envelope.dueDate).toDateString() ) : envelope.dueDate.toDateString()) : '';

  return (
    <Animatable.View animation={"flipInY"} duration={1000} delay={index*300} >
    <TouchableOpacity style={styles.listItem} onPress={selectHandler}>
      <View style={{...styles.image, backgroundColor: 'silver', padding: 10}}>
        
        <View style={{flex: 1, flexDirection: 'column'}}>
          <Text style={{alignItems: 'center', color: category.color, fontSize: 30, textAlign: 'center'}}> {envelope.funds.toFixed(2)}€</Text>
          <Text style={{textAlign: 'center'}}>{envelope.funds > envelope.amount ? envelope.funds : envelope.amount}€</Text>
        </View>
        <Text style={{fontSize: 12}}>{dueDate}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={{ flex: 1, ...styles.name}}>{envelope.name}</Text>
        <View style={{borderWidth: 1, borderColor: 'green', borderRadius: 100, padding: 5, left: 10}}>
          <Icon style={{fontSize: 12, color: 'green'}} name="check" />
        </View>
      </View>
    </TouchableOpacity>
    </Animatable.View>
  );

}


const styles = StyleSheet.create({
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
  },
  listItem: {
    minHeight: 200,
    width: Dimensions.get('window').width / 2 - 30,
    backgroundColor: 'white',
    margin: 8,
    borderRadius: 10,
  },
  listEmpty: {
    // height: Dimensions.get('window').height,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: 150,
    margin: 5,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});


function BudgetState({envelopes, totalRevenue} : {envelopes: Envelope[], totalRevenue: number}) {

  const total_year = budgetPerYear(envelopes);

  const monthBudget = total_year/12;

  const budgetStyle = totalRevenue >= monthBudget ? container_state_styles.success : container_state_styles.danger;

  return (
    <View style={{flexDirection: 'row', justifyContent: 'space-around', margin: 5, borderRadius: 10, backgroundColor: 'white'}}>

      <View style={{margin: 5, padding: 5, borderRadius: 10, ...budgetStyle}}>
        <Text style={{textAlign: 'center'}}>{monthBudget.toFixed(2)} €</Text>
        <Text style={{fontSize: 12}}>Month budget</Text>

      </View>

      <View style={{margin: 5, padding: 5, borderRadius: 10}}>
        <Text>{totalRevenue.toFixed(2)} €</Text>
        <Text style={{fontSize: 12}}>Revenues</Text>
      </View>

      <View style={{margin: 5, padding: 5, borderRadius: 10}}>
        <Text>{total_year.toFixed(2)} €</Text>
        <Text style={{fontSize: 12}}>Year budget</Text>
      </View>

    </View>
  );

}


export default function EnvelopesScreen({navigation, onChange} : {navigation : any, onChange?: (categories: Category[]) => void}) {

    const viewRef = useRef(null);

    const [loading, setLoading] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);

    const [envelopes, setEnvelopes] = useState<Envelope[]>([]);

    const [totalRevenue, setTotalRevenue] = useState(0);

    const isFocused = useIsFocused();

    const categoriesDao = DAOFactory.getDAO(CategoryDao, DATABASE_TYPE);
    const envelopeDao = DAOFactory.getDAO(EnvelopeDao, DATABASE_TYPE);
    const revenueDao = DAOFactory.getDAO(RevenueDao, DATABASE_TYPE);

    const createEnvelopeHandler = () => {
      navigation.navigate('CreateEnvelope');
    };

    useEffect(() => {
      setLoading(true);
      Promise.all([categoriesDao.load(), envelopeDao.load(), revenueDao.load()]).then( ([categories, envelopes, revenues]) => {
        setCategories(categories);
        setEnvelopes(envelopes);
        setTotalRevenue( _.sum( _.map(revenues, revenue => revenue.amount) ) );
        if( onChange ) onChange(categories);
      }).catch(err => {
        console.error(err);
      }).finally(() => {
        setLoading(false);
      });

      const unsubscribe = navigation.addListener('focus', () => {
        if( viewRef != null && viewRef.current != null ) {
          // viewRef.current.animate({ 0: { opacity: 0.5, }, 1: { opacity: 1 } });
        }
      });
      return () => unsubscribe;

    }, [navigation, isFocused])

    if( loading ) {
      <SafeAreaView style={scroll_styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    }
    
    const envelopes_group = _.groupBy(envelopes, 'category_id');

    const editCategoryHandler = (category: Category) => {
      navigation.navigate({name: 'EditCategory', params: {category: category} });
    };
        
    const addEnvelopHandler = (category: Category) => {
      navigation.navigate({name: 'CreateEnvelope', params: {category: category} });
    };

    const renderItemHandler = ({item, index} : {item: Envelope, index: number}) => {
      const category = _.find(categories, {'_id': item.category_id});
      return <EnvelopeListItem envelope={item} category={category} navigation={navigation} index={index} />;
    };

    const renderSectionHandler = ({item, section} : any) => {

      return (
        <FlatList data={item} renderItem={renderItemHandler} numColumns={2} />
      );

    };

    const renderHeaderHandler = ({section}: any) => {
      const category = {_id: section._id, name: section.name, color: section.color} as Category;
      return <TopNav
              style={{backgroundColor: category.color }}
              middleContent={section.name}
              leftContent={<Icon name="edit" size={20} />}
              leftAction={() => editCategoryHandler(category)}
              rightContent={ <><Icon name="plus" size={20} /></> }
              rightAction={() => addEnvelopHandler(category)}
            />;
    };

    const renderFooterHandler = ({section} : any) => {
 
      const total_year = budgetPerYear(section.data[0]);

      return (
        <Section>
          <SectionContent style={{backgroundColor: 'inherit'}}>
            <View style={{flexDirection: 'row'}}>
              <Text style={{flex: 2}}>Cost per year : </Text>
              <Text style={{textAlign: 'right'}}> {total_year.toFixed(2)} €</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={{flex: 2}}>Cost per month : </Text>
              <Text style={{textAlign: 'right'}}>{(total_year/12).toFixed(2)} €</Text>
            </View>
          </SectionContent>
        </Section>
      );
    };

    const data = _.transform(envelopes_group, (result, value, key) => {
      const category = _.find(categories, {"_id": _.parseInt(key) });
      return result.push( _.assign({"data": [value]}, category) ); // {"title": category.name, "color": category.color, "data": value}
    }, [])

    const emptyComponent = (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', margin: 20, }}>
        <Button text="Create First envelope" onPress={createEnvelopeHandler} />
      </View>
    );

    return (
        
        <SafeAreaView style={scroll_styles.container}>

            <Animatable.View
                ref={viewRef}
                easing={'ease-in-out'}
                duration={500}
                style={{flex: 1}}
            >
              <SectionList
                sections={data}
                keyExtractor={(item, index) => item + index}
                renderItem={renderSectionHandler}
                renderSectionHeader={renderHeaderHandler}
                renderSectionFooter={renderFooterHandler}
                ListFooterComponent={ <BudgetState envelopes={envelopes} totalRevenue={totalRevenue} /> }
                ListEmptyComponent={ emptyComponent }
              />
            </Animatable.View>
            
        </SafeAreaView>
    );
}
