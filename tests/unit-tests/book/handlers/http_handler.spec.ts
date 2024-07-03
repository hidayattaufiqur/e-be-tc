import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import HttpHandler from '../../../../src/modules/book/handlers/http_handler';
import { IUsecaseQuery, IUsecaseCommand } from '../../../../src/modules/book/book';
import { IUsecaseQuery as IUsecaseMemberQuery, IUsecaseCommand as IUsecaseMemberCommand } from '../../../../src/modules/member/member';
import { IBook, IBorrowRecord } from '../../../../src/modules/book/models/book';

import { expect, it, describe, jest, beforeEach } from '@jest/globals';
import { IMember } from '../../../../src/modules/member/models/member';

// Mock dependencies
const mockUsecaseQuery: jest.Mocked<IUsecaseQuery> = {
  GetBook: jest.fn(),
  GetBooks: jest.fn(),
  GetBorrowRecords: jest.fn(),
  GetBorrowRecord: jest.fn(),
  GetInStockBooks: jest.fn(),
  GetBookById: jest.fn(),
};

const mockUsecaseCommand: jest.Mocked<IUsecaseCommand> = {
  AddBook: jest.fn(),
  UpdateBook: jest.fn(),
  RemoveBook: jest.fn(),
  BorrowBook: jest.fn(),
  ReturnBook: jest.fn(),
};

const mockUsecaseMemberQuery: jest.Mocked<IUsecaseMemberQuery> = {
  GetMember: jest.fn(),
  GetMemberById: jest.fn(),
  GetMembers: jest.fn(),
};

const mockUsecaseMemberCommand: jest.Mocked<IUsecaseMemberCommand> = {
  AddMember: jest.fn(),
  UpdateMember: jest.fn(),
};

// Create instances of HttpHandler with mocked dependencies
const httpHandler = new HttpHandler(mockUsecaseQuery, mockUsecaseCommand, mockUsecaseMemberQuery, mockUsecaseMemberCommand);

