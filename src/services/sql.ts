
export class SQLSelectBuilder {

  private _columns: string[];
  private _tables: string[];

  constructor() {
    this._columns = [];
    this._tables = [];
  }

  select(columns: string[] = ["*"]) {
    this._columns = columns;
  }

  from(tables: string[]) {
    this._tables = tables;
    return this;
  }

  where(clauses: {column: string, value: any}) {
    return this;
  }

  and(clauses: {column: string, value: any}) {
    return this;
  }

  or(clauses: {column: string, value: any}) {
    return this;
  }

  limit (n: number) {
    return this;
  }

  build() : string {
    let query = `SELECT ${this._columns.join(", ")} FROM ${this._tables.join(', ')}`;
  
    return query;
  }

}



export class SQLBuilder {
    private table: string;
  
    constructor(table: string) {
      this.table = table;
    }
  
    select(columns: string[] = ["*"]) {
      let query = `SELECT ${columns.join(", ")} FROM ${this.table}`;
  
      return {
        where: (clauses: object) => {
          let whereClauses = Object.entries(clauses)
            .map(([column, value]) => `${column} = ${value}`)
            .join(" AND ");
          query += ` WHERE ${whereClauses}`;
          return this;
        },
        limit: (n: number) => {
          query += ` LIMIT ${n}`;
          return this;
        },
        toString: () => query
      };
    }
  
    insert(data: object) {
      let columns = Object.keys(data).join(", ");
      let values = Object.values(data).join(", ");
  
      let query = `INSERT INTO ${this.table} (${columns}) VALUES (${values})`;
  
      return { toString: () => query };
    }
  
    update(data: object) {
      let assignments = Object.entries(data)
        .map(([column, value]) => `${column} = ${value}`)
        .join(", ");
  
      let query = `UPDATE ${this.table} SET ${assignments}`;
  
      return {
        where: (clauses: object) => {
          let whereClauses = Object.entries(clauses)
            .map(([column, value]) => `${column} = ${value}`)
            .join(" AND ");
          query += ` WHERE ${whereClauses}`;
          return this;
        },
        toString: () => query
      };
    }
  
    delete() {
      let query = `DELETE FROM ${this.table}`;
      return {
        where: (clauses: object) => {
          let whereClauses = Object.entries(clauses)
            .map(([column, value]) => `${column} = ${value}`)
            .join(" AND ");
          query += ` WHERE ${whereClauses}`;
          return this;
        },
        toString: () => query
      };
    }
  }
