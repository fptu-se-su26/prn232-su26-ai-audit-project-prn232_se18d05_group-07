using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RoomHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantIdToBookingHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TenantId",
                table: "BookingHistories",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_BookingHistories_TenantId",
                table: "BookingHistories",
                column: "TenantId");

            migrationBuilder.AddForeignKey(
                name: "FK_BookingHistories_AspNetUsers_TenantId",
                table: "BookingHistories",
                column: "TenantId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookingHistories_AspNetUsers_TenantId",
                table: "BookingHistories");

            migrationBuilder.DropIndex(
                name: "IX_BookingHistories_TenantId",
                table: "BookingHistories");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "BookingHistories");
        }
    }
}
