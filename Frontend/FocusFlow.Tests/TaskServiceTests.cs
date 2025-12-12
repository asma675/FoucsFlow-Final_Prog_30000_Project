using FocusFlow.Api.Data;
using FocusFlow.Api.DTOs;
using FocusFlow.Api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace FocusFlow.Tests;

public class TaskServiceTests
{
    private static TaskService CreateService()
    {
        var options = new DbContextOptionsBuilder<FocusFlowContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new FocusFlowContext(options);
        return new TaskService(context);
    }

    [Fact]
    public async Task CreateTask_AddsNewTask()
    {
        var service = CreateService();

        var dto = new TaskCreateDto { Title = "Test task" };
        var result = await service.CreateTaskAsync(1, dto);

        Assert.Equal("Test task", result.Title);
    }

    [Fact]
    public async Task GetTasks_ReturnsAllTasksForUser()
    {
        var service = CreateService();

        await service.CreateTaskAsync(1, new TaskCreateDto { Title = "Task 1" });
        await service.CreateTaskAsync(1, new TaskCreateDto { Title = "Task 2" });

        var tasks = await service.GetTasksAsync(1);

        Assert.Equal(2, tasks.Count());
    }

    [Fact]
    public async Task DeleteTask_RemovesTask()
    {
        var service = CreateService();

        var created = await service.CreateTaskAsync(1, new TaskCreateDto { Title = "Task 1" });

        var deleted = await service.DeleteTaskAsync(1, created.Id);
        var remaining = await service.GetTasksAsync(1);

        Assert.True(deleted);
        Assert.Empty(remaining);
    }
}
