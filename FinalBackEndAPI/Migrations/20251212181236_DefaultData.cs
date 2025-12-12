using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FinalBackEndAPI.Migrations
{
    /// <inheritdoc />
    public partial class DefaultData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedDate", "Email", "FirstName", "LastName", "PasswordHash" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 10, 0, 0, 0, DateTimeKind.Utc), "admin@example.com", "Admin", "User", "PlaceholderHash12345" },
                    { 2, new DateTime(2025, 1, 1, 10, 5, 0, 0, DateTimeKind.Utc), "test@example.com", "Test", "Client", "PlaceholderHash54321" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2);
        }
    }
}
