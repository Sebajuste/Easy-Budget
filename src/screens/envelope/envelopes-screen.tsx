import { Dimensions, FlatList, ScrollView, SectionList, StyleSheet, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { Button, Section, SectionContent, Text, TopNav } from "react-native-rapi-ui";
import CircularProgress from 'react-native-circular-progress-indicator';
import * as Animatable from 'react-native-animatable'

import { SafeAreaView } from "react-native-safe-area-context";
import { EnvelopeCategory, Envelope, periodToString, budgetPerYear, EnvelopeCategoryDao, EnvelopeDao } from "../../services/envelope";
import { container_state_styles, scroll_styles } from "../../styles";

import Icon from 'react-native-vector-icons/FontAwesome';
import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import _ from "lodash";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import { RevenueDao } from "../../services/revenue";
import { Colors } from "react-native/Libraries/NewAppScreen";

export const Animations = [
  "fadeIn",
  "fadeInUp",
  "fadeInDown",
  "fadeInDownBig",
  "fadeInUpBig",
  "fadeInLeft",
  "fadeInLeftBig",
  "fadeInRight",
  "fadeInRightBig",

  "flipInX",
  "flipInY",
 
  "slideInDown",
  "slideInUp",
  "slideInLeft",
  "slideInRight",
  
  "zoomIn",
  "zoomInDown",
  "zoomInUp",
  "zoomInLeft",
  "zoomInRight",
]

/*
function EnvelopeLoad({envelope} : {envelope: Envelope}) {

  const funds_percent = envelope.amount > 0 ? (envelope.funds * 100) / envelope.amount : 0;
  const funds_width = `${ Math.min(100, funds_percent) }%`;

  return (
    <View style={{width: '100%', height: 8, marginTop: 2}}>

      <View style={{backgroundColor: '#ccc', width: '100%', height: 5}}>
        <View style={{backgroundColor: 'green', width: funds_width, height: 5}} />
      </View>

    </View>
  );

}
*/

function EnvelopeListItem(props : any) {

  const { envelope, category, navigation, index } = props;

  const selectHandler = () => {
    navigation.navigate({name: 'FillEnvelope', params: {envelope: envelope, envelopeCategory: category}});
  };

  const dueDate = envelope.dueDate ? ( typeof envelope.dueDate === 'string' ? (new Date(envelope.dueDate).toDateString() ) : envelope.dueDate.toDateString()) : '';

/*
<View style={{flex: 2}}>
          <EnvelopeLoad envelope={envelope} />
          <Text style={{fontSize: 12, fontStyle: 'italic'}}>{ periodToString(envelope.period) }</Text>
          <Text> { dueDate } </Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={{textAlign: 'right'}}>{envelope.funds.toFixed(2)} €</Text>
          <Text style={{textAlign: 'right', fontSize: 14}}>{envelope.amount} €</Text>
        </View>
*/

  return (
    <Animatable.View animation={"flipInY"} duration={1000} delay={index*300} >
    <TouchableOpacity style={styles.listItem} onPress={selectHandler}>
      <View style={{...styles.image, backgroundColor: 'grey', padding: 10}}>
        
        <CircularProgress
          value={envelope.funds.toFixed(2)}
          maxValue={envelope.funds > envelope.amount ? envelope.funds : envelope.amount}
          progressValueColor={ category.color }
          titleColor={ category.color }
          activeStrokeColor={ category.color }
          valueSuffix={'€'}
        />
        
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

/*
function ListEmptyComponent() {
  const anim = {
    0: { translateY: 0 },
    0.5: { translateY: 50 },
    1: { translateY: 0 },
  }
  return (
    <View style={[styles.listEmpty]}>
      <Text>Click on the + to add a first envelope</Text>
    </View>
  )
}
*/

/*
function EnvelopComponent({envelope, onSelect, style} : {envelope: Envelope, onSelect?: (envelope: Envelope) => void, style?: any}) {

  const longPressHandler = () => {
    if( onSelect ) {
      onSelect(envelope);
    }
  };

  const dueDate = envelope.dueDate ? ( typeof envelope.dueDate === 'string' ? (new Date(envelope.dueDate).toDateString() ) : envelope.dueDate.toDateString()) : '';

  return (
    <TouchableHighlight onLongPress={longPressHandler} style={style} >
      <View style={{margin: 5, flexDirection: 'row', borderBottomColor: 'grey', borderBottomWidth: 1}}>
        <View style={{flex: 2}}>
          <Text style={{fontSize: 21}}>{envelope.name}</Text>
          <EnvelopeLoad envelope={envelope} />
          <Text style={{fontSize: 12, fontStyle: 'italic'}}>{ periodToString(envelope.period) } { dueDate } </Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={{textAlign: 'right'}}>{envelope.funds.toFixed(2)} €</Text>
          <Text style={{textAlign: 'right', fontSize: 14}}>{envelope.amount} €</Text>
        </View>
      </View>
    </TouchableHighlight>
  );

}
*/

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

/*
function EnvelopeSection({navigation, category, envelopes} : {navigation : any, category : EnvelopeCategory, envelopes: Envelope[]}) {

    const total_year = budgetPerYear(envelopes);

    const selectEnvelopHandler = (envelope: Envelope) => {
      navigation.navigate({name: 'FillEnvelope', params: {envelopeCategory: category, envelope: envelope}});
    };
  
    const section_items = envelopes.map((envelope : Envelope, index : number) => {
      // return ( <EnvelopComponent key={index} envelope={envelope} onSelect={selectEnvelopHandler} style={{border: 2, borderColor: category.color}} /> );
      return ( <EnvelopeListItem key={index} category={category} /> );
    });
  
    const editCategoryHandler = () => {
      navigation.navigate({name: 'EditCategory', params: {envelopeCategory: category} });
    };

    const addEnvelopHandler = () => {
      navigation.navigate({name: 'CreateEnvelope', params: {envelopeCategory: category} });
    };

    const animation = Animations[Math.floor(Math.random() * Animations.length)]

    const renderItem = ({ item, index } : any) => (<EnvelopeListItem envelope={item} category={category} index={index} animation={animation} navigation={navigation} />)
    
    return (

        <Section style={{margin: 10, borderWidth: 1, borderColor: category.color}}>

          <TopNav middleContent={category.name} leftContent={<Icon name="edit" size={20} />} leftAction={editCategoryHandler} rightContent={ <><Icon name="plus" size={20} /></> } rightAction={addEnvelopHandler} />
          
          <FlatList
            data={envelopes}
            keyExtractor={(_, i) => String(i)}
            numColumns={2}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={ListEmptyComponent}
          />

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
  
}
*/


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

  /*
  return (<Section>
                <SectionContent>
                  <View style={{flexDirection: 'row', padding: 10, ...budgetStyle}}>
                    <Text style={{flex: 2}}>Month budget : </Text>
                    <Text style={{textAlign: 'right'}}>{monthBudget.toFixed(2)} €</Text>
                  </View>
                  <View style={{flexDirection: 'row', padding: 10}}>
                    <Text style={{flex: 2}}>Revenue : </Text>
                    <Text style={{textAlign: 'right'}}>{totalRevenue.toFixed(2)} €</Text>
                  </View>
                  <View style={{flexDirection: 'row', padding: 10}}>
                    <Text style={{flex: 2, fontSize: 12, fontStyle: 'italic'}}>Year budget : </Text>
                    <Text style={{textAlign: 'right', fontSize: 12, fontStyle: 'italic'}}> {total_year.toFixed(2)} €</Text>
                  </View>
                </SectionContent>
              </Section>
  );
  */
}


export default function EnvelopesScreen({navigation, onChange} : {navigation : any, onChange?: (categories: EnvelopeCategory[]) => void}) {

    const [loading, setLoading] = useState(false);

    const [categories, setCategories] = useState<EnvelopeCategory[]>([]);

    const [envelopes, setEnvelopes] = useState<Envelope[]>([]);

    const [totalRevenue, setTotalRevenue] = useState(0);

    const isFocused = useIsFocused();

    const categoriesDao = DAOFactory.getDAO(EnvelopeCategoryDao, DATABASE_TYPE);
    const envelopeDao = DAOFactory.getDAO(EnvelopeDao, DATABASE_TYPE);
    const revenueDao = DAOFactory.getDAO(RevenueDao, DATABASE_TYPE);

    const createCategoryHandler = () => {
      navigation.navigate('CreateCategory');
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

    }, [isFocused])

    if( loading ) {
      <SafeAreaView style={scroll_styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    }
    
    const envelopes_group = _.groupBy(envelopes, 'category_id');

    /*
    const budget_items = categories.map((category : EnvelopeCategory, index : number) => {
      return (<EnvelopeSection key={index} category={category} envelopes={envelopes_group[category._id] ? envelopes_group[category._id] : []} navigation={navigation} />);
    });
    */
      
    const total_year = budgetPerYear(envelopes);

    // const monthBudget = total_year/12;

    // const budgetStyle = totalRevenue >= monthBudget ? container_state_styles.success : container_state_styles.danger;

    


    /*
    <ScrollView style={scroll_styles.scrollView}>
              {budget_items}
              <Section>
                <SectionContent>
                  <View style={{flexDirection: 'row', padding: 10, ...budgetStyle}}>
                    <Text style={{flex: 2}}>Month budget : </Text>
                    <Text style={{textAlign: 'right'}}>{monthBudget.toFixed(2)} €</Text>
                  </View>
                  <View style={{flexDirection: 'row', padding: 10}}>
                    <Text style={{flex: 2}}>Revenue : </Text>
                    <Text style={{textAlign: 'right'}}>{revenue.toFixed(2)} €</Text>
                  </View>
                  <View style={{flexDirection: 'row', padding: 10}}>
                    <Text style={{flex: 2, fontSize: 12, fontStyle: 'italic'}}>Year budget : </Text>
                    <Text style={{textAlign: 'right', fontSize: 12, fontStyle: 'italic'}}> {total_year.toFixed(2)} €</Text>
                  </View>
                </SectionContent>
              </Section>
            </ScrollView>
      */

    const editCategoryHandler = (category: EnvelopeCategory) => {
      navigation.navigate({name: 'EditCategory', params: {envelopeCategory: category} });
    };
        
    const addEnvelopHandler = (category: EnvelopeCategory) => {
      navigation.navigate({name: 'CreateEnvelope', params: {envelopeCategory: category} });
    };

    const renderItemHandler = ({item, index}) => {
      const category = _.find(categories, {'_id': item.category_id});
      return <EnvelopeListItem envelope={item} category={category} navigation={navigation} index={index} />;
    };

    const renderSectionHandler = ({item, section} : any) => {
      // return <EnvelopeListItem envelope={item} category={section} navigation={navigation} />;

      return (
        <FlatList data={item} renderItem={renderItemHandler} numColumns={2} />
      );

    };

    const renderHeaderHandler = ({section}) => {
      const category = {_id: section._id, name: section.name, color: section.color} as EnvelopeCategory;
      return <TopNav
              style={{backgroundColor: category.color }}
              middleContent={section.name}
              leftContent={<Icon name="edit" size={20} />}
              leftAction={() => editCategoryHandler(category)}
              rightContent={ <><Icon name="plus" size={20} /></> }
              rightAction={() => addEnvelopHandler(category)}
            />;
    };

    const renderFooterHandler = ({section}) => {
      const total_year = budgetPerYear(envelopes);
      //const monthBudget = total_year/12;
      // const budgetStyle = revenue >= monthBudget ? container_state_styles.success : container_state_styles.danger;
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

    // console.log('envelopes_group: ', envelopes_group);
    // console.log('categories:      ', categories);

    // var arr = _.mergeWith(envelopes_group, categories, (item1, item2) => item1);
    const data = _.transform(envelopes_group, (result, value, key) => {
      const category = _.find(categories, {"_id": _.parseInt(key) });
      // console.log('category: ', category);
      return result.push( _.assign({"data": [value]}, category) ); // {"title": category.name, "color": category.color, "data": value}
    }, [])

    // const data2 = _.mapKeys(envelopes_group, (value, key) => 'data');

    // console.log('data: ', data);

    // const data = [];

    return (
        
        <SafeAreaView style={scroll_styles.container}>

          { (data.length == 0) ? (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', margin: 20, }}>
              <Button text="Create First category" onPress={createCategoryHandler} />
            </View>
          ) : (
            <>
              <SectionList
                sections={data}
                keyExtractor={(item, index) => item + index}
                renderItem={renderSectionHandler}
                renderSectionHeader={renderHeaderHandler}
                renderSectionFooter={renderFooterHandler}
                ListFooterComponent={ <BudgetState envelopes={envelopes} totalRevenue={totalRevenue} /> }
              />
              
            </>
          ) }

            
        </SafeAreaView>
    );
}
