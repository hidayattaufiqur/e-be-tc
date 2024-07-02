import express from 'express'; 
import http from 'http';
import helmet from 'helmet';
import cors from 'cors';
import * as Postgres from './pkg/databases/postgres/postgres';
import bookHandler from './modules/book/handlers/http_handler';
import { QueryUsecase as BookQueryUsecase } from './modules/book/usecases/query_usecase';
import { CommandUsecase as BookCommandUsecase } from './modules/book/usecases/command_usecase';
import memberHandler from './modules/member/handlers/http_handler';
import { QueryUsecase as MemberQueryUsecase } from './modules/member/usecases/query_usecase';
import { CommandUsecase as MemberCommandUsecase } from './modules/member/usecases/command_usecase';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './pkg/swagger/swagger';

export default class App { 
  public express: express.Application; 
  public httpServer: http.Server;

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
  /**
   * @openapi
   * /:
   *   get:
   *     description: Welcome to swagger-jsdoc!
   *     responses:
   *       200:
   *         description: Returns a mysterious string.
   */
    this.express.get('/', (_req, res) => {
      res.send('Hello World!');
    });
 
    // setup Swagger
    this.express.use('/api-docs', swaggerUi.serve)
    this.express.get('/api-docs', swaggerUi.setup(swaggerSpec));

    // instantiate usecases
    const bookQueryUsecase = new BookQueryUsecase();
    const bookCommandUsecase = new BookCommandUsecase();
    const memberQueryUsecase = new MemberQueryUsecase();
    const memberCommandUsecase = new MemberCommandUsecase();

    // inject usecases into handler
    this.express.use('/api/', new memberHandler(memberQueryUsecase, memberCommandUsecase, bookQueryUsecase).init());
    this.express.use('/api/', new bookHandler(bookQueryUsecase, bookCommandUsecase, memberQueryUsecase, memberCommandUsecase).init());
  }
}

