import { connect, Client } from 'ts-postgres'; 

let client: Client;

export const init = async () => {
  try { 
    client = await connect({
      host: environment.pgHost,
      port: environment.pgPort,
      user: environment.pgUser,
      password: environment.pgPassword,
      database: environment.pgDatabase,
    });

    console.info('[postgres][init] Postgres has been connected successfully');
  } catch (e) {
    console.error('[postgres][init][Error]: ', e);
    throw new Error('Could not connect to Postgres');
  }
};

const getClient = async (): Promise<Client> => {
  try {
    if (client.closed) {
      console.info('[postgres][getClient] Postgres client is not initialized. Initializing...');
      await init();
    }

    if (client.closed) {
      throw new Error('Postgres client is not initialized. Ensure to call init() first.');
    }

    return client;
  } catch (e) {
    console.error('[postgres][getClient][Error]: ', e);
    throw new Error('Could not get Postgres client');
  }
};

export const closeClient = async (): Promise<void> => {
  try {
    if (client.closed) {
      throw new Error('Postgres client is not initialized. Ensure to call init() first.');
    }

    console.info('[postgres][closeClient] Closing Postgres client...');
    await client.end();

    console.info('[postgres][closeClient] Postgres client has been closed successfully');
  } catch (e) {
    console.error('[postgres][closeClient][Error]: ', e);
    throw new Error('Could not close Postgres client');
  }
};

export const query = async <T> (
  query: string, params?: any[] | undefined 
): Promise<T> => {
  try {
    const client = await getClient();
    const result = await client.query(query, params);

    return result.rows as T;
  } catch (e) {
    console.error('[postgres][query][Error]: ', e);
    throw new Error('Failed to execute query on Postgres');
  } 
};

export const createTables = async () => {
  try {
    query('BEGIN'); 
    query(`
      CREATE TABLE IF NOT EXISTS member (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(100) NOT NULL
      )
    `);

    query(`
      CREATE TABLE IF NOT EXISTS book (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      stock INTEGER NOT NULL
      )
    `); 

    await query('COMMIT');

  } catch (e) {
    console.error('[postgres][createTables][Error]: ', e);
    throw new Error('Failed to create tables on Postgres');
  } finally {
    await closeClient();
  }
}
