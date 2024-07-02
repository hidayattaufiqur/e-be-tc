import { IBook, IBorrowRecord } from '../../models/book';
import { IPostgresRepositoryQuery } from '../../book';
import { closeClient, query } from '../../../../pkg/databases/postgres/postgres';

export class PostgresRepository implements IPostgresRepositoryQuery {
  public async FindBorrowRecord(bookId: number, memberId: number): Promise<IBorrowRecord> {
    const result = await query<IBook>(
      ` SELECT 
            book_id, member_id, borrowed_time, (CURRENT_TIMESTAMP - borrowed_time > INTERVAL '7 days') AS moreThanSevenDays
        FROM 
            member_book WHERE book_id = $1 AND member_id = $2
      `,
      [bookId, memberId]
    );

    await closeClient();

    return result[0];
  }

  public async FindAllBooks(): Promise<IBook[]> {
    const result = await query<IBook[]>(
      'SELECT * FROM books'
    );

    await closeClient();

    return result;
  }

  public async FindBookByCode(code: string): Promise<IBook> {
    const result = await query<IBook>(
      'SELECT * FROM books WHERE code = $1 AND stock > 0', // only return books that are in stock
      [code]
    );

    await closeClient();

    return result[0];
  }
}
