using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using TetrisChallenge.UI.Web.Data;
using TetrisChallenge.UI.Web.Identity;

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

            // Database configurations
            services.AddDatabaseConfiguration(_builder.Configuration);

            // Identity
            services.AddIdentity();
            services.AddJwtBearerAuthentication(_builder.Configuration);
            services.AddUserRoleAuthorization();

            services.AddControllersWithViews();

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ReactClientApp/build";
            });
        }
    }
}
