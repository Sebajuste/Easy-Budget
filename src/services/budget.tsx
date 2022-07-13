import { useState } from "react";

const bank_budget = [
    {
        "name": "PEL",
        "value": 50,
        "type": "month"
    }, {
        "name": "Livret A",
        "value": 50,
        "type": "month"
    }
];

const home_budget = [
    {
        "name": "Loyer",
        "value": 645.05,
        "type": "month"
    }, {
        "name": "Charges",
        "value": 350,
        "type": "trimester"
    }, {
        "name": "Taxe habitation",
        "value": 735,
        "type": "year"
    }, {
        "name": "Taxe foncière",
        "value": 752,
        "type": "year"
    }, {
        "name": "Assurance hab.",
        "value": 29,
        "type": "month"
    }, {
        "name": "Electricite",
        "value": 62.99,
        "type": "month"
    }
];

const food_budget = [
    {
        "name": "Restaurants",
        "value": 50,
        "type": "month"
    }, {
        "name": "Supermarché",
        "value": 200,
        "type": "month"
    }
    , {
        "name": "Chat",
        "value": 100,
        "type": "trimester"
    }
];

const loisir_budget = [
    {
        "name": "Sorties",
        "value": 50,
        "type": "month"
    }, {
        "name": "Voyages",
        "value": 600,
        "type": "year"
    }, {
        "name": "Cadeaux",
        "value": 25 * 12,
        "type": "year"
    }, {
        "name": "Cinema",
        "value": 15,
        "type": "month"
    }, {
        "name": "Jeux Vidéos",
        "value": 30,
        "type": "month"
    }, {
        "name": "Décoration",
        "value": 20,
        "type": "month"
    }
];

const shopping_budget = [
    {
        "name": "Vêtement",
        "value": 30,
        "type": "trimester"
    }, {
        "name": "Livres",
        "value": 5 * 12,
        "type": "year"
    }, {
        "name": "Produits entretiens",
        "value": 20,
        "type": "month"
    }, {
        "name": "Imprévus",
        "value": 30,
        "type": "month"
    }
];

const transport_budget = [
    {
        "name": "Essence",
        "value": 80,
        "type": "month"
    }, {
        "name": "Assurance",
        "value": 894.28,
        "type": "year"
    }, {
        "name": "Autoroute",
        "value": 15,
        "type": "month"
    }, {
        "name": "Transports",
        "value": 5,
        "type": "month"
    }
];

const health_budget = [
    {
        "name": "Divers",
        "value": 100,
        "type": "year"
    }
];

const communication_budget = [
    {
        "name": "Internet",
        "value": 38.99,
        "type": "month"
    }, {
        "name": "Licences",
        "value": 15,
        "type": "month"
    }, {
        "name": "Dons",
        "value": 15,
        "type": "month"
    }
];

const budget_list = [
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
];

export function loadBudgetList() {

    return budget_list;

}

export function budgetPerYear(budgets: any[]) {

    if( !budgets ) {
      return 0;
    }
  
    let result = 0;
  
    budgets.forEach(item => {
      switch(item.type) {
        case 'month': {
          result += item.value * 12;
          break;
        }
        case 'trimester': {
          result += item.value * 4;
          break;
        }
        case 'year': {
          result += item.value;
          break;
        }
      }
    });
  
    return result;
}