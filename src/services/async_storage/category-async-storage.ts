import { AsyncStorage } from "react-native";
import _ from "lodash";
import uuid from 'react-native-uuid';
import { Category, CategoryDao } from "../category";

export class CategoryDaoStorage extends CategoryDao {
    
    addAll(entry: Category[]): Promise<(string | number | undefined)[]> {
        throw new Error("Method not implemented.");
    }

    async load() : Promise<Category[]> {
        const json = await AsyncStorage.getItem('envelope_categories');
        if( json ) {
            return JSON.parse(json);
        }
        return [];
    }

    async save(envelopeCategories: Category[]) : Promise<void> {
        await AsyncStorage.setItem('envelope_categories', JSON.stringify(envelopeCategories) );
    }

    async add(envelopeCategorie : Category) : Promise<string|number|undefined> {
        envelopeCategorie._id = uuid.v4() as string;
        return this.load().then(categories => {
            categories.push(envelopeCategorie);
            return this.save(categories);
        }).then(r => (envelopeCategorie._id));
    }

    async update(category : Category) : Promise<void> {
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

    async remove(envelopeCategorie : Category) : Promise<void> {
        return this.load().then(categories => {
            categories = _.remove(categories, cat => cat._id != envelopeCategorie._id);
            return this.save(categories);
        });
    }

}
