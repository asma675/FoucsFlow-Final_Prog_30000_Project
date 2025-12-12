using Microsoft.EntityFrameworkCore;
using FinalBackEndAPI.Models;
namespace FinalBackEndAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = default!; 
        public DbSet<UserTask> UserTasks { get; set; } = default!;
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // --- USER SEED DATA (YOUR EXISTING CODE) ---
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    FirstName = "Admin",
                    LastName = "User",
                    Email = "admin@example.com",
                    PasswordHash = "PlaceholderHash12345", 
                    CreatedDate = DateTime.Parse("2025-01-01T10:00:00Z").ToUniversalTime() 
                },
                new User
                {
                    Id = 2,
                    FirstName = "Test",
                    LastName = "Client",
                    Email = "test@example.com",
                    PasswordHash = "PlaceholderHash54321",
                    CreatedDate = DateTime.Parse("2025-01-01T10:05:00Z").ToUniversalTime()
                }
            );
            // -------------------------------------------


            // --- NEW TASK SEED DATA ---
                modelBuilder.Entity<UserTask>().HasData(            
                    new UserTask
                {
                    // Task 1: Assigned to User ID 1 (Admin)
                    Id = 1,
                    UserId = 1, // <--- Foreign Key Link!
                    Title = "Set up API Endpoint",
                    Priority = 1, // High
                    DueDate = DateTime.Parse("2025-01-15T12:00:00Z").ToUniversalTime(),
                    Category = "Development",
                    Status = "In Progress",
                    CompletionDate = null,
                    EstimatedTime = new TimeSpan(4, 30, 0) // 4 hours 30 minutes
                },
                new UserTask
                {
                    // Task 2: Assigned to User ID 1 (Admin) - Completed
                    Id = 2,
                    UserId = 1, // <--- Foreign Key Link!
                    Title = "Define User Model",
                    Priority = 2, // Medium
                    DueDate = DateTime.Parse("2025-01-05T09:00:00Z").ToUniversalTime(),
                    Category = "Development",
                    Status = "Done",
                    CompletionDate = DateTime.Parse("2025-01-04T18:00:00Z").ToUniversalTime(),
                    EstimatedTime = new TimeSpan(2, 0, 0) // 2 hours
                },
                new UserTask
                {
                    // Task 3: Assigned to User ID 2 (Test Client)
                    Id = 3,
                    UserId = 2, // <--- Foreign Key Link!
                    Title = "Review Task Requirements",
                    Priority = 3, // Low
                    DueDate = DateTime.Parse("2025-01-30T17:00:00Z").ToUniversalTime(),
                    Category = "Testing",
                    Status = "Open",
                    CompletionDate = null,
                    EstimatedTime = new TimeSpan(1, 0, 0) // 1 hour
                }
            );

            // Important: Call the base implementation last
            base.OnModelCreating(modelBuilder);
        }
    }
}