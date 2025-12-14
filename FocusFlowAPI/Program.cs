using FocusFlowAPI.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        policy =>
        {
            policy.WithOrigins("http://127.0.0.1:5500") 
                  .AllowAnyHeader()  
                  .AllowAnyMethod();
            policy.WithOrigins("http://127.0.0.1:3000") 
                  .AllowAnyHeader()  
                  .AllowAnyMethod(); 
        });
});
builder.Services.AddControllers();
builder.Services.AddEntityFrameworkSqlite().AddDbContext<ApplicationDbContext>();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
app.UseCors("CorsPolicy");
app.Run();
