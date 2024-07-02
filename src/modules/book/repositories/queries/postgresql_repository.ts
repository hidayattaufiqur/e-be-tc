import { IBook } from '../../models/book';
import { IPostgresRepositoryQuery } from '../../book';
import { closeClient, query } from '../../../../pkg/databases/postgres/postgres';

export class PostgresRepository implements IPostgresRepositoryQuery {
  public async FindAllBooks(): Promise<IBook[]> {
    const result = await query<IBook[]>(
      'SELECT * FROM books'
    );

    await closeClient();

    return result;
  }

  public async FindBookByCode(code: string): Promise<IBook> {
    const result = await query<IBook>(
      'SELECT * FROM books WHERE code = $1',
      [code]
    );

    await closeClient();

    return result[0];
  }
}
