using Microsoft.AspNetCore.Builder;

namespace TetrisChallenge.UI.Web
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            var programServices = new ProgramServices(builder);
            programServices.Initialize();

            var programConfiguration = new ProgramConfiguration(builder);
            programConfiguration.Initialize();
        }
    }
}
