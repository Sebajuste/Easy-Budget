

export abstract class DAO<T> {

    abstract load() : Promise<T[]>;
  
    abstract add(entry : T) : Promise<string|number|undefined>;
  
    abstract addAll(entry : T[]) : Promise<(string|number|undefined)[]>;
  
    abstract update(entry : T) : Promise<void>;
  
    abstract remove(entry : T) : Promise<void>;
  
}

