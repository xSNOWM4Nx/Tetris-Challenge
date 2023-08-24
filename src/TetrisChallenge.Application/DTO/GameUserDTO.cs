using System.Collections.Generic;
using TetrisChallenge.Infrastructure.Identity.User;

namespace TetrisChallenge.Application.DTO
{
    public class GameUserDTO
    {
        public string Name { get; set; } = string.Empty;
        public List<GameUserRoleEnumeration> Roles { get; set; } = new List<GameUserRoleEnumeration>();
    }

    public class AuthenticatedGameUserDTO : GameUserDTO
    {
        public string Token { get; set; } = string.Empty;
    }
}
