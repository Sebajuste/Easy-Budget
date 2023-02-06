import _ from "lodash";
import { AsyncStorage } from "react-native";
import { Envelope, EnvelopeCategory, EnvelopeCategoryDao, EnvelopeDao } from "../envelope";
import uuid from 'react-native-uuid';

export class EnvelopeCategoryDaoStorage extends EnvelopeCategoryDao {
    
    addAll(entry: EnvelopeCategory[]): Promise<(string | number | undefined)[]> {
        throw new Error("Method not implemented.");
    }

    async load() : Promise<EnvelopeCategory[]> {
        const json = await AsyncStorage.getItem('envelope_categories');
        if( json ) {
            return JSON.parse(json);
        }
        return [];
    }

    async save(envelopeCategories: EnvelopeCategory[]) : Promise<void> {
        await AsyncStorage.setItem('envelope_categories', JSON.stringify(envelopeCategories) );
    }

    async add(envelopeCategorie : EnvelopeCategory) : Promise<string|number|undefined> {
        envelopeCategorie._id = uuid.v4() as string;
        return this.load().then(categories => {
            categories.push(envelopeCategorie);
            return this.save(categories);
        }).then(r => (envelopeCategorie._id));
    }

    async update(category : EnvelopeCategory) : Promise<void> {
        return this.load().then(categories => {
            const result = _.find(categories, item => item._id == category._id );
            if( result ) {
                result.name = category.name;
                result.color = category.color;
                return this.save(categories);
            }
            throw new Error('Cannot find item');
        });
    }

    async remove(envelopeCategorie : EnvelopeCategory) : Promise<void> {
        return this.load().then(categories => {
            categories = _.remove(categories, cat => cat._id != envelopeCategorie._id);
            return this.save(categories);
        });
    }

}

export class EnvelopeDaoStorage extends EnvelopeDao {
    addAll(entry: Envelope[]): Promise<(string | number | undefined)[]> {
        throw new Error("Method not implemented.");
    }

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

    async add(envelope : Envelope) : Promise<string|number|undefined> {
        envelope._id = uuid.v4() as string;
        return await this.load().then(envelopes => {
            envelopes.push(envelope);
            return this.save(envelopes).then(v => envelope._id as string|number|undefined);
        });
    }

    async update(envelope : Envelope) : Promise<void> {
        return this.load().then(envelopes => {
            const result = _.find(envelopes, item => item._id == envelope._id);
            if( result ) {
                result.name = envelope.name;
                result.amount = envelope.amount;
                result.category_id = envelope.category_id;
                result.dueDate = envelope.dueDate;
                result.funds = envelope.funds;
                result.period = envelope.period;
                return this.save(envelopes);
            }
            throw new Error('Cannot find item');
        });
    }

    async remove(envelope : Envelope) : Promise<void> {
        this.load().then(envelopes => {
            envelopes = _.remove(envelopes, item => item._id != envelope._id);
            return this.save(envelopes);
        });
    }
}