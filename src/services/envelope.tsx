import _ from "lodash";
import { DAO } from "./dao";
import { BankAccount } from "./account";
import { EnvelopeTransaction } from "./transaction";

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
    category_id: string | number;
    category?:string;
    account_id : string | number;
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
  abstract add(envelope : Envelope) : Promise<string|number|undefined>;
  abstract update(envelope : Envelope) : Promise<void>;
  abstract remove(envelope : Envelope) : Promise<void>;
};

export function isValidEnvelope(envelope: Envelope, currentPeriodFilled:number) : boolean {
  const now = new Date();
  const month_fill_amount = budgetPerMonth(envelope.amount, envelope.period);
  const diff_year_now_duedate = envelope.dueDate.getFullYear() - now.getFullYear();
  const diff_months_now_duedate = diff_year_now_duedate == 0 ? (envelope.dueDate.getMonth() - now.getMonth()) : ( (12-now.getMonth()) + (diff_year_now_duedate-1)*12 + envelope.dueDate.getMonth() );
  // const isValid = envelope.funds + (currentPeriodFilled + (month_fill_amount * diff_date_now_duedate) ) >= envelope.amount;
  //const isValid = envelope.funds > envelope.amount - (month_fill_amount * diff_months_now_duedate);
  const isValid = (month_fill_amount * diff_months_now_duedate) + envelope.funds >= envelope.amount;
  return isValid;
}

export function fillEnvelopeCalculation(envelopes : Envelope[]) : any[] {

  const now = new Date();

  const fill_required_envelopes = _.filter(envelopes, envelope => envelope.funds < envelope.amount || ! isValidEnvelope(envelope, 0) );

  const ordered_envelopes = _.orderBy(fill_required_envelopes, ['dueDate'], ['asc']);

  // const enveloped_filtered = _.orderBy(envelopes, ['dueDate'], ['asc']).filter(envelope => envelope.funds < envelope.amount || ! isValidEnvelope(envelope, 0) );

  return _.map( ordered_envelopes , envelope => {
      const month_budget = budgetPerMonth(envelope.amount, envelope.period);
      const dueDate = typeof envelope.dueDate === 'string' ? new Date(envelope.dueDate) : envelope.dueDate;
      const count_month = countMonth(envelope.period);
      const delta_year = dueDate.getFullYear() - now.getFullYear();
      const delta_month = Math.min(count_month, delta_year*12 + (dueDate.getMonth() - now.getMonth()) );
      // console.log(`fillEnvelopeCalculation [${envelope.name}] count_month: ${count_month}, delta_month: ${delta_month}`)
      const month_to_be_filled = count_month - delta_month;
      // console.log(`fillEnvelopeCalculation [${envelope.name}] month_budget: ${month_budget}, month_to_be_filled: ${month_to_be_filled}, envelope.funds: ${envelope.funds}`)
      const amount_filled_required = month_budget * month_to_be_filled - envelope.funds;
      // console.log(`fillEnvelopeCalculation [${envelope.name}] filled_require: ${filled_require}`);
      return [envelope, amount_filled_required];
  });

};

export function fillCalculation(envelopes: Array<Envelope>, accounts: Array<BankAccount>) {

  const fill_required_envelopes = _.map(fillEnvelopeCalculation(envelopes), ([envelope, fill_required]) => (fill_required) );
  const fill_required = _.sum(fill_required_envelopes);
  const total_funds = _.sum( _.map(accounts, account => account.envelope_balance) );

  return {
    fill_required: fill_required,
    total_funds: total_funds
  };
  
};

export function autoFillEnvelopes(envelopes: Array<Envelope>, accounts: Array<BankAccount>) {

  const now = new Date();

  const temp_accounts = _.map(accounts, account => ({account: account, temp_balance: account.envelope_balance}));

  const transactions = _.map(fillEnvelopeCalculation(envelopes), ([envelope, fill_required]) => {
    const temp_account = _.find(temp_accounts, temp_account => temp_account.temp_balance >= fill_required);

    if( temp_account ) {
        temp_account.temp_balance -= fill_required;
        const transaction : EnvelopeTransaction = {
            name: `Auto fill ${envelope.name as string}`,
            amount: fill_required as number,
            envelope_id: envelope._id,
            account_id: temp_account.account._id,
            date: now,
        } as EnvelopeTransaction;

        return transaction;
    }
    console.error(`Oups cannot create transaction`);
    throw new Error(`No account found to fill amount [${fill_required}]`);
  });

  return _.filter(transactions, tx => tx.amount != 0);

}
