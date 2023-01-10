import { ScrollView, TouchableHighlight, View } from "react-native";
import { Button, Section, SectionContent, Text, TopNav } from "react-native-rapi-ui";

import { SafeAreaView } from "react-native-safe-area-context";
import { EnvelopeCategory, Envelope, periodToString, budgetPerYear } from "../../services/budget";
import { scroll_styles } from "../../styles";

import Icon from 'react-native-vector-icons/FontAwesome';
import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { EnvelopeCategoryDaoStorage, EnvelopeDaoStorage } from "../../services/async_storage/budget_async_storage";
import _ from "lodash";



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

function EnvelopComponent({envelope, onSelect} : {envelope: Envelope, onSelect?: (envelope: Envelope) => void}) {

  const longPressHandler = () => {
    if( onSelect ) {
      onSelect(envelope);
    }
  };

  const dueDate = envelope.dueDate ? ( typeof envelope.dueDate === 'string' ? (new Date(envelope.dueDate).toDateString() ) : envelope.dueDate.toDateString()) : '';

  return (
    <TouchableHighlight onLongPress={longPressHandler}>
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


function EnvelopeSection({navigation, title, envelopeCategory, envelopes} : {navigation : any, title: string, envelopeCategory : EnvelopeCategory, envelopes: Envelope[]}) {

    const total_year = budgetPerYear(envelopes);

    const selectEnvelopHandler = (envelope: Envelope) => {
      navigation.navigate({name: 'FillEnvelope', params: {envelope: envelope}});
    };
  
    const section_items = envelopes.map((envelope : Envelope, index : number) => {
      return ( <EnvelopComponent key={index} envelope={envelope} onSelect={selectEnvelopHandler} /> );
    });
  
    const editCategoryHandler = () => {
      navigation.navigate({name: 'EditCategory', params: {envelopeCategory: envelopeCategory} });
    };

    const addEnvelopHandler = () => {
      navigation.navigate({name: 'CreateEnvelope', params: {envelopeCategory: envelopeCategory} });
    };
    
    return (
      <>
        <TopNav middleContent={title} leftContent={<Icon name="edit" size={20} />} leftAction={editCategoryHandler} rightContent={ <><Icon name="plus" size={20} /></> } rightAction={addEnvelopHandler} />
  
        <Section>
          <SectionContent>
            {section_items}
          </SectionContent>
          <SectionContent>
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
      </>
    );
  
  }

export default function EnvelopesScreen({navigation} : {navigation : any}) {


    const [loading, setLoading] = useState(false);

    const [categories, setCategories] = useState<EnvelopeCategory[]>([]);

    const [envelopes, setEnvelopes] = useState<Envelope[]>([]);

    const isFocused = useIsFocused();

    useEffect(() => {
      const categoriesDao = new EnvelopeCategoryDaoStorage();
      const envelopeDao = new EnvelopeDaoStorage();

      categoriesDao.load().then(setCategories);
      envelopeDao.load().then(setEnvelopes);
    }, [isFocused])

    if( loading )  {
      return (
        <View>
          <Text>Loading...</Text>
        </View>
      );
    }

    /*
    if( ! budget || !budget.categories ) {
      return (
        <View>
          <Text>No Budget found</Text>
        </View>
      );
    }
    */

    const envelopes_group = _.groupBy(envelopes, 'category_id');

    const budget_items = categories.map((item : EnvelopeCategory, index : number) => {
      return (<EnvelopeSection key={index} title={item.name} envelopeCategory={item} envelopes={envelopes_group[item._id] ? envelopes_group[item._id] : []} navigation={navigation} />);
    });
      

    const total_year = budgetPerYear(envelopes);

    /*
    const total_year = enve//
      .map( (item : EnvelopeCategory) => budgetPerYear(item.envelopes) )//
      .reduce( (current : number, previous : number) => current + previous, 0 );
    */

    return (
        
        <SafeAreaView style={scroll_styles.container}>
          <ScrollView style={scroll_styles.scrollView}>
            
              {budget_items}
    
              <Section>
                <SectionContent>
                <View style={{flexDirection: 'row'}}>
                  <Text style={{flex: 2}}>Year budget : </Text>
                  <Text style={{textAlign: 'right'}}> {total_year.toFixed(2)} €</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Text style={{flex: 2}}>Month budget : </Text>
                  <Text style={{textAlign: 'right'}}>{(total_year/12).toFixed(2)} €</Text>
                </View>
                </SectionContent>
              </Section>
  
          </ScrollView>
          </SafeAreaView>
    );
}