describe('HttpHandler', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis() as unknown as Response['status'],
      send: jest.fn() as unknown as Response['send'],
    };
    next = jest.fn();
  });

  describe('borrowBook', () => {
    it('should borrow a book if all conditions are met', async () => {
      const book: IBook = { code: 'JK-45', title: 'Harry Potter', author: 'J.K Rowling', stock: 1 };
      const member: IMember = { code: 'M001', name: 'John Doe', id: 1, penalized_at: null };
      const borrowRecords: IBorrowRecord[] = [];

      mockUsecaseQuery.GetBook.mockResolvedValueOnce(book);
      mockUsecaseMemberQuery.GetMember.mockResolvedValueOnce(member);
      mockUsecaseQuery.GetBorrowRecords.mockResolvedValueOnce(borrowRecords);

      req.params = { bookCode: 'JK-45' };
      req.body = { memberCode: 'M001' };

      await httpHandler.borrowBook(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith({ message: 'Book borrowed successfully', code: StatusCodes.OK });
    });

    it('should return 404 if book is not available', async () => {
      mockUsecaseQuery.GetBook.mockResolvedValueOnce(null);

      req.params = { bookCode: 'JK-45' };
      req.body = { memberCode: 'M001' };

      await httpHandler.borrowBook(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(res.send).toHaveBeenCalledWith({ message: 'Stock is not available', code: StatusCodes.NOT_FOUND });
    });

    it('should return 400 if member is penalized', async () => {
      const book: IBook = { code: 'JK-45', title: 'Harry Potter', author: 'J.K Rowling', stock: 1 };
      const member: IMember = { code: 'M001', name: 'John Doe', id: 1, penalized_at: new Date() };
      
      mockUsecaseQuery.GetBook.mockResolvedValueOnce(book);
      mockUsecaseMemberQuery.GetMember.mockResolvedValueOnce(member);

      req.params = { bookCode: 'JK-45' };
      req.body = { memberCode: 'M001' };

      await httpHandler.borrowBook(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.send).toHaveBeenCalledWith({ message: 'Member is penalized.', code: StatusCodes.BAD_REQUEST });
    });

    it('should return 400 if member has borrowed more than one book', async () => {
      const book: IBook = { code: 'JK-45', title: 'Harry Potter', author: 'J.K Rowling', stock: 1 };
      const member: IMember = { code: 'M001', name: 'John Doe', id: 1, penalized_at: null };
      const borrowRecords: IBorrowRecord[] = [{ bookId: 1, memberId: 1, borrowedTime: new Date(), moreThanSevenDays: false }, { bookId: 2, memberId: 1, borrowedTime: new Date(), moreThanSevenDays: false }];

      mockUsecaseQuery.GetBook.mockResolvedValueOnce(book);
      mockUsecaseMemberQuery.GetMember.mockResolvedValueOnce(member);
      mockUsecaseQuery.GetBorrowRecords.mockResolvedValueOnce(borrowRecords);

      req.params = { bookCode: 'JK-45' };
      req.body = { memberCode: 'M001' };

      await httpHandler.borrowBook(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.send).toHaveBeenCalledWith({ message: 'Member has more than one books borrowed.', code: StatusCodes.BAD_REQUEST });
    });

    it('should return 500 if there is an error', async () => {
      mockUsecaseQuery.GetBook.mockRejectedValueOnce(new Error('Test Error'));

      req.params = { bookCode: 'JK-45' };
      req.body = { memberCode: 'M001' };

      await httpHandler.borrowBook(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith({ message: 'Internal server error', code: StatusCodes.INTERNAL_SERVER_ERROR });
    });
  });

  describe('returnBook', () => {
    it('should return a book if all conditions are met', async () => {
      const book: IBook = { code: 'JK-45', title: 'Harry Potter', author: 'J.K Rowling', stock: 1 };
      const member: IMember = { code: 'M001', name: 'John Doe', id: 1, penalized_at: null };
      const borrowRecord: IBorrowRecord = { bookId: 1, memberId: 1, borrowedTime: new Date(), moreThanSevenDays: false };

      mockUsecaseQuery.GetBook.mockResolvedValueOnce(book);
      mockUsecaseMemberQuery.GetMember.mockResolvedValueOnce(member);
      mockUsecaseQuery.GetBorrowRecord.mockResolvedValueOnce(borrowRecord);

      req.params = { bookCode: 'JK-45' };
      req.body = { memberCode: 'M001' };

      await httpHandler.returnBook(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith({ message: 'Book returned successfully', code: StatusCodes.OK });
    });

    it('should return 404 if member has not borrowed the book', async () => {
      const book: IBook = { code: 'JK-45', title: 'Harry Potter', author: 'J.K Rowling', stock: 1 };
      const member: IMember = { code: 'M001', name: 'John Doe', id: 1, penalized_at: null };
      
      mockUsecaseQuery.GetBook.mockResolvedValueOnce(book);
      mockUsecaseMemberQuery.GetMember.mockResolvedValueOnce(member);
      mockUsecaseQuery.GetBorrowRecord.mockResolvedValueOnce(null);

      req.params = { bookCode: 'JK-45' };
      req.body = { memberCode: 'M001' };

      await httpHandler.returnBook(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(res.send).toHaveBeenCalledWith({ message: 'Member has not borrowed the book', code: StatusCodes.NOT_FOUND });
    });

    it('should penalize member if book is returned late', async () => {
      const book: IBook = { code: 'JK-45', title: 'Harry Potter', author: 'J.K Rowling', stock: 1 };
      const member: IMember = { code: 'M001', name: 'John Doe', id: 1, penalized_at: null };
      const borrowRecord: IBorrowRecord = { bookId: 1, memberId: 1, borrowedTime: new Date(new Date().getTime() - 8 * 24 * 60 * 60 * 1000), moreThanSevenDays: true };

      mockUsecaseQuery.GetBook.mockResolvedValueOnce(book);
      mockUsecaseMemberQuery.GetMember.mockResolvedValueOnce(member);
      mockUsecaseQuery.GetBorrowRecord.mockResolvedValueOnce(borrowRecord);

      req.params = { bookCode: 'JK-45' };
      req.body = { memberCode: 'M001' };

      await httpHandler.returnBook(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith({ message: 'Book returned successfully', code: StatusCodes.OK });
      expect(mockUsecaseMemberCommand.UpdateMember).toHaveBeenCalled();
    });

    it('should return 500 if there is an error', async () => {
      mockUsecaseQuery.GetBook.mockRejectedValueOnce(new Error('Test Error'));

      req.params = { bookCode: 'JK-45' };
      req.body = { memberCode: 'M001' };

      await httpHandler.returnBook(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith({ message: 'Internal server error', code: StatusCodes.INTERNAL_SERVER_ERROR });
    });
  });

  describe('getBooks', () => {
    it('should return all books', async () => {
      const books: IBook[] = [{ code: 'JK-45', title: 'Harry Potter', author: 'J.K Rowling', stock: 1 }, { code: 'JK-46', title: 'Harry Potter and the Sorcerer\'s Stone', author: 'J.K Rowling', stock: 1 }];

      mockUsecaseQuery.GetBooks.mockResolvedValueOnce(books);

      await httpHandler.getBooks(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith({ message: 'Books retrieved successfully', code: StatusCodes.OK, data: books });
    });

    it('should return 500 if there is an error', async () => {
      mockUsecaseQuery.GetBooks.mockRejectedValueOnce(new Error('Test Error'));

      await httpHandler.getBooks(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith({ message: 'Internal server error', code: StatusCodes.INTERNAL_SERVER_ERROR });
    });
  });

  describe('getInStockBooks', () => {
    it('should return all in stock books', async () => {
      const books: IBook[] = [{ code: 'JK-45', title: 'Harry Potter', author: 'J.K Rowling', stock: 1 }, { code: 'JK-46', title: 'Harry Potter and the Sorcerer\'s Stone', author: 'J.K Rowling', stock: 1 }];

      mockUsecaseQuery.GetInStockBooks.mockResolvedValueOnce(books);

      await httpHandler.getInStockBooks(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith({ message: 'Books retrieved successfully', code: StatusCodes.OK, data: books });
    });

    it('should return 500 if there is an error', async () => {
      mockUsecaseQuery.GetInStockBooks.mockRejectedValueOnce(new Error('Test Error'));

      await httpHandler.getInStockBooks(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith({ message: 'Internal server error', code: StatusCodes.INTERNAL_SERVER_ERROR });
    });
  });
});
