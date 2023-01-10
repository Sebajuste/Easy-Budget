import _ from "lodash";
import { AsyncStorage } from "react-native";
import { Envelope, EnvelopeCategory, EnvelopeCategoryDao, EnvelopeDao } from "../budget";
import uuid from 'react-native-uuid';



/*
export async function loadBudgetStorage() : Promise<Budget|null> {
    try {
        const json_budget = await AsyncStorage.getItem('budget');
        if( json_budget ) {
            return JSON.parse(json_budget);
        }
        return DEFAULT_BUDGET;
    } catch (error) {
        return DEFAULT_BUDGET;
    }
}


export async function saveBudgetStorage(budget: Budget) : Promise<void> {
    try {
        await AsyncStorage.setItem(
          'budget',
          JSON.stringify(budget),
        );
      } catch (error) {
        // Error saving data
      }
}


export class BudgetDaoStorage implements BudgetDao {

    async get() : Promise<Budget> {
        const json_budget = await AsyncStorage.getItem('budget');
        if( json_budget ) {
            return JSON.parse(json_budget);
        }
        return DEFAULT_BUDGET;
    }

    save(budget: Budget) : Promise<void> {
        return new Promise( (resolve, reject) => {
            saveBudgetStorage(budget).then(resolve).catch(reject);
        });
    }

}
*/

export class EnvelopeCategoryDaoStorage implements EnvelopeCategoryDao {

    async load() : Promise<EnvelopeCategory[]> {
        const json = await AsyncStorage.getItem('envelope_categories');
        if( json ) {
            return JSON.parse(json);
        }
        return [];
    }

    async save(envelopeCategories: EnvelopeCategory[]) : Promise<void> {
        return await AsyncStorage.setItem('envelope_categories', JSON.stringify(envelopeCategories) );
    }

    async add(envelopeCategorie : EnvelopeCategory) : Promise<void> {
        envelopeCategorie._id = uuid.v4();
        return this.load().then(categories => {
            categories.push(envelopeCategorie);
            return this.save(categories);
        });
    }

    async remove(envelopeCategorie : EnvelopeCategory) : Promise<void> {
        return this.load().then(categories => {
            categories = _.remove(categories, cat => cat._id == envelopeCategorie._id);
            return this.save(categories);
        });
    }

}

export class EnvelopeDaoStorage implements EnvelopeDao {

    async load() : Promise<Envelope[]> {
        const json = await AsyncStorage.getItem('envelopes');
        if( json ) {
            return JSON.parse(json);
        }
        return [];
    }

    async save(envelopes: Envelope[]) : Promise<void> {
        return await AsyncStorage.setItem('envelopes', JSON.stringify(envelopes) );
    }

    async add(envelope : Envelope) : Promise<void> {
        // envelope._id = uuid.v4();
        await this.load().then(envelopes => {
            envelopes.push(envelope);
            return this.save(envelopes);
        });
    }

    async remove(envelope : Envelope) : Promise<void> {
        this.load().then(envelopes => {
            envelopes = _.remove(envelopes, item => item._id == envelope._id);
            return this.save(envelopes);
        });
    }
}