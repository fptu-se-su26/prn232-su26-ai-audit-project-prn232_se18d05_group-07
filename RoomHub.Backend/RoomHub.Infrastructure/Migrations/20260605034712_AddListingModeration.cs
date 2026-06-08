using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RoomHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddListingModeration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AIFormattedDescription",
                table: "Rooms",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ListingScore",
                table: "Rooms",
                type: "int",
                nullable: false,
                defaultValue: 100);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModeratedAt",
                table: "Rooms",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModerationRemarks",
                table: "Rooms",
                type: "nvarchar(2048)",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModerationStatus",
                table: "Rooms",
                type: "varchar(30)",
                nullable: false,
                defaultValue: "Approved");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AIFormattedDescription",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "ListingScore",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "ModeratedAt",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "ModerationRemarks",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "ModerationStatus",
                table: "Rooms");
        }
    }
}
