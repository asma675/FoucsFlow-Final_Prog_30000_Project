using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FocusFlowAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FirstName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserTasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Priority = table.Column<int>(type: "INTEGER", nullable: false),
                    DueDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Category = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    CompletionDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    EstimatedTime = table.Column<TimeSpan>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserTasks_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedDate", "Email", "FirstName", "LastName", "PasswordHash" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 10, 0, 0, 0, DateTimeKind.Utc), "admin@example.com", "Admin", "User", "PlaceholderHash12345" },
                    { 2, new DateTime(2025, 1, 1, 10, 5, 0, 0, DateTimeKind.Utc), "test@example.com", "Test", "Client", "PlaceholderHash54321" }
                });

            migrationBuilder.InsertData(
                table: "UserTasks",
                columns: new[] { "Id", "Category", "CompletionDate", "DueDate", "EstimatedTime", "Priority", "Status", "Title", "UserId" },
                values: new object[,]
                {
                    { 1, "Development", null, new DateTime(2025, 1, 15, 12, 0, 0, 0, DateTimeKind.Utc), new TimeSpan(0, 4, 30, 0, 0), 1, "In Progress", "Set up API Endpoint", 1 },
                    { 2, "Development", new DateTime(2025, 1, 4, 18, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 5, 9, 0, 0, 0, DateTimeKind.Utc), new TimeSpan(0, 2, 0, 0, 0), 2, "Done", "Define User Model", 1 },
                    { 3, "Testing", null, new DateTime(2025, 1, 30, 17, 0, 0, 0, DateTimeKind.Utc), new TimeSpan(0, 1, 0, 0, 0), 3, "Open", "Review Task Requirements", 2 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserTasks_UserId",
                table: "UserTasks",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserTasks");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
