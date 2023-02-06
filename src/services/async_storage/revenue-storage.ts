import _ from "lodash";
import { AsyncStorage } from "react-native";
import uuid from 'react-native-uuid';
import { Revenue, RevenueDao } from "../revenue";


export class RevenueDaoStorage extends RevenueDao {

    async load() : Promise<Revenue[]> {
        const json_revenues = await AsyncStorage.getItem('revenues');
        if( json_revenues ) {
            return JSON.parse(json_revenues) ;
        }
        return [];
    }

    async save(revenues: Revenue[]) {

        return await AsyncStorage.setItem('revenues', JSON.stringify(revenues));
        
    }

    add(revenue: Revenue): Promise<string|number|undefined> {
        revenue._id = uuid.v4() as string;
        return this.load().then(revenues => {
            revenues.push(revenue);
            return this.save(revenues).then(v => revenue._id);
        });
    }

    addAll(revenues: Revenue[]): Promise<string[] | number[] | undefined[]> {
        throw new Error("Method not implemented.");
    }

    update(revenue: Revenue): Promise<void> {
        return this.load().then(revenues => {
            const result = _.find(revenues, item => item._id == revenue._id );
            if( result ) {
                result.name = revenue.name;
                result.amount = revenue.amount;
                return this.save(revenues);
            }
            throw new Error('Cannot find item');
        });
    }

    remove(revenue: Revenue): Promise<void> {
        return this.load().then(revenues => {
            revenues = _.remove(revenues, rev => rev._id != revenue._id);
            return this.save(revenues);
        });
    }

}
