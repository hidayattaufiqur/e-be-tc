import { IBook, IBorrowRecord } from '../models/book';
import { IUsecaseQuery } from '../book';
import { PostgresRepository } from '../repositories/queries/postgresql_repository';

export class QueryUsecase implements IUsecaseQuery {
  private repository: PostgresRepository;

  constructor() {
    this.repository = new PostgresRepository();
  }

  public async GetBookById(id: number): Promise<IBook> {
    try {
      const repository = new PostgresRepository();
      const book = await repository.FindBookById(id);

      if (!book) {
        return;
      }

      const data: IBook = {
        code: book[1],
        title: book[2],
        author: book[3],
        stock: book[4]
      };

      return data;
    } catch (e) {
      console.error('[inventory][query_usecase][Error]: ', e);
      throw new Error('Failed to get book from database');
    }
  }

  public async GetBorrowRecords(memberId: number): Promise<IBorrowRecord[]> {
    try {
      const books = await this.repository.FindBorrowRecords(memberId);

      const data = books.map((book: IBorrowRecord) => {
        return {
          bookId: book[0],
          memberId: book[1],
          borrowedTime: book[2],
          moreThanSevenDays: book[3]
        };
      });

      return data;
    } catch (e) {
      console.error('[inventory][query_usecase][Error]: ', e);
      throw new Error('Failed to get book from database');
    }
  }

  public async GetBorrowRecord(bookId: number, memberId: number): Promise<IBorrowRecord> {
    try {
      const book = await this.repository.FindBorrowRecord(bookId, memberId);

      if (!book) {
        return;
      }

      const data: IBorrowRecord = {
        bookId: book[0],
        memberId: book[1],
        borrowedTime: book[2],
        moreThanSevenDays: book[3]
      };

      return data;
    } catch (e) {
      console.error('[inventory][query_usecase][Error]: ', e);
      throw new Error('Failed to get book from database');
    }
  }

  public async GetBooks(): Promise<IBook[]> {
    try {
      const books = await this.repository.FindAllBooks();

      const data = books.map((book: IBook) => {
        return {
          id: book[0],
          code: book[1],
          title: book[2],
          author: book[3],
          stock: book[4]
        };
      });

      return data;
    } catch (e) {
      console.error('[inventory][query_usecase][Error]: ', e);
      throw new Error('Failed to get books from database');
    }
  }

  public async GetBook(code: string): Promise<IBook> {
    try {
      const repository = new PostgresRepository();
      const book = await repository.FindBookByCode(code);

      if (!book) {
        return;
      }

      const data: IBook = {
        id: book[0],
        code: book[1],
        title: book[2],
        author: book[3],
        stock: book[4]
      };

      return data;
    } catch (e) {
      console.error('[inventory][query_usecase][Error]: ', e);
      throw new Error('Failed to get book from database');
    }
  }
}
