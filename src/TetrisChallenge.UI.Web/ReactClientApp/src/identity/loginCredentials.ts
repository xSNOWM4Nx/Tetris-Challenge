import { GameUserRoleEnumeration } from './gameUser';

export interface IRegistrationCredentials {
  name: string;
  password: string;
  confirmPassword: string;
  roles: Array<GameUserRoleEnumeration>;
};

export interface ILoginCredentials {
  name: string;
  password: string;
};
