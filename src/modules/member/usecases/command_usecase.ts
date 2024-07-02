import { IMember } from '../models/member';
import { IUsecaseCommand } from '../member';
import { PostgresRepository } from '../repositories/commands/postgresql_repository';

export class CommandUsecase implements IUsecaseCommand {
  private repository: PostgresRepository;

  constructor() {
    this.repository = new PostgresRepository();
  }

  public async AddMember(member: IMember): Promise<void> {
    try {
      await this.repository.InsertOneMember(member);

    } catch (e) {
      console.error('[inventory][command_usecase][Error]: ', e);
      throw new Error('Failed to add member to database');
    }
  }

  public async UpdateMember(member: IMember, code: string): Promise<void> {
    try {
      await this.repository.UpdateOneMember(member, code);

    } catch (e) {
      console.error('[inventory][command_usecase][Error]: ', e);
      throw new Error('Failed to update member to database');
    }
  }
}
