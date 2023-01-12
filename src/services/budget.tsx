
export enum Period {
    MONTH, TRIMESTER, SEMESTER, YEAR
}

export interface Envelope {
    _id : string;
    name: string;
    amount: number;
    funds: number;
    period: Period;
    dueDate: Date;
    category_id: string;
}

export interface EnvelopeCategory {
    _id: string;
    name: string;
    envelopes: Envelope[];
}

/*
export interface Budget {
    _id: string;
    name ?: String;
    categories : Array<EnvelopeCategory>
}

export const DEFAULT_BUDGET = {
    _id: 'aaaa_budget_bbb_ccc',
    name: 'Default',
    categories: []
} as Budget;
*/

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

/*
export interface BudgetDao {
  get() : Promise<Budget>;
  save(budget: Budget) : Promise<void>;
};
*/

export interface EnvelopeCategoryDao {
  load() : Promise<EnvelopeCategory[]>;
  save(envelopeCategories: EnvelopeCategory[]) : Promise<void>;
  add(envelopeCategorie : EnvelopeCategory) : Promise<void>;
  remove(envelopeCategorie : EnvelopeCategory) : Promise<void>;
}

export interface EnvelopeDao {
  load() : Promise<Envelope[]>;
  save(envelopes: Envelope[]) : Promise<void>;
  add(envelope : Envelope) : Promise<void>;
  remove(envelope : Envelope) : Promise<void>;
};

/*
export function useBudget(budgetDao : BudgetDao) : [Budget | null, (budget: Budget) => void] {

    const [budget, setBudget] = useState<Budget|null>( () => {
        return {} as Budget;
    });

    useEffect(() => {
        budgetDao.get().then(setBudget);
    }, []);

    const saveBudgetHandler = (newBudget : Budget ) => {
        setBudget(newBudget);
        budgetDao.save(newBudget);
        console.log('new newBudgetList : ', newBudget);
    };

    return [budget, saveBudgetHandler];
}
*/
