import express from 'express'; 
import http from 'http';
import helmet from 'helmet';
import cors from 'cors';
import * as Postgres from './pkg/databases/postgres/postgres';
import bookHandler from './modules/book/handlers/http_handler';
import { IUsecaseQuery } from './modules/book/book';
import { QueryUsecase as BookQueryUsecase } from './modules/book/usecases/query_usecase';

export default class App { 
  public express: express.Application; 
  public httpServer: http.Server;
  private usercaseQuery: IUsecaseQuery;

  public async init(): Promise<void> {
    this.express = express();
    
    this.httpServer = http.createServer(this.express);

    this.middleware();

    this.routes();
  }

  private async middleware(): Promise<void> {
    this.express.use(helmet({ contentSecurityPolicy: false }));
    this.express.use(express.json({ limit: '100mb' }));
    this.express.use(express.urlencoded({ extended: true, limit: '100mb' }));

    const corsOptions = {
      origin: ['http://localhost:3000', 'http://localhost:8080'],
    };

    this.express.use(cors(corsOptions));
    await Postgres.init();
    await Postgres.createTables(); 
  }

  private routes(): void {
    this.express.get('/', (_req, res) => {
      res.send('Hello World!');
    });

    const bookQueryUsecase = new BookQueryUsecase();
    this.express.use('/api/', new bookHandler(bookQueryUsecase).init());

    // this.express.use('/api', registerRoutes);
  }
}

