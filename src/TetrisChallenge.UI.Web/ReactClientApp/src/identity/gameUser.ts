export enum GameUserRoleEnumeration {
  Undefined = 0,
  Anonymous = 1,
  Player = 50,
  SquadLeader = 60,
  Administrator = 99,
  Developer = 100,
};

export interface IGameUser {
  name: string;
  roles: Array<GameUserRoleEnumeration>;
};
export interface IAuthenticatedGameUser extends IGameUser {
  token: string;
};
