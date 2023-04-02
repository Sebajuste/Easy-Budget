import { FlatList, SectionList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Section, SectionContent, Text, TopNav } from "react-native-rapi-ui";
import * as Animatable from 'react-native-animatable'

import { SafeAreaView } from "react-native-safe-area-context";
import { Envelope, budgetPerYear, isValidEnvelope, envelopePreviousDueDate } from "../../services/envelope";
import { Category } from "../../services/category";
import { container_state_styles, scroll_styles } from "../../styles";

import Icon from 'react-native-vector-icons/FontAwesome';
import { useEffect, useMemo, useRef, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import _ from "lodash";
import { DAOFactory, DATABASE_TYPE } from "../../services/dao-manager";
import { Revenue } from "../../services/revenue";
import { DaoType } from "../../services/dao";
import { t } from "../../services/i18n";
import { horizontalScale, horizontalSplit, verticalScale } from "../../util/ui-metrics";
import { EnvelopeTransaction, EnvelopeTransactionDao } from "../../services/transaction";


function EnvelopeListItem(props : any) {

  const { envelope, category, navigation, index } = props;

  const [totalFilled, setTotalFilled] = useState(0);

  const dueDate = envelope.dueDate ? ( typeof envelope.dueDate === 'string' ? (new Date(envelope.dueDate).toDateString() ) : envelope.dueDate.toDateString()) : '';

  const isValid = isValidEnvelope(envelope, totalFilled);

  const selectHandler = () => {
    navigation.navigate({name: 'FillEnvelope', params: {envelope: envelope, envelopeCategory: category}});
  };

  useEffect(() => {
    const envelopeTransactionDao = DAOFactory.getDAOFromType<EnvelopeTransaction>(DaoType.ENVELOPE_TRANSACTION, DATABASE_TYPE) as EnvelopeTransactionDao;
    envelopeTransactionDao.range(envelope, envelopePreviousDueDate(envelope), new Date() )//
      .then(transactions => {
        return _.sum( _.map(transactions,'amount') );
      })//
      .then(setTotalFilled);
  }, []);

  console.log('render EnvelopeListItem ', envelope.name);

  return (
    <Animatable.View animation={"flipInY"} duration={1000} delay={index*300} >
      <TouchableOpacity style={styles.listItem} onPress={selectHandler}>
        <View style={{...styles.image}}>
          <View style={{flex: 1, flexDirection: 'column'}}>
            <Text style={{flex: 1, alignItems: 'center', textAlign: 'center', flexGrow: 1, textAlignVertical: "center", fontSize: 20, flexWrap: "nowrap", overflow: "hidden", color: category.color }}>{envelope.funds.toFixed(2)}€</Text>
            <Text style={{flex: 1, alignItems: 'center', textAlign: 'center', flexGrow: 1, textAlignVertical: "center"}}>{envelope.funds > envelope.amount ? envelope.funds.toFixed(2) : envelope.amount.toFixed(2)}€</Text>
          </View>
          <Text style={{fontSize: 10}}>{dueDate}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={{ flex: 1, ...styles.name}}>{envelope.name}</Text>
          <View style={{borderWidth: 1, borderColor: isValid ? 'green' : 'red', width: 24, height: 24, borderRadius: 24/2, padding: 5, left: 10}}>
              <Icon style={{textAlign: 'center', fontSize: 12, color: isValid ? 'green' : 'red'}} name={isValid ? 'check' : 'close'} />
          </View>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

}

function EnvelopeSectionList({navigation, envelopes, categories} : {navigation:any, envelopes : Envelope[], categories: Category[]}) {

  const renderItemHandler = ({item, index} : {item: Envelope, index: number}) => {
    const category = _.find(categories, {'_id': item.category_id});
    return <EnvelopeListItem envelope={item} category={category} navigation={navigation} index={index} />;
  };

  const memoizedRenterItemHandler = useMemo(() => renderItemHandler, [envelopes]);

  return (
    <FlatList data={envelopes} renderItem={memoizedRenterItemHandler} numColumns={horizontalSplit(ITEM_WIDTH)} style={styles.list} contentContainerStyle={styles.list} />
  );

}




function BudgetState({envelopes, totalRevenue} : {envelopes: Envelope[], totalRevenue: number}) {

  const total_year = budgetPerYear(envelopes);

  const monthBudget = total_year/12;

  const budgetStyle = totalRevenue >= monthBudget ? container_state_styles.success : container_state_styles.danger;

  return (
    <View style={{flexDirection: 'row', justifyContent: 'space-around', margin: 5, borderRadius: 10, backgroundColor: 'white', flexWrap: 'wrap'}}>

      <View style={{margin: 5, padding: 5, borderRadius: 10, minWidth: horizontalScale(110), ...budgetStyle}}>
        <Text style={{textAlign: 'center'}}>{monthBudget.toFixed(2)} €</Text>
        <Text style={{textAlign: 'center', fontSize: 12}}>{t('common:budget_monthly')}</Text>
      </View>

      <View style={{margin: 5, padding: 5, borderRadius: 10, minWidth: horizontalScale(110)}}>
        <Text style={{textAlign: 'center'}}>{totalRevenue.toFixed(2)} €</Text>
        <Text style={{textAlign: 'center', fontSize: 12}}>{t('common:revenues')}</Text>
      </View>

      <View style={{margin: 5, padding: 5, borderRadius: 10, minWidth: horizontalScale(110)}}>
        <Text style={{textAlign: 'center'}}>{total_year.toFixed(2)} €</Text>
        <Text style={{textAlign: 'center', fontSize: 12}}>{t('common:budget_yearly')}</Text>
      </View>

    </View>
  );

}


interface EnvelopesScreenState {
  loading: boolean;
  categories: Category[];
  envelopes: Envelope[],
  totalRevenue: number
}

const ITEM_WIDTH = 160;

export default function EnvelopesScreen({navigation, onChange} : {navigation : any, onChange?: (categories: Category[]) => void}) {

    const viewRef = useRef(null);

    // const [loading, setLoading] = useState(false);

    const [infos, setInfos] = useState<EnvelopesScreenState>({
      loading: false,
      categories: [],
      envelopes: [],
      totalRevenue: 0
    });

    /*
    const [categories, setCategories] = useState<Category[]>([]);
    const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    */

    const isFocused = useIsFocused();

    const categoriesDao = DAOFactory.getDAOFromType<Category>(DaoType.CATEGORY, DATABASE_TYPE);
    const envelopeDao = DAOFactory.getDAOFromType<Envelope>(DaoType.ENVELOPE, DATABASE_TYPE);
    const revenueDao = DAOFactory.getDAOFromType<Revenue>(DaoType.REVENUE, DATABASE_TYPE);

    const createEnvelopeHandler = () => {
      navigation.navigate('CreateEnvelop');
    };

    useEffect(() => {
      console.log('EnvelopesScreen useEffect');
      // setLoading(true);
      setInfos( (oldInfo) => ({
        ...oldInfo,
        loading: true
      }));
      Promise.all([categoriesDao.load(), envelopeDao.load(), revenueDao.load()]).then( ([categories, envelopes, revenues]) => {
        /*
        setCategories(categories);
        setEnvelopes(envelopes);
        setTotalRevenue( _.sum( _.map(revenues, revenue => revenue.amount) ) );
        */
        setInfos({
          loading: false,
          categories: categories,
          envelopes: envelopes,
          totalRevenue: _.sum( _.map(revenues, revenue => revenue.amount) )
        });
        if( onChange ) onChange(categories);
      }).catch(err => {
        console.error(err);
      }).finally(() => {
        // setLoading(false);
      });

      /*
      const unsubscribe = navigation.addListener('focus', () => {
        if( viewRef != null && viewRef.current != null ) {
          // viewRef.current.animate({ 0: { opacity: 0.5, }, 1: { opacity: 1 } });
        }
      });
      return () => unsubscribe;
      */

    }, [isFocused])

    
    
    const envelopes_group = _.groupBy(infos.envelopes, 'category_id');

    const editCategoryHandler = (category: Category) => {
      navigation.navigate({name: 'EditCategory', params: {category: category} });
    };
    
    /*
    const addEnvelopHandler = (category: Category) => {
      navigation.navigate({name: 'CreateEnvelope', params: {category: category} });
    };

    /*
    const renderItemHandler = ({item, index} : {item: Envelope, index: number}) => {
      const category = _.find(categories, {'_id': item.category_id});
      return <EnvelopeListItem envelope={item} category={category} navigation={navigation} index={index} />;
    };
    */

    const renderSectionHandler = ({item} : {item: Envelope[]}) => {
      return (
        <EnvelopeSectionList navigation={navigation} envelopes={item} categories={infos.categories} />
      );
    };

    const renderHeaderHandler = ({section}: any) => {
      const { category_id } = section.data[0][0];

      const category = _.find(infos.categories, item => item._id == category_id);
      return <TopNav
              style={{backgroundColor: category?.color }}
              middleContent={category?.name}
              leftContent={<Icon name="edit" size={20} />}
              leftAction={category ? () => editCategoryHandler(category) : () => {} }
            />;
    };


    const cost_per_year = t('common:cost_per_year');
    const cost_per_month = t('common:cost_per_month');

    const renderFooterHandler = ({section} : any) => {
 
      const total_year = budgetPerYear(section.data[0]);

      return (
        <Section>
          <SectionContent style={{backgroundColor: 'inherit'}}>
          <View style={{flexDirection: 'row'}}>
              <Text style={{flex: 2}}>{cost_per_year} : </Text>
              <Text style={{textAlign: 'right'}}> {total_year.toFixed(2)} €</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={{flex: 2}}>{cost_per_month} : </Text>
              <Text style={{textAlign: 'right'}}>{(total_year/12).toFixed(2)} €</Text>
            </View>
          </SectionContent>
        </Section>
      );
    };

    const data = _.transform(envelopes_group, (result, value, key) => {
      const category = _.find(infos.categories, {"_id": _.parseInt(key) });
      return result.push( _.assign({"data": [value]}, infos.category) );
    }, []);

    const memoizedRenderSectionHandler = useMemo(() => renderSectionHandler, [data] );

    const emptyComponent = (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', margin: 20, }}>
        <Button text={t('buttons:create_first_envelope')} onPress={createEnvelopeHandler} />
      </View>
    );

    if( ! isFocused ) {
      return (
        <SafeAreaView style={scroll_styles.container}>
        </SafeAreaView>
      );
    }

    if( infos.loading ) {
      return (
        <SafeAreaView style={scroll_styles.container}>
          <Text>Loading...</Text>
        </SafeAreaView>
      );
    }

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
                keyExtractor={(item, index) => `${item[index]._id}` }
                renderItem={memoizedRenderSectionHandler}
                renderSectionHeader={renderHeaderHandler}
                renderSectionFooter={renderFooterHandler}
                ListFooterComponent={ <BudgetState envelopes={infos.envelopes} totalRevenue={infos.totalRevenue} /> }
                ListEmptyComponent={ emptyComponent }
              />
            </Animatable.View>
            
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
  list: {
    flex: 1,
    flexGrow: 1,
    justifyContent: "center"
  },
  listItem: {
    width: horizontalScale(ITEM_WIDTH),
    backgroundColor: 'white',
    margin: 8,
    borderRadius: 10,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
  },
  listEmpty: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    minHeight: 150,
    margin: 5,
    borderRadius: 10,
    // backgroundColor: Colors.primary,
    backgroundColor: 'silver',
    padding: 10
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});