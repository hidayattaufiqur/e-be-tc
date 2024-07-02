import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IUsecaseQuery } from '../book';

export default class HttpHandler {
  private usercaseQuery: IUsecaseQuery;
  private router: Router;

  constructor(usercaseQuery: IUsecaseQuery) {
    this.usercaseQuery = usercaseQuery;
    this.router = Router();
  };

  public init(): Router {
    this.router.get('/books/:code', this.getBook.bind(this));
    this.router.get('/books', this.getBooks.bind(this));

    return this.router;
  };

  async getBook(request: Request, response: Response): Promise<void> {
    try {
      const book = await this.usercaseQuery.GetBook(request.params.code);
      response.status(StatusCodes.OK).send(book);
    } catch (error) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
    }
  }

  async getBooks(_request: Request, response: Response): Promise<void> {
    try {
      const books = await this.usercaseQuery.GetBooks();
      response.status(StatusCodes.OK).send(books);
    } catch (error) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
    }
  }
}

