import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IUsecaseQuery, IUsecaseCommand } from '../book';
import { IUsecaseQuery as IUsecaseMemberQuery, IUsecaseCommand as IUsecaseMemberCommand } from '../../member/member';
import { IBook, IBorrowRecord } from '../models/book';

export default class HttpHandler {
  private usecaseQuery: IUsecaseQuery;
  private usecaseCommand: IUsecaseCommand;
  private usecaseMemberQuery: IUsecaseMemberQuery;
  private usecaseMemberCommand: IUsecaseMemberCommand;

  private router: Router;

  constructor(usecaseQuery: IUsecaseQuery, usecaseCommand: IUsecaseCommand, usecaseMemberQuery: IUsecaseMemberQuery, usecaseMemberCommand: IUsecaseMemberCommand) {
    this.usecaseQuery = usecaseQuery;
    this.usecaseCommand = usecaseCommand;
    this.usecaseMemberQuery = usecaseMemberQuery;
    this.usecaseMemberCommand = usecaseMemberCommand;

    this.router = Router();
  };

  public init(): Router {
    this.router.get('/books/:code', this.getBook.bind(this));
    this.router.get('/books', this.getBooks.bind(this));
    this.router.post('/books', this.addBook.bind(this));
    this.router.put('/books/:code', this.updateBook.bind(this));
    this.router.delete('/books/:code', this.removeBook.bind(this));

    this.router.post('/books/:bookCode/borrow', this.borrowBook.bind(this));
    this.router.post('/books/:code/return', this.returnBook.bind(this));

    return this.router;
  };

