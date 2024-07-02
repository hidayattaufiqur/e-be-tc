import { IBook } from './models/book';

export interface IUsecaseQuery {
  GetBooks(): Promise<IBook[]>;
  GetBook(code: string): Promise<IBook>;
}

export interface IUsecaseCommand {
  AddBook(book: IBook): Promise<void>;
  UpdateBook(book: IBook, code: string): Promise<void>;
  RemoveBook(code: string): Promise<void>;

  BorrowBook(code: string): Promise<void>;
}

export interface IPostgresRepositoryQuery {
  FindAllBooks(): Promise<IBook[]>;
  FindBookByCode(code: string): Promise<IBook>;
}

export interface IPostgresRepositoryCommand {
  InsertOneBook(book: IBook): Promise<void>;
  UpdateOneBook(book: IBook, code: string): Promise<void>;
  DeleteOneBook(code: string): Promise<void>;
}
