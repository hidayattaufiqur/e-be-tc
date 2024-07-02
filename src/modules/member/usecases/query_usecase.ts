import { IMember } from '../models/member';
import { IUsecaseQuery } from '../member';
import { PostgresRepository } from '../repositories/queries/portgresql_repository';

export class QueryUsecase implements IUsecaseQuery {
  private repository: PostgresRepository;

  constructor() {
    this.repository = new PostgresRepository();
  }

  public async GetMemberById(id: number): Promise<IMember> {
    try {
      const repository = new PostgresRepository();
      const member = await repository.FindMemberById(id);

      if (!member) {
        return;
      }

      const data: IMember = {
        code: member[1],
        name: member[2],
        penalized_at: member[3]
      };

      return data;
    } catch (e) {
      console.error('[inventory][query_usecase][Error]: ', e);
      throw new Error('Failed to get member from database');
    }
  }

  public async GetMember(code: string): Promise<IMember> {
    try {
      const repository = new PostgresRepository();
      const member = await repository.FindMemberByCode(code);

      if (!member) {
        return;
      }

      const data: IMember = {
        id: member[0],
        code: member[1],
        name: member[2],
        penalized_at: member[3]
      };

      return data;
    } catch (e) {
      console.error('[inventory][query_usecase][Error]: ', e);
      throw new Error('Failed to get member from database');
    }
  }

  public async GetMembers(): Promise<IMember[]> {
    try {
      const members = await this.repository.FindAllMembers();

      const data = members.map((member: IMember) => {
        return {
          id: member[0],
          code: member[1],
          name: member[2],
          penalized_at: member[3]
        };
      });

      return data;
    } catch (e) {
      console.error('[inventory][query_usecase][Error]: ', e);
      throw new Error('Failed to get members from database');
    }
  }
}
