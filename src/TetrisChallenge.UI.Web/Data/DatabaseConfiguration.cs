using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TetrisChallenge.Infrastructure.Data.Contexts;

namespace TetrisChallenge.UI.Web.Data
{
    public static class DatabaseConfiguration
    {
        public static void AddDatabaseConfiguration(this IServiceCollection services, ConfigurationManager configuration)
        {
            services.AddDbContext<GameDbContext>(options =>
                options.UseSqlServer(
                   configuration.GetConnectionString("TetrisChallengeDbConnection"),
                    b => b.MigrationsAssembly("TetrisChallenge.Infrastructure.Data")));
        }
    }
}
