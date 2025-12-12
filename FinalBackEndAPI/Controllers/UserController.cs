using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinalBackEndAPI.Data; 
using FinalBackEndAPI.Models; 

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
private bool TaskExists(int id)
{
    return _context.UserTasks.Any(e => e.Id == id);
}

}