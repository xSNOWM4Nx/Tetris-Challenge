using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TetrisChallenge.Infrastructure.Identity.User;

namespace TetrisChallenge.Infrastructure.Data.Contexts
{
    public class GameDbContext : IdentityDbContext<GameUser>
    {
        public GameDbContext(DbContextOptions<GameDbContext> options)
            : base(options)
        { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
    }
}
