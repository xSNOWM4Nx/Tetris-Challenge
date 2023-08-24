using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using TetrisChallenge.Infrastructure.Data.Contexts;
using TetrisChallenge.UI.Web.Identity;

namespace TetrisChallenge.UI.Web.Data
{
    public static class DatabaseConfiguration
    {
        public static void AddDatabaseConfigurations(this IServiceCollection services, ConfigurationManager configuration)
        {
            services.AddDbContext<GameDbContext>(options =>
                options.UseSqlServer(
                   configuration.GetConnectionString("TetrisChallengeDb"),
                    b => b.MigrationsAssembly("TetrisChallenge.Infrastructure.Data")));
        }

        public static bool InitializeGameDbContext(IApplicationBuilder app, ILogger logger)
        {
            // Get configuration
            var configuration = app.ApplicationServices.GetRequiredService<IConfiguration>();

            // Get scoped services
            var serviceScope = app.ApplicationServices.CreateScope();
            var applicationDbContext = serviceScope.ServiceProvider.GetRequiredService<GameDbContext>();

            logger.LogInformation($"Initialize {nameof(GameDbContext)} started.");

            try
            {
                var ensureDeleted = configuration
                    .GetSection("Persistence")
                    .GetSection("GameDb")
                    .GetValue<bool>("EnsureDeleted");

                if (ensureDeleted)
                {
                    logger.LogWarning($"{nameof(GameDbContext)} will be reseted. This has been configured through [appsettings.Persistence.GameDb.EnsureDeleted].");
                    applicationDbContext.Database.EnsureDeleted();
                }

                logger.LogInformation($"Migrating {nameof(GameDbContext)}.");
                applicationDbContext.Database.Migrate();

                IdentityConfiguration.SeedDefaultUsers(app, logger);

                logger.LogInformation($"Initialize {nameof(GameDbContext)} completed.");
                return true;
            }
            catch (Exception ex)
            {
                logger.LogError($"Unexpected error on initialize [{nameof(GameDbContext)}]. {ex}");
                throw;
            }
        }
    }
}
