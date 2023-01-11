import { Budget, Envelope, Period } from "./budget";
import { BudgetDao } from "./budget_dao";
import uuid from 'react-native-uuid';


const bank_budget : Array<Envelope> = [
    {
        "_id": uuid.v4(),
        "name": "PEL",
        "amount": 50,
        "period": Period.MONTH,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Assurance Vie",
        "amount": 50,
        "period": Period.MONTH,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Frais",
        "amount": 8,
        "period": Period.MONTH,
        "funds": 0
    }
];

const home_budget : Array<Envelope> = [
    {
        "_id": uuid.v4(),
        "name": "Loyer",
        "amount": 645.05,
        "period": Period.MONTH,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Charges",
        "amount": 400,
        "period": Period.TRIMESTER,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Taxe habitation",
        "amount": 306,
        "period": Period.YEAR,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Taxe foncière",
        "amount": 761,
        "period": Period.YEAR,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Assurance crédit",
        "amount": 29,
        "period": Period.MONTH,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Assurance hab.",
        "amount": 222.94,
        "period": Period.YEAR,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Electricite",
        "amount": 62.99,
        "period": Period.MONTH,
        "funds": 0
    }
];

const food_budget : Array<Envelope> = [
    {
        "_id": uuid.v4(),
        "name": "Restaurants",
        "amount": 50,
        "period": Period.MONTH,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Supermarché",
        "amount": 200,
        "period": Period.MONTH,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Chat",
        "amount": 100,
        "period": Period.TRIMESTER,
        "funds": 0
    }
];

const loisir_budget : Array<Envelope> = [
    {
        "_id": uuid.v4(),
        "name": "Sorties",
        "amount": 200,
        "period": Period.TRIMESTER,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Voyages",
        "amount": 600,
        "period": Period.YEAR,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Cadeaux",
        "amount": 25 * 12,
        "period": Period.YEAR,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Cinema",
        "amount": 15,
        "period": Period.MONTH,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Jeux Vidéos",
        "amount": 150,
        "period": Period.TRIMESTER,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Décoration",
        "amount": 100,
        "period": Period.MONTH,
        "funds": 0
    }
];

const shopping_budget : Array<Envelope> = [
    {
        "_id": uuid.v4(),
        "name": "Vêtement",
        "amount": 30,
        "period": Period.TRIMESTER,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Livres",
        "amount": 5 * 12,
        "period": Period.YEAR,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Produits entretiens",
        "amount": 20,
        "period": Period.MONTH,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Imprévus",
        "amount": 30,
        "period": Period.MONTH,
        "funds": 0
    }
];

const transport_budget : Array<Envelope> = [
    {
        "_id": uuid.v4(),
        "name": "Essence",
        "amount": 80,
        "period": Period.MONTH,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Assurance",
        "amount": 900,
        "period": Period.YEAR,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Autoroute",
        "amount": 20,
        "period": Period.MONTH,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Transports",
        "amount": 5,
        "period": Period.MONTH,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Entretien voiture",
        "amount": 600,
        "period": Period.YEAR,
        "funds": 0
    }
];

const health_budget : Array<Envelope> = [
    {
        "_id": uuid.v4(),
        "name": "Divers",
        "amount": 100,
        "period": Period.YEAR,
        "funds": 0
    }
];

const communication_budget : Array<Envelope> = [
    {
        "_id": uuid.v4(),
        "name": "Internet",
        "amount": 50,
        "period": Period.MONTH,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Licences",
        "amount": 15,
        "period": Period.MONTH,
        "funds": 0
    }, {
        "_id": uuid.v4(),
        "name": "Dons",
        "amount": 15,
        "period": Period.MONTH,
        "funds": 0
    }
];

let internal_budget : Budget = {
    _id: uuid.v4(),
    name: 'Default',
    categories: [
        {
            "_id": uuid.v4(),
            name: "Banque",
            envelopes: bank_budget
        }, {
            "_id": uuid.v4(),
            name: "Logement",
            envelopes: home_budget
        }, {
            "_id": uuid.v4(),
            name: "Alimentation",
            envelopes: food_budget
        }, {
            "_id": uuid.v4(),
            name: "Loisirs",
            envelopes: loisir_budget
        }, {
            "_id": uuid.v4(),
            name: "Achat & Shopping",
            envelopes: shopping_budget
        }, {
            "_id": uuid.v4(),
            name: "Transport",
            envelopes: transport_budget
        }, {
            "_id": uuid.v4(),
            name: "Santé",
            envelopes: health_budget
        }, {
            "_id": uuid.v4(),
            name: "Téléphonie & Abonnements",
            envelopes: communication_budget
        }
    ]
};



export class BudgetDaoInternal implements BudgetDao {

    get() : Promise<Budget> {
        return new Promise((resolve, reject) => {
            resolve(internal_budget);
        });
    }

    save(budget: Budget) : Promise<void> {
        return new Promise((resolve, reject) => {
            internal_budget = budget;
            resolve();
        });
    }

}


/*


export function saveBudget(budget : Budget ) {
    console.log('saveBudget : ', budget.categories[0]);
    internal_budget = budget
}

let bugetChangeObserver : Subscriber<Budget>;

let bugetChangeObservable : Observable<Budget>;

function createObservableBudget() {

    bugetChangeObservable = new Observable<Budget>(observer => {
        bugetChangeObserver = observer;

        // observer.next( loadBudget() );

    }).pipe(
        share()
    );
    return bugetChangeObservable;
}

export function subscribeBudget() {
    return bugetChangeObservable ? bugetChangeObservable : createObservableBudget();
}

export function saveBudgetCategory(envelopeCategory : EnvelopeCategory) {

}
*/





