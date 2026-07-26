using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RoomHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SecureDepositPaymentProof : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Deposits_RoomId",
                table: "Deposits");

            migrationBuilder.AddColumn<int>(
                name: "ActiveHoldRoomId",
                table: "Deposits",
                type: "int",
                nullable: true,
                computedColumnSql: "CASE WHEN [Status] IN ('Holding','Active') THEN [RoomId] ELSE NULL END",
                stored: true);

            migrationBuilder.CreateTable(
                name: "DepositPaymentProofs",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    StorageUrl = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: false),
                    OriginalFileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DepositId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DepositPaymentProofs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DepositPaymentProofs_AspNetUsers_TenantId",
                        column: x => x.TenantId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DepositPaymentProofs_Deposits_DepositId",
                        column: x => x.DepositId,
                        principalTable: "Deposits",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Deposits_ActiveHoldRoomId",
                table: "Deposits",
                column: "ActiveHoldRoomId",
                unique: true,
                filter: "[ActiveHoldRoomId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Deposits_RoomId_Status",
                table: "Deposits",
                columns: new[] { "RoomId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_DepositPaymentProofs_DepositId",
                table: "DepositPaymentProofs",
                column: "DepositId",
                unique: true,
                filter: "[DepositId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_DepositPaymentProofs_TenantId_CreatedAt",
                table: "DepositPaymentProofs",
                columns: new[] { "TenantId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DepositPaymentProofs");

            migrationBuilder.DropIndex(
                name: "IX_Deposits_ActiveHoldRoomId",
                table: "Deposits");

            migrationBuilder.DropIndex(
                name: "IX_Deposits_RoomId_Status",
                table: "Deposits");

            migrationBuilder.DropColumn(
                name: "ActiveHoldRoomId",
                table: "Deposits");

            migrationBuilder.CreateIndex(
                name: "IX_Deposits_RoomId",
                table: "Deposits",
                column: "RoomId");
        }
    }
}
