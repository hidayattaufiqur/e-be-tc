import IEnvironment from './environment.interface';
import dotenv from 'dotenv';

dotenv.config();

class Environment implements IEnvironment {
  public readonly pgHost: string;
  public readonly pgPort: number;
  public readonly pgUser: string;
  public readonly pgPassword: string;
  public readonly pgDatabase: string;

  public readonly port: number;

  constructor() {
    this.pgHost = process.env.PG_HOST || 'localhost';
    this.pgPort = parseInt(process.env.PG_PORT || '5432');
    this.pgUser = process.env.PG_USER || 'postgres';
    this.pgPassword = process.env.PG_PASSWORD || '';
    this.pgDatabase = process.env.PG_DATABASE || '';

    this.port = parseInt(process.env.PORT || '3000');
  }
}

export default Environment;
