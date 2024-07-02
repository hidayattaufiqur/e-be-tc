import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IUsecaseQuery, IUsecaseCommand } from '../book';
import { IBook } from '../models/book';

export default class HttpHandler {
  private usercaseQuery: IUsecaseQuery;
  private usercaseCommand: IUsecaseCommand;
  private router: Router;

  constructor(usercaseQuery: IUsecaseQuery, usercaseCommand: IUsecaseCommand) {
    this.usercaseQuery = usercaseQuery;
    this.usercaseCommand = usercaseCommand;
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
        return;
      }

      // check if book exists
      const data = await this.usercaseQuery.GetBook(code);

      if (!data) {
        console.error('[book][http_handler][Error]: Book not found');
        response.status(StatusCodes.NOT_FOUND).send({ message: 'Book not found', code: StatusCodes.NOT_FOUND });
        return;
      }

      await this.usercaseCommand.BorrowBook(code);

      response.status(StatusCodes.OK).send({ message: 'Book borrowed successfully', code: StatusCodes.OK });
    } catch (error) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error', code: StatusCodes.INTERNAL_SERVER_ERROR });
    }
  }

  async getBook(request: Request, response: Response): Promise<void> {
    try {
      const book = await this.usercaseQuery.GetBook(request.params.code);

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
      const books = await this.usercaseQuery.GetBooks();

      response.status(StatusCodes.OK).send({ message: 'Books retrieved successfully', code: StatusCodes.OK, data: books });
    } catch (error) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error', code: StatusCodes.INTERNAL_SERVER_ERROR });
    }
  }

  async addBook(request: Request, response: Response): Promise<void> {
    try {
      const book: IBook = request.body;

      // check if book already exists
      const data = await this.usercaseQuery.GetBook(book.code);

      if (data) {
        console.error('[book][http_handler][Error]: Book already exists');
        response.status(StatusCodes.BAD_REQUEST).send({ message: 'Book already exists', code: StatusCodes.BAD_REQUEST });
        return;
      }

      await this.usercaseCommand.AddBook(book);

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
      const data = await this.usercaseQuery.GetBook(code);

      if (!data) {
        console.error('[book][http_handler][Error]: Book not found');
        response.status(StatusCodes.NOT_FOUND).send({ message: 'Book not found', code: StatusCodes.NOT_FOUND });
      }

      const book: IBook = request.body;

      await this.usercaseCommand.UpdateBook(book, code);

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
        return;
      }

      // check if book exists
      const data = await this.usercaseQuery.GetBook(code);

      if (!data) {
        console.error('[book][http_handler][Error]: Book not found');
        response.status(StatusCodes.NOT_FOUND).send({ message: 'Book not found', code: StatusCodes.NOT_FOUND });
        return;
      }

      await this.usercaseCommand.RemoveBook(code);

      response.status(StatusCodes.OK).send({ message: 'Book removed successfully', code: StatusCodes.OK });
    } catch (error) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error', code: StatusCodes.INTERNAL_SERVER_ERROR });
    }
  }
}

