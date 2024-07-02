import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IUsecaseQuery, IUsecaseCommand } from '../book';
import { IBook } from '../models/book';

export default class HttpHandler {
  private usecaseQuery: IUsecaseQuery;
  private usecaseCommand: IUsecaseCommand;
  private router: Router;

  constructor(usercaseQuery: IUsecaseQuery, usercaseCommand: IUsecaseCommand) {
    this.usecaseQuery = usercaseQuery;
    this.usecaseCommand = usercaseCommand;
    this.router = Router();
  };

  public init(): Router {
    this.router.get('/books/:code', this.getBook.bind(this));
    this.router.get('/books', this.getBooks.bind(this));

    this.router.post('/books', this.addBook.bind(this));
    this.router.put('/books/:code', this.updateBook.bind(this));
    this.router.delete('/books/:code', this.removeBook.bind(this));

    return this.router;
  };

  async borrowBook(request: Request, response: Response): Promise<void> {
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

      // TODO: implement member and check if they are penalized

      // TODO: implement member and get the member id
      await this.usecaseCommand.BorrowBook(data, memberId);

      response.status(StatusCodes.OK).send({ message: 'Book borrowed successfully', code: StatusCodes.OK });
    } catch (error) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error', code: StatusCodes.INTERNAL_SERVER_ERROR });
    }
  }

  async returnBook(request: Request, response: Response): Promise<void> {
    try {
      const { bookId } = request.params;

      if (!bookId) {
        response.status(StatusCodes.BAD_REQUEST).send({ message: 'Book ID is required', code: StatusCodes.BAD_REQUEST });
      }

      const data = await this.usecaseQuery.GetBorrowRecord(parseInt(bookId), memberId);

      if (!data) {
        console.error('[book][http_handler][Error]: Member has not borrowed the book');
        response.status(StatusCodes.NOT_FOUND).send({ message: 'Member has not borrowed the book', code: StatusCodes.NOT_FOUND });
      }

      if (data[3]) {
        console.error('[book][http_handler][Error]: Member will be penalized in 3 days due to the late return');
        // TODO: implement member and update member's isPenalized field
      }

      // TODO: implement member and get the member id
      await this.usecaseCommand.ReturnBook(data, memberId);

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
      }

      // check if book exists
      const data = await this.usecaseQuery.GetBook(code);

      if (!data) {
        console.error('[book][http_handler][Error]: Book not found');
        response.status(StatusCodes.NOT_FOUND).send({ message: 'Book not found', code: StatusCodes.NOT_FOUND });
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

