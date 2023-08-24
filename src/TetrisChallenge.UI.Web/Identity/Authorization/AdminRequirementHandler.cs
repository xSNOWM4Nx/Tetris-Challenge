using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using TetrisChallenge.Infrastructure.Identity.User;

namespace TetrisChallenge.UI.Web.Identity.Authorization
{
    public class AdminRequirementHandler : AuthorizationHandler<AdminRequirement>
    {
        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            AdminRequirement requirement)
        {
            // Check if Role claim exists - Else Return
            // (Sort of Claim-based requirement)
            if (!context.User.HasClaim(x => x.Type == ClaimTypes.Role))
                return Task.CompletedTask;

            // Claim exists - retrieve the value
            var claim = context.User.Claims
                .FirstOrDefault(x => x.Type == ClaimTypes.Role);
            var role = claim.Value;

            // Check if the claim equals to Admin
            // If satisfied, set the requirement as success
            if (role == GameUserRoleEnumeration.Administrator.ToString())
                context.Succeed(requirement);

            return Task.CompletedTask;
        }
    }
}
