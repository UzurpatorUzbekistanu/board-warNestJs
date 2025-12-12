/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Pool, PoolClient, QueryResult } from 'pg'; // klient postgres

type SqlQuery = {
  sql: string; // zapytanie
  args: Array<unknown>; // parametry
  argTypes: Array<unknown>; // typy argumentow
};

type SqlResultSet = {
  columnTypes: Array<number>; // typy kolumn
  columnNames: Array<string>; // nazwy kolumn
  rows: Array<Array<unknown>>; // wiersze
  lastInsertId?: string; // opcjonalne id
};

type TransactionOptions = {
  usePhantomQuery: boolean; // flaga
};

type Transaction = {
  provider: 'postgres';
  adapterName: string;
  options: TransactionOptions; // opcje transakcji
  queryRaw(params: SqlQuery): Promise<SqlResultSet>; // SELECT
  executeRaw(params: SqlQuery): Promise<number>; // INSERT/UPDATE
  commit(): Promise<void>; // zatwierdz
  rollback(): Promise<void>; // cofnij
};

type SqlDriverAdapter = {
  provider: 'postgres';
  adapterName: string;
  queryRaw(params: SqlQuery): Promise<SqlResultSet>; // SELECT/RETURNING
  executeRaw(params: SqlQuery): Promise<number>; // DML bez wyniku
  executeScript(script: string): Promise<void>; // wykonaj skrypt
  startTransaction(isolationLevel?: unknown): Promise<Transaction>; // rozpocznij transakcje
  dispose(): Promise<void>; // zamknij zasoby
};

export type SqlDriverAdapterFactory = {
  provider: 'postgres';
  adapterName: string;
  connect(): Promise<SqlDriverAdapter>; // nawiaz polaczenie
};

const TEXT_COLUMN_TYPE = 7; // ColumnTypeEnum.Text w typach Prisma

function mapResult(result: QueryResult): SqlResultSet {
  const columnNames = result.fields.map((field) => field.name); // nazwy kolumn
  const columnTypes = result.fields.map(() => TEXT_COLUMN_TYPE); // brak mapowania typow -> tekst
  const rows = result.rows.map((row) => columnNames.map((name) => row[name])); // wypelnij wartosci
  return {
    columnTypes,
    columnNames,
    rows,
  };
}

class PgTransaction implements Transaction {
  readonly provider = 'postgres' as const;
  readonly adapterName = 'custom-pg';
  readonly options: TransactionOptions = { usePhantomQuery: false };

  constructor(private readonly client: PoolClient) {} // klient transakcyjny

  async queryRaw(params: SqlQuery): Promise<SqlResultSet> {
    const res = await this.client.query(params.sql, params.args); // wykonaj zapytanie
    return mapResult(res); // zmapuj wynik
  }

  async executeRaw(params: SqlQuery): Promise<number> {
    const res = await this.client.query(params.sql, params.args); // wykonaj bez mapowania
    return res.rowCount ?? 0; // zwroc liczbe wierszy
  }

  async commit(): Promise<void> {
    await this.client.query('COMMIT'); // zatwierdz
    this.client.release(); // zwolnij klienta
  }

  async rollback(): Promise<void> {
    await this.client.query('ROLLBACK'); // cofniecie
    this.client.release(); // zwolnij klienta
  }
}

class PgAdapter implements SqlDriverAdapter {
  readonly provider = 'postgres' as const;
  readonly adapterName = 'custom-pg';

  constructor(private readonly pool: Pool) {} // pulka polaczen

  async queryRaw(params: SqlQuery): Promise<SqlResultSet> {
    const res = await this.pool.query(params.sql, params.args); // zapytanie bez transakcji
    return mapResult(res); // mapuj wynik
  }

  async executeRaw(params: SqlQuery): Promise<number> {
    const res = await this.pool.query(params.sql, params.args); // DML
    return res.rowCount ?? 0; // liczba wierszy
  }

  async executeScript(script: string): Promise<void> {
    await this.pool.query(script); // wykonaj skrypt SQL
  }

  async startTransaction(): Promise<Transaction> {
    const client = await this.pool.connect(); // pobierz klienta
    await client.query('BEGIN'); // start transakcji
    return new PgTransaction(client); // zwroc transakcje
  }

  async dispose(): Promise<void> {
    await this.pool.end(); // zamknij pulke
  }
}

export function createPgAdapterFactory(
  databaseUrl?: string,
): SqlDriverAdapterFactory {
  const pool = new Pool({
    connectionString: databaseUrl, // URL polaczenia
  });

  return {
    provider: 'postgres',
    adapterName: 'custom-pg',
    connect(): Promise<SqlDriverAdapter> {
      return Promise.resolve(new PgAdapter(pool)); // zwroc adapter dla Prisma
    },
  };
}
