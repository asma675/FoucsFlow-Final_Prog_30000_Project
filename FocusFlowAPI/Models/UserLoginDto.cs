namespace FocusFlowAPI.Models
{
    //Hayden Da Re-Robertson
    //This is a DTO for getting login details to auth a user
    public class UserLoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
    }
}
