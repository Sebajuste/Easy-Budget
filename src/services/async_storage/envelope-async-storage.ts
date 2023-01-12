import _ from "lodash";
import { AsyncStorage } from "react-native";
import { Envelope, EnvelopeCategory, EnvelopeCategoryDao, EnvelopeDao } from "../envelope";
import uuid from 'react-native-uuid';



export class EnvelopeCategoryDaoStorage extends EnvelopeCategoryDao {

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
        envelopeCategorie._id = uuid.v4() as string;
        return this.load().then(categories => {
            categories.push(envelopeCategorie);
            return this.save(categories);
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
            envelopes = _.remove(envelopes, item => item._id != envelope._id);
            return this.save(envelopes);
        });
    }
}