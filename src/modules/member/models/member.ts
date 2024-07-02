/**
 * example of member data
 * {
     code: "M001",
     name: "Angga",
     penalized_at: null
   },
 */

export interface IMember {
  id?: number;
  code: string;
  name: string;
  penalized_at: Date;
}

export interface IUpsertMember {
  code: string;
  name: string;
  penalized_at: Date;
}
