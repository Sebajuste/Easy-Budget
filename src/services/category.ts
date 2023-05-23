import { DAO } from "./dao";

export interface Category {
    _id: string | number;
    name: string;
    color: string;
    icon: string;
    account_id: string | number;
}

export abstract class CategoryDao extends DAO<Category> {
    abstract load() : Promise<Category[]>;
    abstract add(envelopeCategorie : Category) : Promise<string|number|undefined>;
    abstract update(envelopeCategorie : Category) : Promise<void>;
    abstract remove(envelopeCategorie : Category) : Promise<void>;
  }