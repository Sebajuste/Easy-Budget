import { DAO } from "./dao";

export enum Period {
    MONTH = "MONTH",
    TRIMESTER = "TRIMESTER",
    SEMESTER = "SEMESTER",
    YEAR = "YEAR"
}

export interface EnvelopeCategory {
  _id: string | number;
  name: string;
  color: string;
}

export interface Envelope {
    _id : string | number;
    name: string;
    amount: number;
    funds: number;
    period: Period;
    dueDate: Date;
    category_id: string;
}

export function periodToString(budgetPeriod : Period) {
    switch(budgetPeriod) {
        case Period.MONTH: return "month";
        case Period.TRIMESTER: return "trimester";
        case Period.SEMESTER: return "semester";
        case Period.YEAR: return "year";
        default: return "";
    }
}

export function periodFromString(operationTypeStr : string) {
    switch(operationTypeStr) {
        case 'month': return Period.MONTH;
        case 'trimester': return Period.TRIMESTER;
        case 'semester': return Period.SEMESTER;
        case 'year': return Period.YEAR;
        default: return Period.MONTH;
    }
}

export function countMonth(period: Period) {
  switch(period) {
    case Period.MONTH: {
      return 1;
    }
    case Period.TRIMESTER: {
      return 3;
    }
    case Period.SEMESTER: {
      return 6;
    }
    case Period.YEAR: {
      return 12;
    }
  }
}

export function budgetPerMonth(amount : number, period: Period) {
  return amount / countMonth(period);
}

export function budgetPerYear(envelopes: Array<Envelope> ) {

    if( !envelopes ) {
      return 0;
    }
  
    let result = 0;
  
    envelopes.forEach(envelope => {
      switch(envelope.period) {
        case Period.MONTH: {
          result += envelope.amount * 12;
          break;
        }
        case Period.TRIMESTER: {
          result += envelope.amount * 4;
          break;
        }
        case Period.SEMESTER: {
          result += envelope.amount * 2;
          break;
        }
        case Period.YEAR: {
          result += envelope.amount;
          break;
        }
      }
    });
  
    return result;
}

export function envelopeNextDate(envelope: Envelope) : Date {

  const date = envelope.dueDate ? (typeof envelope.dueDate === 'string' ? new Date(envelope.dueDate) : new Date(envelope.dueDate.toISOString()) ) : new Date();

  switch(envelope.period) {
    case Period.MONTH: {
      date.setMonth(date.getMonth()+1);
      break;
    }
    case Period.TRIMESTER: {
      date.setMonth(date.getMonth()+3);
      break;
    }
    case Period.SEMESTER: {
      date.setMonth(date.getMonth()+6);
      break;
    }
    case Period.YEAR: {
      date.setFullYear(date.getFullYear()+1);
      break;
    }
  }
  return date;

}


export abstract class EnvelopeCategoryDao extends DAO<EnvelopeCategory> {
  abstract load() : Promise<EnvelopeCategory[]>;
  // abstract save(envelopeCategories: EnvelopeCategory[]) : Promise<void>;
  abstract add(envelopeCategorie : EnvelopeCategory) : Promise<string|number|undefined>;
  abstract update(envelopeCategorie : EnvelopeCategory) : Promise<void>;
  abstract remove(envelopeCategorie : EnvelopeCategory) : Promise<void>;
}

export abstract class EnvelopeDao extends DAO<Envelope> {
  abstract load() : Promise<Envelope[]>;
  // abstract save(envelopes: Envelope[]) : Promise<void>;
  abstract add(envelope : Envelope) : Promise<string|number|undefined>;
  abstract update(envelope : Envelope) : Promise<void>;
  abstract remove(envelope : Envelope) : Promise<void>;
};
