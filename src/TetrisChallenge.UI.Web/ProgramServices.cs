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
            services.AddDatabaseConfigurations(_builder.Configuration);

            // Identity
            services.AddIdentity();
            services.AddJwtBearerAuthentication(_builder.Configuration);
            services.AddUserRoleAuthorization();

            services.AddControllersWithViews();
        }
    }
}
