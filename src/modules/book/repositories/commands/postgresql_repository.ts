import { IBook } from '../../models/book';
import { IPostgresRepositoryCommand } from '../../book';
import { closeClient, query } from '../../../../pkg/databases/postgres/postgres';

export class PostgresRepository implements IPostgresRepositoryCommand {
  public async InsertBorrowRecord(bookId: number, memberId: number): Promise<void> {
    await query(
      'INSERT INTO member_book (member_id, book_id, borrowed_time) VALUES ($1, $2, DATE(NOW()))',
      [memberId, bookId]
    );

    await closeClient();
  }

  public async DeleteBorrowRecord(bookId: number, memberId: number): Promise<void> {
    await query(
      'DELETE FROM member_book WHERE member_id = $1 AND book_id = $2',
      [memberId, bookId]
    );

    await closeClient();
  }

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
    const bookData = await query('SELECT id FROM books WHERE code = $1', [code]); // get book row by code
    const bookId = bookData[0]; // need to extract book id

    const result = await query(
      'SELECT COUNT(*) FROM member_book WHERE book_id = $1', // make sure book is not currently borrowed
      [bookId]);

    if (result[0] > 0) {
      console.error('[book][postgresql_repository][Error]: Book is being borrowed');
      await closeClient();
      throw new Error('Book is being borrowed');
    }

    await query(
      'DELETE FROM books WHERE code = $1',
      [code]
    );

    await closeClient();
  }
}
