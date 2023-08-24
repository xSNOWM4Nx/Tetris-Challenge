using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Threading.Tasks;
using System;
using TetrisChallenge.Application.DTO;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Threading;
using TetrisChallenge.Infrastructure.Identity.User;
using TetrisChallenge.Application.Response;
using System.Linq;
using TetrisChallenge.Domain.ValueObjects;
using TetrisChallenge.UI.Web.Identity;

namespace TetrisChallenge.Controllers
{
    [Authorize]
    [ApiController]
    [Route("v1/[controller]")]
    public class AuthenticationController : ControllerBase
    {
        #region field

        protected static SemaphoreSlim _dbContextSemaphore = new(1, 1);

        private readonly UserManager<GameUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ILogger<AuthenticationController> _logger;
        private readonly IConfiguration _configuration;

        #endregion
        #region ctor

        public AuthenticationController(
            UserManager<GameUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ILogger<AuthenticationController> logger,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
            _configuration = configuration;
        }

        #endregion

        [AllowAnonymous]
        [HttpPost]
        [Route("LoginUser")]
        public async Task<IActionResult> LoginUser([FromBody] LoginCredentialsDTO loginCredentials)
        {
            await _dbContextSemaphore.WaitAsync();

            // Setup response object
            IResponse<AuthenticatedGameUserDTO> response = new Response<AuthenticatedGameUserDTO>(new AuthenticatedGameUserDTO());

            if (!ModelState.IsValid)
            {
                response.State = ResponseStateEnumeration.Error;

                _dbContextSemaphore.Release();
                return BadRequest(response);
            }

            try
            {
                // Check if user exist
                var user = await _userManager.FindByNameAsync(loginCredentials.Name);
                if (user == null)
                {
                    // Setup log message
                    var logMessage = $"Cannot login user [{loginCredentials.Name}]. User does not exist.";

                    // Setup localized response message
                    var localizedMessage = new LocalizableValue();
                    localizedMessage.Link.Name = "usernotexists";
                    localizedMessage.Link.Path = "api.usercontroller.loginuser";
                    localizedMessage.KeyNamespace = "game.backend";
                    localizedMessage.DynamicValueDictionary.Add("Name", loginCredentials.Name);
                    localizedMessage.Value = logMessage;

                    // Setup response
                    response.AddMessage(localizedMessage, nameof(LoginUser));
                    response.State = ResponseStateEnumeration.Error;

                    // Write log
                    _logger.LogError(logMessage);

                    // Update model state
                    ModelState.AddModelError(nameof(LoginUser), logMessage);

                    return Unauthorized(response);
                }

                var checkPasswordResult = await _userManager.CheckPasswordAsync(user, loginCredentials.Password);
                if (!checkPasswordResult)
                {
                    // Setup log message
                    var logMessage = $"Cannot login user [{loginCredentials.Name}]. Password is invalid.";

                    // Setup localized response message
                    var localizedMessage = new LocalizableValue();
                    localizedMessage.Link.Name = "passwordinvalid";
                    localizedMessage.Link.Path = "api.usercontroller.loginuser";
                    localizedMessage.KeyNamespace = "game.backend";
                    localizedMessage.DynamicValueDictionary.Add("Name", loginCredentials.Name);
                    localizedMessage.Value = logMessage;

                    // Setup response
                    response.AddMessage(localizedMessage, nameof(LoginUser));
                    response.State = ResponseStateEnumeration.Error;

                    // Write log
                    _logger.LogError(logMessage);

                    // Update model state
                    ModelState.AddModelError(nameof(LoginUser), logMessage);

                    return Unauthorized(response);
                }

                var userRoles = await _userManager.GetRolesAsync(user);
                var roleEnumerations = Enum.GetValues(typeof(GameUserRoleEnumeration)).Cast<GameUserRoleEnumeration>();
                roleEnumerations = roleEnumerations.Where(role => userRoles.Contains(role.ToString()));

                var signingCredentials = IdentityConfiguration.GetSigningCredentials(_configuration);
                var claims = await IdentityConfiguration.GetClaims(user, _userManager);
                var securityToken = IdentityConfiguration.GetSecurityToken(_configuration, signingCredentials, claims);
                var token = new JwtSecurityTokenHandler().WriteToken(securityToken);

                response.State = ResponseStateEnumeration.OK;
                response.Payload.Name = user.UserName;
                response.Payload.Roles = new List<GameUserRoleEnumeration>(roleEnumerations);
                response.Payload.Token = token;

                return Ok(response);
            }
            catch (Exception ex)
            {
                // Setup log message
                var logMessage = $"Unexpected error on login user [{loginCredentials.Name}]. {ex}";

                // Setup localized response message
                var localizedMessage = new LocalizableValue();
                localizedMessage.Link.Name = "exception";
                localizedMessage.Link.Path = "api.usercontroller.loginuser";
                localizedMessage.KeyNamespace = "game.backend";
                localizedMessage.DynamicValueDictionary.Add("Name", loginCredentials.Name);
                localizedMessage.DynamicValueDictionary.Add("Exception", ex.Message);
                localizedMessage.Value = logMessage;

                // Setup response
                response.AddMessage(localizedMessage, nameof(LoginUser));
                response.State = ResponseStateEnumeration.Error;

                // Write log
                _logger.LogError(logMessage);

                // Update model state
                ModelState.AddModelError(nameof(LoginUser), logMessage);

                return BadRequest(response);
            }
            finally
            {
                _dbContextSemaphore.Release();
            }
        }
    }
}
