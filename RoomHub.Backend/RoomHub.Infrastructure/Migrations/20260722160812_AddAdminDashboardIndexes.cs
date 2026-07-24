using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RoomHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminDashboardIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Subscriptions_Status_CreatedAt",
                table: "Subscriptions",
                columns: new[] { "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Rooms_IsDeleted_HasListing_CreatedAt_ModerationStatus",
                table: "Rooms",
                columns: new[] { "IsDeleted", "HasListing", "CreatedAt", "ModerationStatus" });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_CreatedAt",
                table: "AuditLogs",
                column: "CreatedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Subscriptions_Status_CreatedAt",
                table: "Subscriptions");

            migrationBuilder.DropIndex(
                name: "IX_Rooms_IsDeleted_HasListing_CreatedAt_ModerationStatus",
                table: "Rooms");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_CreatedAt",
                table: "AuditLogs");
        }
    }
}
