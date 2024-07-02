import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import HttpHandler from '../../../../src/modules/book/handlers/http_handler';
import { IUsecaseQuery, IUsecaseCommand } from '../../../../src/modules/book/book';
import { IBook } from '../../../../src/modules/book/models/book';

import { expect, it, describe, jest, beforeEach } from '@jest/globals';

// Mock dependencies
const mockUsecaseQuery: jest.Mocked<IUsecaseQuery> = {
  GetBook: jest.fn(),
  GetBooks: jest.fn(),
};

const mockUsecaseCommand: jest.Mocked<IUsecaseCommand> = {
  AddBook: jest.fn(),
  UpdateBook: jest.fn(),
  RemoveBook: jest.fn(),
};

// Create instances of HttpHandler with mocked dependencies
const httpHandler = new HttpHandler(mockUsecaseQuery, mockUsecaseCommand);

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

  describe('getBook', () => {
    it('should return a book if found', async () => {
      const book: IBook = { code: 'JK-45', title: 'Harry Potter', author: 'J.K Rowling', stock: 1 };
      mockUsecaseQuery.GetBook.mockResolvedValueOnce(book);

      req.params = { code: 'JK-45' };

      await httpHandler.getBook(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Book retrieved successfully',
        code: StatusCodes.OK,
        data: book,
      });
    });

    it('should return 404 if book not found', async () => {
      mockUsecaseQuery.GetBook.mockResolvedValueOnce(null);

      req.params = { code: 'JK-45' };

      await httpHandler.getBook(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Book not found',
        code: StatusCodes.NOT_FOUND,
      });
    });

    it('should return 500 if there is an error', async () => {
      mockUsecaseQuery.GetBook.mockRejectedValueOnce(new Error('Test Error'));

      req.params = { code: 'JK-45' };

      await httpHandler.getBook(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Internal server error',
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    });
  });

  // TODO: add tests for getBooks, addBook, updateBook, removeBook
});

