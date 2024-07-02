import { IBook } from './models/book';

export interface IUsecaseQuery {
  GetBooks(): Promise<IBook[]>;
  GetBook(code: string): Promise<IBook>;
}

export interface IUsecaseCommand {
  AddBook(book: IBook): Promise<void>;
  UpdateBook(book: IBook): Promise<void>;
  RemoveBook(book: IBook): Promise<void>;
}

export interface IPostgresRepositoryQuery {
  FindAllBooks(): Promise<IBook[]>;
  FindBookByCode(code: string): Promise<IBook>;
}

export interface IPostgresRepositoryCommand {
  InsertOneBook(book: IBook): Promise<void>;
  UpdateOneBook(book: IBook): Promise<void>;
  DeleteOneBook(book: IBook): Promise<void>;
}
