using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalBackEndAPI.Models
{
    public class User
    {
        
        [Key] 
        public int Id { get; set; } 

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public ICollection<UserTask> Tasks { get; set; } = new List<UserTask>();
    }
}