  async borrowBook(request: Request, response: Response): Promise<void> {
    try {
      const { bookCode } = request.params;
      const { memberCode } = request.body;

      if (!memberCode || !bookCode) {
        response.status(StatusCodes.BAD_REQUEST).send({ message: 'Code is required', code: StatusCodes.BAD_REQUEST });
        return;
      }

      // check if book exists
      const data = await this.usecaseQuery.GetBook(bookCode);

      if (!data) {
        console.error('[book][http_handler][Error]: Stock is not available');
        response.status(StatusCodes.NOT_FOUND).send({ message: 'Stock is not available', code: StatusCodes.NOT_FOUND });
        return;
      }

      const memberData = await this.usecaseMemberQuery.GetMember(memberCode);
      const isPenalized: Date = memberData.penalized_at;

      if (isPenalized) { // check if member is penalized and if so, check if the penalized date is less than 3 days ago
        const penalizedDate = new Date(isPenalized);
        const currentDate = new Date();
        const timeDifference = currentDate.getTime() - penalizedDate.getTime();
        const daysDifference = timeDifference / (1000 * 3600 * 24); // convert milliseconds to days

        if (daysDifference < 3) {
          console.error('[book][http_handler][Error]: Member is penalized.');
          response.status(StatusCodes.BAD_REQUEST).send({ message: 'Member is penalized.', code: StatusCodes.BAD_REQUEST });
          return;
        };
      };

      const memberId = memberData.id;

      const borrowRecords: IBorrowRecord[] = await this.usecaseQuery.GetBorrowRecords(memberId);

      if (borrowRecords.length > 1) {
        console.error('[book][http_handler][Error]: Member has more than one books borrowed.');
        response.status(StatusCodes.BAD_REQUEST).send({ message: 'Member has more than one books borrowed.', code: StatusCodes.BAD_REQUEST });
        return;
      }

      await this.usecaseCommand.BorrowBook(data, memberId); // only borrow book if all conditions are met

      response.status(StatusCodes.OK).send({ message: 'Book borrowed successfully', code: StatusCodes.OK });
    } catch (error) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error', code: StatusCodes.INTERNAL_SERVER_ERROR });
    }
  }

  async returnBook(request: Request, response: Response): Promise<void> {
    try {
      const { memberId, bookId } = request.params;

      if (!bookId || !memberId) {
        response.status(StatusCodes.BAD_REQUEST).send({ message: 'Book and member IDs are required', code: StatusCodes.BAD_REQUEST });
        return;
      }

      const data = await this.usecaseQuery.GetBorrowRecord(parseInt(bookId), parseInt(memberId));

      if (!data) {
        console.error('[book][http_handler][Error]: Member has not borrowed the book');
        response.status(StatusCodes.NOT_FOUND).send({ message: 'Member has not borrowed the book', code: StatusCodes.NOT_FOUND });
        return;
      }

      if (data[3]) {
        console.error('[book][http_handler][Error]: Member will be penalized in 3 days due to the late return');
        let memberData = await this.usecaseMemberQuery.GetMemberById(parseInt(memberId));
        memberData[3] = new Date();

        await this.usecaseMemberCommand.UpdateMember(memberData, memberData[0]);
      }

      const bookData = await this.usecaseQuery.GetBookById(parseInt(bookId));
      await this.usecaseCommand.ReturnBook(bookData, parseInt(memberId));

      response.status(StatusCodes.OK).send({ message: 'Book returned successfully', code: StatusCodes.OK });
    } catch (error) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error', code: StatusCodes.INTERNAL_SERVER_ERROR });
    }
  }

  async getBook(request: Request, response: Response): Promise<void> {
    try {
      const book = await this.usecaseQuery.GetBook(request.params.code);

      if (!book) {
        console.error('[book][http_handler][Error]: Book not found');
        response.status(StatusCodes.NOT_FOUND).send({ message: 'Book not found', code: StatusCodes.NOT_FOUND });
        return;
      }

      response.status(StatusCodes.OK).send({ message: 'Book retrieved successfully', code: StatusCodes.OK, data: book });
    } catch (error) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error', code: StatusCodes.INTERNAL_SERVER_ERROR });
    }
  }

  async getBooks(_request: Request, response: Response): Promise<void> {
    try {
      const books = await this.usecaseQuery.GetBooks();

      response.status(StatusCodes.OK).send({ message: 'Books retrieved successfully', code: StatusCodes.OK, data: books });
    } catch (error) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error', code: StatusCodes.INTERNAL_SERVER_ERROR });
    }
  }

  async addBook(request: Request, response: Response): Promise<void> {
    try {
      const book: IBook = request.body;

      // check if book already exists
      const data = await this.usecaseQuery.GetBook(book.code);

      if (data) {
        console.error('[book][http_handler][Error]: Book already exists');
        response.status(StatusCodes.BAD_REQUEST).send({ message: 'Book already exists', code: StatusCodes.BAD_REQUEST });
        return;
      }

      await this.usecaseCommand.AddBook(book);

      response.status(StatusCodes.OK).send({ message: 'Book added successfully', code: StatusCodes.OK });
    } catch (error) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error', code: StatusCodes.INTERNAL_SERVER_ERROR });
    }
  }

  async updateBook(request: Request, response: Response): Promise<void> {
    try {
      const { code } = request.params;

      if (!code) {
        response.status(StatusCodes.BAD_REQUEST).send({ message: 'Code is required', code: StatusCodes.BAD_REQUEST });
        return;
      }

      // check if book exists
      const data = await this.usecaseQuery.GetBook(code);

      if (!data) {
        console.error('[book][http_handler][Error]: Book not found');
        response.status(StatusCodes.NOT_FOUND).send({ message: 'Book not found', code: StatusCodes.NOT_FOUND });
        return;
      }

      const book: IBook = request.body;

      await this.usecaseCommand.UpdateBook(book, code);

      response.status(StatusCodes.OK).send({ message: 'Book updated successfully', code: StatusCodes.OK });
    } catch (error) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error', code: StatusCodes.INTERNAL_SERVER_ERROR });
    }
  }

  async removeBook(request: Request, response: Response): Promise<void> {
    try {
      const { code } = request.params;

      if (!code) {
        response.status(StatusCodes.BAD_REQUEST).send({ message: 'Code is required', code: StatusCodes.BAD_REQUEST });
      }

      // check if book exists
      const data = await this.usecaseQuery.GetBook(code);

      if (!data) {
        console.error('[book][http_handler][Error]: Book not found');
        response.status(StatusCodes.NOT_FOUND).send({ message: 'Book not found', code: StatusCodes.NOT_FOUND });
      }

      await this.usecaseCommand.RemoveBook(code);

      response.status(StatusCodes.OK).send({ message: 'Book removed successfully', code: StatusCodes.OK });
    } catch (error) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error', code: StatusCodes.INTERNAL_SERVER_ERROR });
    }
  }
}

