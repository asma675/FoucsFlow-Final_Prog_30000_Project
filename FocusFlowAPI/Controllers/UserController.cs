using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FocusFlowAPI.Data; 
using FocusFlowAPI.Models; 

namespace FocusFlowAPI.Controllers;

[ApiController] 
[Route("api/[controller]")]
public class UsersController : ControllerBase 
{
    private readonly ApplicationDbContext _context;


    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

   
    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {

        return await _context.Users.ToListAsync();
    }

    /*
    Asma
    This endpoint is used to get the user by ID
    */
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound(); 
        }

        return user;
    }
    /*
    Hayden
    This endpoint is used to authenticate the user by accpecting the email and password (which would be hashed in a realease version) and then returns the user information
    */
    [HttpPost("login")]
    public async Task<ActionResult<User>> LoginUser([FromBody] UserLoginDto login)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == login.Email && 
                                      u.PasswordHash == login.PasswordHash);
        if (user == null)
        {
            return Unauthorized("Invalid email or password.");
        }

        return user;
    }
    /*
    Hayden
    This endpoint is used to create a new user, it accepts the users informations and makes sure its valid, it then also checks that the EMAIL doesnt already exsit,
    if succesfull it adds the user to the database and then returns the user to be used in the frontend.
    */
    [HttpPost]
    public async Task<ActionResult<User>> PostUser([FromBody] User user)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState); 
        }

        if (await _context.Users.AnyAsync(u => u.Email == user.Email))
        {
            return Conflict("A user with this email address already exists."); 
        }

        user.CreatedDate = DateTime.UtcNow;

        _context.Users.Add(user);
        
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
    }
    /*
    Adrian
    This endpoint is used to get create a new Task for the user, it accepts the task information and then add its to the database with the status Open.
    */
    [HttpPost("{userId}/Tasks")]
    public async Task<ActionResult<UserTask>> PostTaskForUser(int userId, [FromBody] UserTask userTask)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        
        var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
        {
            return NotFound($"User with ID {userId} not found.");
        }
        
        userTask.UserId = userId; 
        
        userTask.CompletionDate = null;
        
        if (string.IsNullOrWhiteSpace(userTask.Status))
        {
            userTask.Status = "Open";
        }

        _context.UserTasks.Add(userTask);
        await _context.SaveChangesAsync();


        return CreatedAtAction(nameof(GetTasksForUser), new { userId = userTask.UserId }, userTask);
    }
    /*
    Asma
    This endpoint is used to get All tasks of the user, it then also checks if the task is completed and sends the information to the frontend
    */
    [HttpGet("{userId}/Tasks")]
    public async Task<ActionResult<IEnumerable<UserTask>>> GetTasksForUser(int userId)
    {
        var user = await _context.Users
                                 .Include(u => u.Tasks) 
                                 .FirstOrDefaultAsync(u => u.Id == userId);
        
        if (user == null)
        {
            return NotFound($"User with ID {userId} not found.");
        }
        
        var userTasks = user.Tasks.Cast<UserTask>().ToList();

        if (!userTasks.Any())
        {
            return Ok(new List<UserTask>());
        }

        return Ok(userTasks);
    }
    /*
    Adrian
    This endpoint is used to set a task as Complete, it takes the taskID and userId and marks the select task as complete.
    */
    [HttpPut("{userId}/Tasks/{taskId}/Complete")]
    public async Task<IActionResult> CompleteTask(int userId, int taskId)
    {
        var taskToComplete = await _context.UserTasks
            .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);

        if (taskToComplete == null)
        {
            return NotFound($"Task with ID {taskId} not found for User ID {userId}.");
        }

        if (taskToComplete.CompletionDate == null)
        {
            taskToComplete.CompletionDate = DateTime.UtcNow;
        }
        taskToComplete.Status = "Done";

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!TaskExists(taskId))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }
        return NoContent();
    }
 
     /*
    Adrian
    Helper function to check if the task exists
    */
    private bool TaskExists(int id)
    {
        return _context.UserTasks.Any(e => e.Id == id);
    }

}
