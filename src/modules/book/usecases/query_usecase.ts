import { IBook } from '../models/book';
import { IUsecaseQuery } from '../book';
import { PostgresRepository } from '../repositories/queries/postgresql_repository';

export class QueryUsecase implements IUsecaseQuery {
  private repository: PostgresRepository;

  constructor() {
    this.repository = new PostgresRepository();
  }

  public async GetBooks(): Promise<IBook[]> {
    try {
      const books = await this.repository.FindAllBooks();

      const data = books.map((book: IBook) => {
        return {
          code: book[0],
          title: book[1],
          author: book[2],
          stock: book[3]
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
        code: book[0],
        title: book[1],
        author: book[2],
        stock: book[3]
      };

      return data;
    } catch (e) {
      console.error('[inventory][query_usecase][Error]: ', e);
      throw new Error('Failed to get book from database');
    }
  }
}
