import { IBook } from '../models/book';
import { IUsecaseCommand } from '../book';
import { PostgresRepository } from '../repositories/commands/postgresql_repository';

export class CommandUsecase implements IUsecaseCommand {
  private repository: PostgresRepository;

  constructor() {
    this.repository = new PostgresRepository();
  }

  public async BorrowBook(book: IBook, memberId: number): Promise<void> {
    try {
      const id: number = book.id;
      const code: string = book.code;

      const data: IBook = {
        code: book.code,
        title: book.title,
        author: book.author,
        stock: book.stock - 1
      };

      await this.repository.UpdateOneBook(data, code); // subtract 1 from stock

      await this.repository.InsertBorrowRecord(id, memberId);

    } catch (e) {
      console.error('[inventory][command_usecase][Error]: ', e);
      throw new Error('Failed to borrow book from database');
    }
  }

  public async ReturnBook(book: IBook, memberId: number): Promise<void> {
    try {
      const id: number = book.id;
      const code: string = book.code;

      const data: IBook = {
        code: book.code,
        title: book.title,
        author: book.author,
        stock: book.stock + 1
      };

      await this.repository.UpdateOneBook(data, code);

      await this.repository.DeleteBorrowRecord(id, memberId);

    } catch (e) {
      console.error('[inventory][command_usecase][Error]: ', e);
      throw new Error('Failed to return book from database');
    }
  }

  public async AddBook(book: IBook): Promise<void> {
    try {
      await this.repository.InsertOneBook(book);

    } catch (e) {
      console.error('[inventory][command_usecase][Error]: ', e);
      throw new Error('Failed to add book to database');
    }
  }

  public async UpdateBook(book: IBook, code: string): Promise<void> {
    try {
      await this.repository.UpdateOneBook(book, code);
    } catch (e) {
      console.error('[inventory][command_usecase][Error]: ', e);
      throw new Error('Failed to update book to database');
    }
  }

  public async RemoveBook(code: string): Promise<void> {
    try {
      await this.repository.DeleteOneBook(code);
    } catch (e) {
      console.error('[inventory][command_usecase][Error]: ', e);
      throw new Error('Failed to remove book from database');
    }
  }
}

