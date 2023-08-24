using System.ComponentModel.DataAnnotations;

namespace TetrisChallenge.Application.DTO
{
    public class LoginCredentialsDTO
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;
    }
}
