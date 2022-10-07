using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace TetrisChallenge.UI.Web
{
    public class ProgramServices
    {
        #region fields

        private readonly WebApplicationBuilder _builder;

        #endregion
        #region ctor

        public ProgramServices(WebApplicationBuilder builder)
        {
            _builder = builder;
        }

        #endregion

        public void Initialize()
        {
            IServiceCollection services = _builder.Services;

            services.AddControllersWithViews();

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ReactClientApp/build";
            });
        }
    }
}
