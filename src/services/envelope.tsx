import { DAO } from "./dao";

export enum Period {
    MONTHLY = "MONTHLY",
    TRIMESTER = "TRIMESTER",
    SEMESTER = "SEMESTER",
    YEARLY = "YEARLY"
}

export interface EnvelopeCategory {
  _id: string | number;
  name: string;
  color: string;
  icon: string;
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
        case Period.MONTHLY: return "MONTHLY";
        case Period.TRIMESTER: return "TRIMESTER";
        case Period.SEMESTER: return "SEMESTER";
        case Period.YEARLY: return "YEARLY";
        default: return "";
    }
}

export function periodFromString(operationTypeStr : string) {
    switch(operationTypeStr) {
        case 'MONTHLY': return Period.MONTHLY;
        case 'TRIMESTER': return Period.TRIMESTER;
        case 'SEMESTER': return Period.SEMESTER;
        case 'YEARLY': return Period.YEARLY;
        default: return Period.MONTHLY;
    }
}

export function countMonth(period: Period) {
  switch(period) {
    case Period.MONTHLY: {
      return 1;
    }
    case Period.TRIMESTER: {
      return 3;
    }
    case Period.SEMESTER: {
      return 6;
    }
    case Period.YEARLY: {
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
        case Period.MONTHLY: {
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
        case Period.YEARLY: {
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
    case Period.MONTHLY: {
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
    case Period.YEARLY: {
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
