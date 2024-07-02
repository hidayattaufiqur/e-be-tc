import { IMember } from './models/member';

export interface IUsecaseQuery {
  GetMember(code: string): Promise<IMember>;
  GetMemberById(id: number): Promise<IMember>;
  GetMembers(): Promise<IMember[]>;
}

export interface IUsecaseCommand {
  AddMember(member: IMember): Promise<void>;
  UpdateMember(member: IMember, code: string): Promise<void>;
}

export interface IPostgresRepositoryQuery {
  FindMemberById(id: number): Promise<IMember>;
  FindMemberByCode(code: string): Promise<IMember>;
  FindAllMembers(): Promise<IMember[]>;
}

export interface IPostgresRepositoryCommand {
  InsertOneMember(member: IMember): Promise<void>;
  UpdateOneMember(member: IMember, code: string): Promise<void>;
}
