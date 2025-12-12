using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using System.Text.Json.Serialization;

namespace FinalBackEndAPI.Models
{
    // This class represents the 'Tasks' table in the database
    public class UserTask
    {
        [Key] 
        public int Id { get; set; } 
        [Required]
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        [JsonIgnore]
        public User? User { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public int Priority { get; set; } 

        public DateTime? DueDate { get; set; }

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Open";

        public DateTime? CompletionDate { get; set; }

        public TimeSpan? EstimatedTime { get; set; } 
    }
}