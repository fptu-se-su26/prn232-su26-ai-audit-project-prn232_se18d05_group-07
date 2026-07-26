using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RoomHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReviewRevisionHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ReviewRevisions",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReviewId = table.Column<int>(type: "int", nullable: false),
                    EditedByUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PreviousRating = table.Column<byte>(type: "tinyint", nullable: true),
                    PreviousComment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    PreviousModerationStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NewRating = table.Column<byte>(type: "tinyint", nullable: true),
                    NewComment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    NewModerationStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReviewRevisions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReviewRevisions_AspNetUsers_EditedByUserId",
                        column: x => x.EditedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ReviewRevisions_Reviews_ReviewId",
                        column: x => x.ReviewId,
                        principalTable: "Reviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReviewRevisions_EditedByUserId",
                table: "ReviewRevisions",
                column: "EditedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ReviewRevisions_ReviewId_CreatedAt",
                table: "ReviewRevisions",
                columns: new[] { "ReviewId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ReviewRevisions");
        }
    }
}
