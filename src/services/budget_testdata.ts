import { Budget, BudgetOperation, BudgetOperationType } from "./budget";

const bank_budget : Array<BudgetOperation> = [
    {
        "name": "PEL",
        "value": 50,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Livret A",
        "value": 50,
        "type": BudgetOperationType.MONTH
    }
];

const home_budget : Array<BudgetOperation> = [
    {
        "name": "Loyer",
        "value": 645.05,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Charges",
        "value": 350,
        "type": BudgetOperationType.TRIMESTER
    }, {
        "name": "Taxe habitation",
        "value": 735,
        "type": BudgetOperationType.YEAR
    }, {
        "name": "Taxe foncière",
        "value": 752,
        "type": BudgetOperationType.YEAR
    }, {
        "name": "Assurance hab.",
        "value": 29,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Electricite",
        "value": 62.99,
        "type": BudgetOperationType.MONTH
    }
];

const food_budget : Array<BudgetOperation> = [
    {
        "name": "Restaurants",
        "value": 50,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Supermarché",
        "value": 200,
        "type": BudgetOperationType.MONTH
    }
    , {
        "name": "Chat",
        "value": 100,
        "type": BudgetOperationType.TRIMESTER
    }
];

const loisir_budget : Array<BudgetOperation> = [
    {
        "name": "Sorties",
        "value": 50,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Voyages",
        "value": 600,
        "type": BudgetOperationType.YEAR
    }, {
        "name": "Cadeaux",
        "value": 25 * 12,
        "type": BudgetOperationType.YEAR
    }, {
        "name": "Cinema",
        "value": 15,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Jeux Vidéos",
        "value": 30,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Décoration",
        "value": 20,
        "type": BudgetOperationType.MONTH
    }
];

const shopping_budget : Array<BudgetOperation> = [
    {
        "name": "Vêtement",
        "value": 30,
        "type": BudgetOperationType.TRIMESTER
    }, {
        "name": "Livres",
        "value": 5 * 12,
        "type": BudgetOperationType.YEAR
    }, {
        "name": "Produits entretiens",
        "value": 20,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Imprévus",
        "value": 30,
        "type": BudgetOperationType.MONTH
    }
];

const transport_budget : Array<BudgetOperation> = [
    {
        "name": "Essence",
        "value": 80,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Assurance",
        "value": 894.28,
        "type": BudgetOperationType.YEAR
    }, {
        "name": "Autoroute",
        "value": 15,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Transports",
        "value": 5,
        "type": BudgetOperationType.MONTH
    }
];

const health_budget : Array<BudgetOperation> = [
    {
        "name": "Divers",
        "value": 100,
        "type": BudgetOperationType.YEAR
    }
];

const communication_budget : Array<BudgetOperation> = [
    {
        "name": "Internet",
        "value": 38.99,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Licences",
        "value": 15,
        "type": BudgetOperationType.MONTH
    }, {
        "name": "Dons",
        "value": 15,
        "type": BudgetOperationType.MONTH
    }
];

export const TEST_BUDGET : Budget = {
    categories: [
        {
            name: "Banque",
            operations: bank_budget,
            reserve: 0
        }, {
            name: "Logement",
            operations: home_budget,
            reserve: 300
        }, {
            name: "Alimentation",
            operations: food_budget,
            reserve: 0
        }, {
            name: "Loisirs",
            operations: loisir_budget,
            reserve: 0
        }, {
            name: "Achat & Shopping",
            operations: shopping_budget,
            reserve: 30
        }, {
            name: "Transport",
            operations: transport_budget,
            reserve: 0
        }, {
            name: "Santé",
            operations: health_budget,
            reserve: 0
        }, {
            name: "Téléphonie & Abonnements",
            operations: communication_budget,
            reserve: 0
        }
    ]
};