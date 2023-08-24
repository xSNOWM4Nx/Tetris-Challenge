using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.Collections.Generic;
using System.Linq;
using System;
using System.Text;
using System.Threading.Tasks;
using TetrisChallenge.Infrastructure.Data.Contexts;
using TetrisChallenge.Infrastructure.Identity.User;
using TetrisChallenge.UI.Web.Identity.Authorization;
using Microsoft.AspNetCore.Builder;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace TetrisChallenge.UI.Web.Identity
{
    public static class IdentityConfiguration
    {
        private static string GetErrorMessage(IdentityResult result)
        {
            if (result == null)
                return $"No error information in identity result.";

            if (result.Succeeded)
                return string.Empty;

            if (result.Errors == null)
                return $"No error information in identity result.";

            var errorMessage = string.Empty;
            foreach (var error in result.Errors)
                errorMessage += $"[{error.Code}] {error.Description} ";

            return errorMessage;
        }

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

        public static void SeedDefaultUsers(IApplicationBuilder app, ILogger logger)
        {
            // Get scoped services
            var serviceScope = app.ApplicationServices.CreateScope();
            var userManager = serviceScope.ServiceProvider.GetRequiredService<UserManager<GameUser>>();
            var roleManager = serviceScope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            // Seed available user roles
            CreateUserRole(roleManager, logger, GameUserRoleEnumeration.Anonymous.ToString()).GetAwaiter().GetResult();
            CreateUserRole(roleManager, logger, GameUserRoleEnumeration.Player.ToString()).GetAwaiter().GetResult();
            CreateUserRole(roleManager, logger, GameUserRoleEnumeration.SquadLeader.ToString()).GetAwaiter().GetResult();
            CreateUserRole(roleManager, logger, GameUserRoleEnumeration.Administrator.ToString()).GetAwaiter().GetResult();
            CreateUserRole(roleManager, logger, GameUserRoleEnumeration.Developer.ToString()).GetAwaiter().GetResult();

            // Seed default users
            CreateUser(
                userManager,
                roleManager,
                logger,
                GameUserRoleEnumeration.Anonymous.ToString(),
                GameUserRoleEnumeration.Anonymous.ToString(),
                new List<string>() { GameUserRoleEnumeration.Anonymous.ToString() }).GetAwaiter().GetResult();
            CreateUser(
                userManager,
                roleManager,
                logger,
                GameUserRoleEnumeration.Administrator.ToString(),
                GameUserRoleEnumeration.Administrator.ToString(),
                new List<string>() { GameUserRoleEnumeration.Administrator.ToString() }).GetAwaiter().GetResult();
        }

        public static async Task<bool> CreateUserRole(
            RoleManager<IdentityRole> roleManager,
            ILogger logger,
            string roleName)
        {
            var isRoleExisting = roleManager.Roles
                .Any(x => x.Name == roleName);

            if (isRoleExisting)
                return true;

            logger.LogInformation($"Adding role [{roleName}] to database.");

            var newRole = new IdentityRole
            {
                Name = roleName,
                NormalizedName = roleName.ToUpper()
            };

            try
            {
                var createResult = await roleManager.CreateAsync(newRole);
                if (!createResult.Succeeded)
                {
                    logger.LogError($"Role [{roleName}] could not be added to database. {GetErrorMessage(createResult)}");
                    return false;
                }

                logger.LogInformation($"Role [{roleName}] added to database.");
                return true;
            }
            catch (Exception ex)
            {
                logger.LogError($"Unexpected error on adding role [{roleName}] to database. {ex.Message}");
                return false;
            }
        }

        public static async Task<bool> CreateUser(
            UserManager<GameUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ILogger logger,
            string userName,
            string password,
            List<string> roles)
        {
            var isUserExisting = userManager.Users
                .Any(x => x.UserName == userName);

            if (isUserExisting)
                return true;

            foreach (var role in roles)
            {
                var result = await CreateUserRole(roleManager, logger, role);
                if (!result)
                {
                    logger.LogError($"Cannot add user [{userName}]. Role [{role}] not available.");
                    return false;
                }
            }

            logger.LogInformation($"Adding user [{userName}] to database.");

            var newUser = new GameUser
            {
                UserName = userName,
                NormalizedUserName = userName.ToUpper()
            };

            try
            {
                var errors = new List<IdentityError>();
                var createResult = await userManager.CreateAsync(newUser, password);
                if (!createResult.Succeeded)
                {
                    logger.LogError($"User [{userName}] could not be added to database. {GetErrorMessage(createResult)}");
                    return false;
                }

                logger.LogInformation($"User [{userName}] added to database.");

                foreach (var role in roles)
                {
                    var addToRoleResult = await userManager.AddToRoleAsync(newUser, role);
                    if (!addToRoleResult.Succeeded)
                    {
                        logger.LogError($"User [{userName}] could not be added to database. {GetErrorMessage(addToRoleResult)}");
                        return false;
                    }

                    logger.LogInformation($"User [{userName}] added to role [{role}].");
                }

                return true;
            }
            catch (Exception ex)
            {
                logger.LogError($"Unexpected error on adding user [{userName}] to database. {ex.Message}");
                return false;
            }
        }

        public static SigningCredentials GetSigningCredentials(IConfiguration configuration)
        {
            var jwtSettings = configuration.GetSection("JWT");

            var key = Encoding.UTF8.GetBytes(jwtSettings.GetSection("securityKey").Value);
            var symmetricSecurityKey = new SymmetricSecurityKey(key);

            return new SigningCredentials(symmetricSecurityKey, SecurityAlgorithms.HmacSha256);
        }

        public static async Task<List<Claim>> GetClaims(GameUser user, UserManager<GameUser> userManager)
        {
            // Setup claim
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName)
            };

            // Get user roles
            var roles = await userManager.GetRolesAsync(user);

            // Update claim
            foreach (var role in roles)
                claims.Add(new Claim(ClaimTypes.Role, role));

            return claims;
        }

        public static JwtSecurityToken GetSecurityToken(IConfiguration configuration, SigningCredentials signingCredentials, List<Claim> claims)
        {
            var jwtSettings = configuration.GetSection("JWT");
            var tokenOptions = new JwtSecurityToken(
                issuer: jwtSettings.GetSection("Issuer").Value,
                audience: jwtSettings.GetSection("Audience").Value,
                claims: claims,
                expires: DateTime.Now.AddMinutes(Convert.ToDouble(jwtSettings.GetSection("ExpiryInMinutes").Value)),
                signingCredentials: signingCredentials);

            return tokenOptions;
        }
    }
}
