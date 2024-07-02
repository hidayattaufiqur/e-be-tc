import { IMember } from '../../models/member';
import { IPostgresRepositoryCommand } from '../../member';
import { closeClient, query } from '../../../../pkg/databases/postgres/postgres';

export class PostgresRepository implements IPostgresRepositoryCommand {
  public async InsertOneMember(member: IMember): Promise<void> {
    await query<IMember>(
      'INSERT INTO members (code, name, penalized_at) VALUES ($1, $2, null)',
      [member.code, member.name]
    );

    await closeClient();
  }

  public async UpdateOneMember(member: IMember, code: string): Promise<void> {
    await query<IMember>(
      'UPDATE members SET name = $2, penalized_at = $3 WHERE code = $1',
      [code, member.name, member.penalized_at]
    );

    await closeClient();
  }
}
