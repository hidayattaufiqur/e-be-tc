import { IMember } from '../models/member';
import { StatusCodes } from 'http-status-codes';
import { Request, Response, Router } from 'express';
import { IUsecaseQuery, IUsecaseCommand } from '../member';
import { IUsecaseQuery as IUsecaseBookQuery } from '../../book/book';
import { IBorrowRecord } from '../../book/models/book';

export default class HttpHandler {
  private usecaseQuery: IUsecaseQuery;
  private usecaseCommand: IUsecaseCommand;
  private usecaseBookQuery: IUsecaseBookQuery;

  private router: Router;

  constructor(usercaseQuery: IUsecaseQuery, usercaseCommand: IUsecaseCommand, usecaseBookQuery: IUsecaseBookQuery) {
    this.usecaseQuery = usercaseQuery;
    this.usecaseCommand = usercaseCommand;
    this.usecaseBookQuery = usecaseBookQuery;

    this.router = Router();
  };

  public init(): Router {
    this.router.get('/members/:code', this.getMember.bind(this));
    this.router.get('/members', this.getMembers.bind(this));
    this.router.post('/members', this.addMember.bind(this));
    this.router.put('/members/:code', this.updateMember.bind(this));

    return this.router;
  };

  async getMember(request: Request, response: Response): Promise<void> {
    try {
      const code = request.params.code;
      const member = await this.usecaseQuery.GetMember(code);

      if (!member) {
        console.error('[member][http_handler][Error]: Member not found');
        response.status(StatusCodes.NOT_FOUND).send({ message: 'Member not found', code: StatusCodes.NOT_FOUND });
      }

      const borrowRecords: IBorrowRecord[] = await this.usecaseBookQuery.GetBorrowRecords(member.id);

      response.status(StatusCodes.OK).send({ message: 'Member retrieved successfully', code: StatusCodes.OK, data: member, borrowedBooks: borrowRecords.length });
    } catch (error) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error', code: StatusCodes.INTERNAL_SERVER_ERROR });
    }
  }

async getMembers(_request: Request, response: Response): Promise<void> {
    try {
      const members = await this.usecaseQuery.GetMembers();
      const data = [];

      for (const member of members) {
        const borrowRecords: IBorrowRecord[] = await this.usecaseBookQuery.GetBorrowRecords(member.id);
        data.push({ ...member, borrowedBooks: borrowRecords.length });
      }

      response.status(StatusCodes.OK).send({ message: 'Members retrieved successfully', code: StatusCodes.OK, data: data });
    } catch (error) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error', code: StatusCodes.INTERNAL_SERVER_ERROR });
    }
  }

async addMember(request: Request, response: Response): Promise<void> {
    try {
      const member: IMember = request.body;

      // check if member already exists
      const data = await this.usecaseQuery.GetMember(member.code);

      if (data) {
        console.error('[member][http_handler][Error]: Member already exists');
        response.status(StatusCodes.BAD_REQUEST).send({ message: 'Member already exists', code: StatusCodes.BAD_REQUEST });
      }

      await this.usecaseCommand.AddMember(member);

      response.status(StatusCodes.OK).send({ message: 'Member added successfully', code: StatusCodes.OK });
    } catch (error) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error', code: StatusCodes.INTERNAL_SERVER_ERROR });
    }
  }

  async updateMember(request: Request, response: Response): Promise<void> {
    try {
      const { code } = request.params;

      if (!code) {
        response.status(StatusCodes.BAD_REQUEST).send({ message: 'Code is required', code: StatusCodes.BAD_REQUEST });
      }

      // check if member exists
      const data = await this.usecaseQuery.GetMember(code);

      if (!data) {
        console.error('[member][http_handler][Error]: Member not found');
        response.status(StatusCodes.NOT_FOUND).send({ message: 'Member not found', code: StatusCodes.NOT_FOUND });
      }

      const member: IMember = request.body;

      await this.usecaseCommand.UpdateMember(member, code);

      response.status(StatusCodes.OK).send({ message: 'Member updated successfully', code: StatusCodes.OK });
    } catch (error) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error', code: StatusCodes.INTERNAL_SERVER_ERROR });
    }
  }
}

