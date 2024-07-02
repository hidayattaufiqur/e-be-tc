import { IBook } from '../models/book';
import { IUsecaseQuery } from '../book';
import { PostgresRepository } from '../repositories/queries/postgresql_repository';

export class QueryUsecase implements IUsecaseQuery {
  public async GetBooks(): Promise<IBook[]> {
    try {
      const repository = new PostgresRepository();
      const books = await repository.FindAllBooks();

      return books;
    } catch (e) {
      console.error('[inventory][query_usecase][Error]: ', e);
      throw new Error('Failed to get books from database');
    }
  }

  public async GetBook(code: string): Promise<IBook> {
    try {
      const repository = new PostgresRepository();
      const book = await repository.FindBookByCode(code);

      return book;
    } catch (e) {
      console.error('[inventory][query_usecase][Error]: ', e);
      throw new Error('Failed to get book from database');
    }
  }
}
