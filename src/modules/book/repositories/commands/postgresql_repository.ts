import { IBook } from '../../models/book';
import { IPostgresRepositoryCommand } from '../../book';
import { closeClient, query } from '../../../../pkg/databases/postgres/postgres';

export class PostgresRepository implements IPostgresRepositoryCommand {
  public async InsertOneBook(book: IBook): Promise<void> {
    await query(
      'INSERT INTO books (code, title, author, stock) VALUES ($1, $2, $3, $4)',
      [book.code, book.title, book.author, book.stock]
    );

    await closeClient();
  }

  public async UpdateOneBook(book: IBook, code: string): Promise<void> {
    await query(
      'UPDATE books SET title = $1, author = $2, stock = $3 WHERE code = $4',
      [book.title, book.author, book.stock, code]
    );

    await closeClient();
  }

  public async DeleteOneBook(code: string): Promise<void> {
    await query(
      'DELETE FROM books WHERE code = $1',
      [code]
    );

    await closeClient();
  }
}
