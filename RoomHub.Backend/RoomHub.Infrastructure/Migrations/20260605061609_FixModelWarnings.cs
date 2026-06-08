using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RoomHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixModelWarnings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ModerationStatus",
                table: "Rooms",
                type: "varchar(30)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(30)",
                oldDefaultValue: "Approved");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ModerationStatus",
                table: "Rooms",
                type: "varchar(30)",
                nullable: false,
                defaultValue: "Approved",
                oldClrType: typeof(string),
                oldType: "varchar(30)");
        }
    }
}
