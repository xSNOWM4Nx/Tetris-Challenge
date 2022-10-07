using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

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
            app.UseSpaStaticFiles();

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ReactClientApp";

                if (app.Environment.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });

            app.Run();
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
