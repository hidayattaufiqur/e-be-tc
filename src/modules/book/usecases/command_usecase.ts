import { IBook } from '../models/book';
import { IUsecaseCommand } from '../book';
import { PostgresRepository } from '../repositories/commands/postgresql_repository';

export class CommandUsecase implements IUsecaseCommand {
  private repository: PostgresRepository;

  constructor() {
    this.repository = new PostgresRepository();
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

