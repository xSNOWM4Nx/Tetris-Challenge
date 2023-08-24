using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TetrisChallenge.UI.Web.Data;

namespace TetrisChallenge.UI.Web
{
    public class ProgramConfiguration
    {
        #region fields

        public const string StartupLoggerName = "B3-Bootstrapper";

        private readonly WebApplicationBuilder _builder;

        #endregion
        #region ctor

        public ProgramConfiguration(WebApplicationBuilder builder)
        {
            _builder = builder;
        }

        #endregion

        public void Initialize()
        {
            var app = _builder.Build();

            // Basic configurations
            ConfigureApplication(app);

            // Register application callbacks
            app.Lifetime.ApplicationStarted.Register(() => ApplicationStarted(app));
            app.Lifetime.ApplicationStopping.Register(() => ApplicationStopping());
            app.Lifetime.ApplicationStopped.Register(() => ApplicationStopped());

            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapFallbackToFile("index.html");

                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "v1/{controller}/{action=Index}/{id?}");
            });

            app.Run();
        }

        private void ConfigureApplication(WebApplication app)
        {
            var appLifetime = app.Lifetime;

            // Setup a logger
            var loggerFactory = app.Services.GetRequiredService<ILoggerFactory>();
            var logger = loggerFactory.CreateLogger(nameof(ConfigureApplication));

            logger.LogInformation($"Configure application started.");

            var result = DatabaseConfiguration.InitializeGameDbContext(app, logger);
            if (!result)
            {
                logger.LogError($"Configure application aborted. Error on initializing Database context.");
                appLifetime.StopApplication();
                return;
            }

            logger.LogInformation($"Configure application completed.");
        }

        private static void ApplicationStarted(IApplicationBuilder app)
        {
        }

        private static void ApplicationStopping()
        {
        }

        private static void ApplicationStopped()
        {
        }
    }
}
