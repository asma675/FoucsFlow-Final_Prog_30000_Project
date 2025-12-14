using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

using FocusFlowAPI.Controllers;
using FocusFlowAPI.Data;
using FocusFlowAPI.Models;

namespace FocusFlowAPI.Tests
{
    public class UsersControllerTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly UsersController _controller;

        public UsersControllerTests()
        {
            // Create in-memory database for testing
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new TestApplicationDbContext(options);
            _controller = new UsersController(_context);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        /*
         Asma
         Verifies that an empty list is returned upon requesting user list, if the database is empty.
         */

        [Fact]
        public async Task GetUsers_ReturnsEmptyList_WhenNoUsers()
        {
            // Act
            var result = await _controller.GetUsers();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<User>>>(result);
            var users = Assert.IsAssignableFrom<IEnumerable<User>>(actionResult.Value);
            Assert.Empty(users);
        }

        /*
         Asma
         Verifies that all users from the database are returned.
         */
        [Fact]
        public async Task GetUsers_ReturnsAllUsers()
        {
            // Arrange
            var user1 = new User { FirstName = "John", LastName = "Doe", Email = "john@test.com", PasswordHash = "hash1" };
            var user2 = new User { FirstName = "Jane", LastName = "Smith", Email = "jane@test.com", PasswordHash = "hash2" };
            _context.Users.AddRange(user1, user2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetUsers();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<User>>>(result);
            var users = Assert.IsAssignableFrom<IEnumerable<User>>(actionResult.Value).ToList();
            Assert.Equal(2, users.Count);
        }

        /*
         Asma
         Verfiies that specific (existing) user can be retrieved from database.
         */
        [Fact]
        public async Task GetUser_ReturnsUser_WhenUserExists()
        {
            // Arrange
            var user = new User { FirstName = "John", LastName = "Doe", Email = "john@test.com", PasswordHash = "hash1" };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetUser(user.Id);

            // Assert
            var actionResult = Assert.IsType<ActionResult<User>>(result);
            var returnedUser = Assert.IsType<User>(actionResult.Value);
            Assert.Equal(user.Id, returnedUser.Id);
            Assert.Equal("John", returnedUser.FirstName);
        }
        
        /*
         Asma
         Verifies that not found (404) is returned when the user does not exist.
         */
        [Fact]
        public async Task GetUser_ReturnsNotFound_WhenUserDoesNotExist()
        {
            // Act
            var result = await _controller.GetUser(999);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        /*
         Hayden
         Confirms a user is created when valid user data is given
         */
        [Fact]
        public async Task PostUser_CreatesUser_WhenValid()
        {
            // Arrange
            var user = new User 
            { 
                FirstName = "John", 
                LastName = "Doe", 
                Email = "john@test.com", 
                PasswordHash = "hash1" 
            };

            // Act
            var result = await _controller.PostUser(user);

            // Assert
            var actionResult = Assert.IsType<ActionResult<User>>(result);
            var createdResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
            var createdUser = Assert.IsType<User>(createdResult.Value);
            Assert.Equal("john@test.com", createdUser.Email);
            Assert.Equal(1, await _context.Users.CountAsync());
        }
        
        /*
         Hayden
         Checks that duplicate emails aren't allowed on user creation
         */
        [Fact]
        public async Task PostUser_ReturnsConflict_WhenEmailExists()
        {
            // Arrange
            var existingUser = new User { FirstName = "John", LastName = "Doe", Email = "john@test.com", PasswordHash = "hash1" };
            _context.Users.Add(existingUser);
            await _context.SaveChangesAsync();

            var duplicateUser = new User { FirstName = "Jane", LastName = "Smith", Email = "john@test.com", PasswordHash = "hash2" };

            // Act
            var result = await _controller.PostUser(duplicateUser);

            // Assert
            var actionResult = Assert.IsType<ActionResult<User>>(result);
            var conflictResult = Assert.IsType<ConflictObjectResult>(actionResult.Result);
            Assert.Equal("A user with this email address already exists.", conflictResult.Value);
        }

        /*
         Hayden
         Confirms successful login with correct credentials
         */
        [Fact]
        public async Task LoginUser_ReturnsUser_WhenCredentialsValid()
        {
            // Arrange
            var user = new User { FirstName = "John", LastName = "Doe", Email = "john@test.com", PasswordHash = "hash1" };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var loginDto = new UserLoginDto { Email = "john@test.com", PasswordHash = "hash1" };

            // Act
            var result = await _controller.LoginUser(loginDto);

            // Assert
            var actionResult = Assert.IsType<ActionResult<User>>(result);
            var returnedUser = Assert.IsType<User>(actionResult.Value);
            Assert.Equal(user.Id, returnedUser.Id);
        }
        
        /*
         Hayden
         Confirms unsuccessful login with incorrect credentials
         */
        [Fact]
        public async Task LoginUser_ReturnsUnauthorized_WhenCredentialsInvalid()
        {
            // Arrange
            var loginDto = new UserLoginDto { Email = "wrong@test.com", PasswordHash = "wronghash" };

            // Act
            var result = await _controller.LoginUser(loginDto);

            // Assert
            var actionResult = Assert.IsType<ActionResult<User>>(result);
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(actionResult.Result);
            Assert.Equal("Invalid email or password.", unauthorizedResult.Value);
        }
        
        /*
         Adrian
         Task is sucessfully created (when valid task info is passed).
         */
        [Fact]
        public async Task PostTaskForUser_CreatesTask_WhenValid()
        {
            // Arrange
            var user = new User { FirstName = "John", LastName = "Doe", Email = "john@test.com", PasswordHash = "hash1" };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var task = new UserTask 
            { 
                Title = "Test Task", 
                Priority = 1, 
                Category = "Work" 
            };

            // Act
            var result = await _controller.PostTaskForUser(user.Id, task);

            // Assert
            var actionResult = Assert.IsType<ActionResult<UserTask>>(result);
            var createdResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
            var createdTask = Assert.IsType<UserTask>(createdResult.Value);
            Assert.Equal("Test Task", createdTask.Title);
            Assert.Equal(user.Id, createdTask.UserId);
            Assert.Equal("Open", createdTask.Status);
        }
        
        /*
         Adrian
         Not found is returned when trying to create task for non-existing user.
         */
        [Fact]
        public async Task PostTaskForUser_ReturnsNotFound_WhenUserDoesNotExist()
        {
            // Arrange
            var task = new UserTask { Title = "Test Task", Priority = 1, Category = "Work" };

            // Act
            var result = await _controller.PostTaskForUser(999, task);

            // Assert
            var actionResult = Assert.IsType<ActionResult<UserTask>>(result);
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(actionResult.Result);
            Assert.Contains("User with ID 999 not found", notFoundResult.Value.ToString());
        }
        
        /*
         Hayden
         Confirms all tasks for existing user are retrieved.
         */
        [Fact]
        public async Task GetTasksForUser_ReturnsTasks_WhenUserHasTasks()
        {
            // Arrange
            var user = new User { FirstName = "Yanis", LastName = "Varoufakis", Email = "yanis@gmail.com", PasswordHash = "hash1" };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var task1 = new UserTask { UserId = user.Id, Title = "Task 1", Priority = 1, Category = "Work", Status = "Open" };
            var task2 = new UserTask { UserId = user.Id, Title = "Task 2", Priority = 2, Category = "Personal", Status = "Open" };
            _context.UserTasks.AddRange(task1, task2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetTasksForUser(user.Id);

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<UserTask>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var tasks = Assert.IsAssignableFrom<IEnumerable<UserTask>>(okResult.Value).ToList();
            Assert.Equal(2, tasks.Count);
        }
        
        /*
         Adrian
         When retrieving user's task list, empty list is tested for if user has no tasks.
         */
        [Fact]
        public async Task GetTasksForUser_ReturnsEmptyList_WhenUserHasNoTasks()
        {
            // Arrange
            var user = new User { FirstName = "George", LastName = "Orwell", Email = "winston@ingsoc.gov", PasswordHash = "hash1" };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetTasksForUser(user.Id);

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<UserTask>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var tasks = Assert.IsAssignableFrom<IEnumerable<UserTask>>(okResult.Value).ToList();
            Assert.Empty(tasks);
        }
        
        /*
         Hayden
         Confirms that task has successfully been set as 'Done'.
         */
        [Fact]
        public async Task CompleteTask_MarksTaskAsDone()
        {
            // Arrange
            var user = new User { FirstName = "John", LastName = "Doe", Email = "john@test.com", PasswordHash = "hash1" };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var task = new UserTask { UserId = user.Id, Title = "Task", Priority = 1, Category = "Work", Status = "Open" };
            _context.UserTasks.Add(task);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.CompleteTask(user.Id, task.Id);

            // Assert
            Assert.IsType<NoContentResult>(result);
            var updatedTask = await _context.UserTasks.FindAsync(task.Id);
            Assert.Equal("Done", updatedTask.Status);
            Assert.NotNull(updatedTask.CompletionDate);
        }
        
        /*
         Adrian
         Confirms 404 is returned if non-existing task is set as 'Done'.
         */
        [Fact]
        public async Task CompleteTask_ReturnsNotFound_WhenTaskDoesNotExist()
        {
            // Arrange
            var user = new User { FirstName = "John", LastName = "Stamos", Email = "john.stamos.in.prison@hotmail.com", PasswordHash = "hash1" };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.CompleteTask(user.Id, 999);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Contains("Task with ID 999 not found", notFoundResult.Value.ToString());
        }
        
        /*
         Asma
         Verifies that task was sucessfully updated
         */
        [Fact]
        public async Task UpdateTask_UpdatesTaskFields()
        {
            // Arrange
            var user = new User { FirstName = "John", LastName = "Doe", Email = "john@test.com", PasswordHash = "hash1" };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var task = new UserTask { UserId = user.Id, Title = "Old Title", Priority = 1, Category = "Work", Status = "Open" };
            _context.UserTasks.Add(task);
            await _context.SaveChangesAsync();

            var update = new UserTask { Title = "New Title", Priority = 2, Category = "Personal", Status = "In Progress" };

            // Act
            var result = await _controller.UpdateTask(user.Id, task.Id, update);

            // Assert
            var actionResult = Assert.IsType<ActionResult<UserTask>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var updatedTask = Assert.IsType<UserTask>(okResult.Value);
            Assert.Equal("New Title", updatedTask.Title);
            Assert.Equal(2, updatedTask.Priority);
            Assert.Equal("Personal", updatedTask.Category);
            Assert.Equal("In Progress", updatedTask.Status);
        }

        /*
         Adrian
         Verifies correctly set completion date when task is set to'Done'.
         */
        [Fact]
        public async Task UpdateTask_SetsCompletionDate_WhenStatusChangesToDone()
        {
            // Arrange
            var user = new User { FirstName = "John", LastName = "Doe", Email = "john@test.com", PasswordHash = "hash1" };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var task = new UserTask { UserId = user.Id, Title = "Task", Priority = 1, Category = "Work", Status = "Open" };
            _context.UserTasks.Add(task);
            await _context.SaveChangesAsync();

            var update = new UserTask { Title = "Task", Priority = 1, Category = "Work", Status = "Done" };

            // Act
            var result = await _controller.UpdateTask(user.Id, task.Id, update);

            // Assert
            var actionResult = Assert.IsType<ActionResult<UserTask>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var updatedTask = Assert.IsType<UserTask>(okResult.Value);
            Assert.Equal("Done", updatedTask.Status);
            Assert.NotNull(updatedTask.CompletionDate);
        }
        
        /*
         Adrian
         Confirms deleted task was removed from database.
         */
        [Fact]
        public async Task DeleteTask_RemovesTask()
        {
            // Arrange
            var user = new User { FirstName = "Jan", LastName = "Kowalski", Email = "jankowal@mail.pl", PasswordHash = "hash1" };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var task = new UserTask { UserId = user.Id, Title = "Task", Priority = 1, Category = "Work", Status = "Open" };
            _context.UserTasks.Add(task);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.DeleteTask(user.Id, task.Id);

            // Assert
            Assert.IsType<NoContentResult>(result);
            Assert.Equal(0, await _context.UserTasks.CountAsync());
        }
        
        /*
         Asma
         Tests for 404 return if trying to delete non-existent task.
         */
        [Fact]
        public async Task DeleteTask_ReturnsNotFound_WhenTaskDoesNotExist()
        {
            // Arrange
            var user = new User { FirstName = "John", LastName = "Doe", Email = "john@test.com", PasswordHash = "hash1" };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.DeleteTask(user.Id, 999);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Contains("Task with ID 999 not found", notFoundResult.Value.ToString());
        }
    }

    // Test DbContext that accepts DbContextOptions for in-memory testing (original harcoded to use SQLite)
    public class TestApplicationDbContext : ApplicationDbContext
    {
        private readonly DbContextOptions<ApplicationDbContext> _options;

        public TestApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        {
            _options = options;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            // Use options passed in constructor (for in-memory database)
            // Don't call base OnConfiguring which would set SQLite
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseInMemoryDatabase("TestDatabase");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Call base to get model configuration, skip seed data
            // Each test will have its own data
            base.OnModelCreating(modelBuilder);
        }
    }
}
