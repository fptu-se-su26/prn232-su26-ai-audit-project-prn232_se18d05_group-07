using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RoomHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class IndexViewingBookingTenantRoom : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_RoomViewingBookings_TenantId_RoomId",
                table: "RoomViewingBookings",
                columns: new[] { "TenantId", "RoomId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RoomViewingBookings_TenantId_RoomId",
                table: "RoomViewingBookings");
        }
    }
}
