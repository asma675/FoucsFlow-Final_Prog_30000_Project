using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FinalBackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToTasks1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Task");

            migrationBuilder.CreateTable(
                name: "UserTask",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CompletionDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EstimatedTime = table.Column<TimeSpan>(type: "time", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTask", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserTask_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "UserTask",
                columns: new[] { "Id", "Category", "CompletionDate", "DueDate", "EstimatedTime", "Priority", "Status", "Title", "UserId" },
                values: new object[,]
                {
                    { 1, "Development", null, new DateTime(2025, 1, 15, 12, 0, 0, 0, DateTimeKind.Utc), new TimeSpan(0, 4, 30, 0, 0), 1, "In Progress", "Set up API Endpoint", 1 },
                    { 2, "Development", new DateTime(2025, 1, 4, 18, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 5, 9, 0, 0, 0, DateTimeKind.Utc), new TimeSpan(0, 2, 0, 0, 0), 2, "Done", "Define User Model", 1 },
                    { 3, "Testing", null, new DateTime(2025, 1, 30, 17, 0, 0, 0, DateTimeKind.Utc), new TimeSpan(0, 1, 0, 0, 0), 3, "Open", "Review Task Requirements", 2 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserTask_UserId",
                table: "UserTask",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserTask");

            migrationBuilder.CreateTable(
                name: "Task",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CompletionDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EstimatedTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Task", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Task_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Task_UserId",
                table: "Task",
                column: "UserId");
        }
    }
}
