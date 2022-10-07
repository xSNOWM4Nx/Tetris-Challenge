namespace TetrisChallenge.Infrastructure.Identity.Roles
{
    public enum GameUserRoleEnumeration
    {
        Undefined = 0,
        Anonymous = 1,
        Player = 50,
        TeamLeader = 60,
        Administrator = 99,
        God = 100,
    }
}
