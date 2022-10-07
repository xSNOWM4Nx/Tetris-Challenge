using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Threading.Tasks;
using TetrisChallenge.Infrastructure.Data.Contexts;
using TetrisChallenge.Infrastructure.Identity.User;
using TetrisChallenge.UI.Web.Identity;
using TetrisChallenge.UI.Web.Identity.Authorization;

namespace TetrisChallenge.UI.Web.Identity
{
    public static class IdentityConfiguration
    {
        public static void AddIdentity(this IServiceCollection services)
        {
            services.AddIdentity<GameUser, IdentityRole>(options => options.SignIn.RequireConfirmedAccount = true)
                .AddEntityFrameworkStores<GameDbContext>();

            services.Configure<IdentityOptions>(options =>
            {
                options.Password.RequireDigit = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
            });
        }

        public static void AddJwtBearerAuthentication(this IServiceCollection services, ConfigurationManager configuration)
        {
            var jwtSettings = configuration.GetSection("JWT");

            services.AddAuthentication(opt =>
            {
                opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                //options.IncludeErrorDetails = true;
                //options.RequireHttpsMetadata = true;
                //options.SaveToken = true;
                //options.Validate(JwtBearerDefaults.AuthenticationScheme);
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,

                    ValidIssuer = jwtSettings.GetSection("Issuer").Value,
                    ValidAudience = jwtSettings.GetSection("Audience").Value,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.GetSection("SecurityKey").Value))
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];

                        // If the request is for our hub...
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) &&
                            path.StartsWithSegments("/hub/game/v1"))
                        {
                            // Read the token out of the query string
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });
        }

        public static IServiceCollection AddUserRoleAuthorization(this IServiceCollection services)
        {
            services.AddAuthorization(
                config =>
                {
                    config.AddPolicy("AdministratorPolicy", options =>
                    {
                        options.RequireAuthenticatedUser();
                        options.AuthenticationSchemes.Add(JwtBearerDefaults.AuthenticationScheme);
                        options.Requirements.Add(new AdminRequirement());
                    });

                    //// Add a new Policy with requirement to check for Admin
                    //config.AddPolicy("ShouldBeAnAdmin", options =>
                    //{
                    //    options.RequireAuthenticatedUser();
                    //    options.AuthenticationSchemes.Add(JwtBearerDefaults.AuthenticationScheme);
                    //    options.Requirements.Add(new ShouldBeAnAdminRequirement());
                    //});

                    //config.AddPolicy("ShouldContainRole", options => options.RequireClaim(ClaimTypes.Role));
                });

            return services;
        }
    }
}
