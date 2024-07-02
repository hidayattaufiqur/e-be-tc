import { IBook, IBorrowRecord } from './models/book';

export interface IUsecaseQuery {
  GetBooks(): Promise<IBook[]>;
  GetBook(code: string): Promise<IBook>;

  GetBorrowRecord(bookId: number, memberId: number): Promise<IBorrowRecord>;
}

export interface IUsecaseCommand {
  AddBook(book: IBook): Promise<void>;
  UpdateBook(book: IBook, code: string): Promise<void>;
  RemoveBook(code: string): Promise<void>;

  BorrowBook(book: IBook, memberId: number): Promise<void>;
  ReturnBook(book: IBook, memberId: number): Promise<void>;
}

export interface IPostgresRepositoryQuery {
  FindAllBooks(): Promise<IBook[]>;
  FindBookByCode(code: string): Promise<IBook>;

  FindBorrowRecord(bookId: number, memberId: number): Promise<IBorrowRecord>;
}

export interface IPostgresRepositoryCommand {
  InsertBorrowRecord(bookId: number, memberId: number): Promise<void>;
  DeleteBorrowRecord(bookId: number, memberId: number): Promise<void>;

  InsertOneBook(book: IBook): Promise<void>;
  UpdateOneBook(book: IBook, code: string): Promise<void>;
  DeleteOneBook(code: string): Promise<void>;
}
