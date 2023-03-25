import _ from "lodash";
import { DAO } from "./dao";

export enum Period {
    MONTHLY = "MONTHLY",
    TRIMESTER = "TRIMESTER",
    SEMESTER = "SEMESTER",
    YEARLY = "YEARLY"
}

export interface Envelope {
    _id : string | number;
    name: string;
    amount: number;
    funds: number;
    period: Period;
    dueDate: Date;
    category_id: string;
    category?:string;
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

export function envelopePreviousDueDate(envelope: Envelope) : Date {

  const dueDate = envelope.dueDate ? (typeof envelope.dueDate === 'string' ? new Date(envelope.dueDate) : new Date(envelope.dueDate.toISOString()) ) : new Date();

  switch(envelope.period) {
    case Period.MONTHLY: {
      dueDate.setMonth(dueDate.getMonth()-1);
      break;
    }
    case Period.TRIMESTER: {
      dueDate.setMonth(dueDate.getMonth()-3);
      break;
    }
    case Period.SEMESTER: {
      dueDate.setMonth(dueDate.getMonth()-6);
      break;
    }
    case Period.YEARLY: {
      dueDate.setFullYear(dueDate.getFullYear()-1);
      break;
    }
  }
  return dueDate;
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

export function updateNextDueDate(envelopes: Envelope[]) : Envelope[] {
  const checkDate = new Date();
  checkDate.setMonth(checkDate.getMonth()-1);
  return _.filter(envelopes, envelope => envelope.dueDate.getTime() < checkDate.getTime()).map(envelope => Object.assign({}, envelope, {dueDate: envelopeNextDate(envelope)}));
}

export abstract class EnvelopeDao extends DAO<Envelope> {
  abstract load() : Promise<Envelope[]>;
  // abstract save(envelopes: Envelope[]) : Promise<void>;
  abstract add(envelope : Envelope) : Promise<string|number|undefined>;
  abstract update(envelope : Envelope) : Promise<void>;
  abstract remove(envelope : Envelope) : Promise<void>;
};

export function isValidEnvelope(envelope: Envelope, currentPeriodFilled:number) : boolean {
  const now = new Date();
  const month_fill_amount = budgetPerMonth(envelope.amount, envelope.period);
  const diff_year_now_duedate = envelope.dueDate.getFullYear() - now.getFullYear();
  const diff_date_now_duedate = diff_year_now_duedate == 0 ? (envelope.dueDate.getMonth() - now.getMonth()) : ( (12-now.getMonth()) + (diff_year_now_duedate-1)*12 + envelope.dueDate.getMonth() );
  const isValid = envelope.funds + (currentPeriodFilled + (month_fill_amount * diff_date_now_duedate) ) >= envelope.amount;
  return isValid;
}
