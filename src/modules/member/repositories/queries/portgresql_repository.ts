import { IMember } from '../../models/member';
import { IPostgresRepositoryQuery } from '../../member';
import { closeClient, query } from '../../../../pkg/databases/postgres/postgres';

export class PostgresRepository implements IPostgresRepositoryQuery {
  public async FindMemberById(id: number): Promise<IMember> {
    const result = await query<IMember>(
      'SELECT * FROM members WHERE id = $1',
      [id]
    );

    await closeClient();

    return result[0];
  }

  public async FindMemberByCode(code: string): Promise<IMember> {
    const result = await query<IMember>(
      'SELECT * FROM members WHERE code = $1',
      [code]
    );

    await closeClient();

    return result[0];
  }

  public async FindAllMembers(): Promise<IMember[]> {
    const result = await query<IMember[]>(
      'SELECT * FROM members'
    );

    await closeClient();

    return result;
  }
}
