using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RoomHub.Infrastructure.Migrations
{
    public partial class AddHiddenByOwner : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HiddenByOwner",
                table: "Rooms",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HiddenByOwner",
                table: "Rooms");
        }
    }
}
