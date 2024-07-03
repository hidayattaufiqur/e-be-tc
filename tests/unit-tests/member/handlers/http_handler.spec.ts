import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import HttpHandler from '../../../../src/modules/member/handlers/http_handler';
import { IUsecaseQuery, IUsecaseCommand } from '../../../../src/modules/member/member';
import { IUsecaseQuery as IUsecaseBookQuery } from '../../../../src/modules/book/book';
import { IMember } from '../../../../src/modules/member/models/member';

import { expect, it, describe, jest, beforeEach } from '@jest/globals';
import { IBorrowRecord } from '../../../../src/modules/book/models/book';

// Mock dependencies
const mockUsecaseQuery: jest.Mocked<IUsecaseQuery> = {
  GetMember: jest.fn(),
  GetMembers: jest.fn(),
  GetMemberById: jest.fn(),
};

const mockUsecaseCommand: jest.Mocked<IUsecaseCommand> = {
  AddMember: jest.fn(),
  UpdateMember: jest.fn(),
};

const mockUsecaseBookQuery: jest.Mocked<IUsecaseBookQuery> = {
  GetBook: jest.fn(),
  GetBooks: jest.fn(),
  GetBookById: jest.fn(),
  GetInStockBooks: jest.fn(),
  GetBorrowRecord: jest.fn(),
  GetBorrowRecords: jest.fn(),
};

// Create instances of HttpHandler with mocked dependencies
const httpHandler = new HttpHandler(mockUsecaseQuery, mockUsecaseCommand, mockUsecaseBookQuery);

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

  describe('addMember', () => {
    it('should add a member if all conditions are met', async () => {
      const member: IMember = { code: 'M001', name: 'John Doe', id: 1, penalized_at: null };

      mockUsecaseQuery.GetMember.mockResolvedValueOnce(null);

      req.body = { code: 'M001', name: 'John Doe' };

      await httpHandler.addMember(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith({ message: 'Member added successfully', code: StatusCodes.OK });
    });

    it('should return 400 if member already exists', async () => {
      const member: IMember = { code: 'M001', name: 'John Doe', id: 1, penalized_at: null };

      mockUsecaseQuery.GetMember.mockResolvedValueOnce(member);

      req.body = { code: 'M001', name: 'John Doe' };

      await httpHandler.addMember(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.send).toHaveBeenCalledWith({ message: 'Member already exists', code: StatusCodes.BAD_REQUEST });
    }); 
  });

  describe('getMember', () => {
    it('should return a member if all conditions are met', async () => {
      const member: IMember = { code: 'M001', name: 'John Doe', id: 1, penalized_at: null };
      const borrowRecords: IBorrowRecord[] = [{ memberId: 1, bookId: 1, borrowedTime: new Date(), moreThanSevenDays: false }];

      mockUsecaseQuery.GetMember.mockResolvedValueOnce(member);
      mockUsecaseBookQuery.GetBorrowRecords.mockResolvedValueOnce(borrowRecords);

      req.params = { code: 'M001' };

      await httpHandler.getMember(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith({ message: 'Member retrieved successfully', code: StatusCodes.OK, data: member, borrowedBooks: borrowRecords.length });
    });

    it('should return 404 if member is not found', async () => {
      mockUsecaseQuery.GetMember.mockResolvedValueOnce(null);

      req.params = { code: 'M001' };

      await httpHandler.getMember(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(res.send).toHaveBeenCalledWith({ message: 'Member not found', code: StatusCodes.NOT_FOUND });
    });
  });

  describe('getMembers', () => {
    it('should return all members and their number of books borrowed', async () => {
      const members: IMember[] = [{ code: 'M001', name: 'John Doe', id: 1, penalized_at: null }, { code: 'M002', name: 'Jane Doe', id: 2, penalized_at: null }];
      const borrowRecords: IBorrowRecord[] = [{ memberId: 1, bookId: 1, borrowedTime: new Date(), moreThanSevenDays: false }, { memberId: 2, bookId: 1, borrowedTime: new Date(), moreThanSevenDays: true} ];

      mockUsecaseQuery.GetMembers.mockResolvedValueOnce(members);
      mockUsecaseBookQuery.GetBorrowRecords.mockResolvedValueOnce(borrowRecords);

      const data = members.map(member => ({
        ...member,
        borrowedBooks: borrowRecords.filter(record => record.memberId === member.id).length
      }));

      await httpHandler.getMembers(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.send).toHaveBeenCalledWith({ message: 'Members retrieved successfully', code: StatusCodes.OK, data: data});
    });

    it('should return 500 if there is an error', async () => {
      mockUsecaseQuery.GetMembers.mockRejectedValueOnce(new Error('Test Error'));

      await httpHandler.getMembers(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith({ message: 'Internal server error', code: StatusCodes.INTERNAL_SERVER_ERROR });
    });
  });
});
