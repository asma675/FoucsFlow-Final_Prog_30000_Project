using System;
using Microsoft.EntityFrameworkCore;
using FocusFlowAPI.Models;

namespace FocusFlowAPI.Data;

public class ApplicationDbContext : DbContext
{

    public DbSet<User> Users { get; set; }
    public DbSet<UserTask> UserTasks { get; set; }

    //Add default data for testing
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
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


            modelBuilder.Entity<UserTask>().HasData(            
                new UserTask
            {
                Id = 1,
                UserId = 1, 
                Title = "Set up API Endpoint",
                Priority = 1, 
                DueDate = DateTime.Parse("2025-01-15T12:00:00Z").ToUniversalTime(),
                Category = "Development",
                Status = "In Progress",
                CompletionDate = null,
                EstimatedTime = new TimeSpan(4, 30, 0)
            },
            new UserTask
            {
   
                Id = 2,
                UserId = 1, 
                Title = "Define User Model",
                Priority = 2, 
                DueDate = DateTime.Parse("2025-01-05T09:00:00Z").ToUniversalTime(),
                Category = "Development",
                Status = "Done",
                CompletionDate = DateTime.Parse("2025-01-04T18:00:00Z").ToUniversalTime(),
                EstimatedTime = new TimeSpan(2, 0, 0) 
            },
            new UserTask
            {
                Id = 3,
                UserId = 2, 
                Title = "Review Task Requirements",
                Priority = 3,
                DueDate = DateTime.Parse("2025-01-30T17:00:00Z").ToUniversalTime(),
                Category = "Testing",
                Status = "Open",
                CompletionDate = null,
                EstimatedTime = new TimeSpan(1, 0, 0)
            }
        );

        base.OnModelCreating(modelBuilder);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlite("FileName=focusflow.db");
    }

}

