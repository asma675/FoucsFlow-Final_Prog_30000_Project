namespace FocusFlowAPI.Models
{
    public class UserLoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
    }
}
