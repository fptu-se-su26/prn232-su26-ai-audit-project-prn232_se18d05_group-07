using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RoomHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRoomViewingAndDepositWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ConfirmedAt",
                table: "Deposits",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ForfeitReason",
                table: "Deposits",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "Deposits",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentProofUrl",
                table: "Deposits",
                type: "nvarchar(2048)",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RefundReason",
                table: "Deposits",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RefundedAt",
                table: "Deposits",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReleasedAt",
                table: "Deposits",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Deposits",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<string>(
                name: "TransactionId",
                table: "Deposits",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "ViewingBookingId",
                table: "Deposits",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "RoomViewingBookings",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoomId = table.Column<int>(type: "int", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RequestedStartAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RequestedEndAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ScheduledStartAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ScheduledEndAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TenantNote = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    OwnerNote = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RejectReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoomViewingBookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoomViewingBookings_AspNetUsers_TenantId",
                        column: x => x.TenantId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RoomViewingBookings_Rooms_RoomId",
                        column: x => x.RoomId,
                        principalTable: "Rooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Deposits_TransactionId",
                table: "Deposits",
                column: "TransactionId",
                unique: true,
                filter: "[TransactionId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Deposits_ViewingBookingId",
                table: "Deposits",
                column: "ViewingBookingId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Deposits_ValidValues",
                table: "Deposits",
                sql: "[Amount] > 0 AND [HoldDurationDays] > 0 AND [ExpiresAt] > [PlacedAt]");

            migrationBuilder.CreateIndex(
                name: "IX_RoomViewingBookings_RoomId_ScheduledStartAt_ScheduledEndAt_Status",
                table: "RoomViewingBookings",
                columns: new[] { "RoomId", "ScheduledStartAt", "ScheduledEndAt", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_RoomViewingBookings_TenantId_Status",
                table: "RoomViewingBookings",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.AddForeignKey(
                name: "FK_Deposits_RoomViewingBookings_ViewingBookingId",
                table: "Deposits",
                column: "ViewingBookingId",
                principalTable: "RoomViewingBookings",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Deposits_RoomViewingBookings_ViewingBookingId",
                table: "Deposits");

            migrationBuilder.DropTable(
                name: "RoomViewingBookings");

            migrationBuilder.DropIndex(
                name: "IX_Deposits_TransactionId",
                table: "Deposits");

            migrationBuilder.DropIndex(
                name: "IX_Deposits_ViewingBookingId",
                table: "Deposits");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Deposits_ValidValues",
                table: "Deposits");

            migrationBuilder.DropColumn(
                name: "ConfirmedAt",
                table: "Deposits");

            migrationBuilder.DropColumn(
                name: "ForfeitReason",
                table: "Deposits");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "Deposits");

            migrationBuilder.DropColumn(
                name: "PaymentProofUrl",
                table: "Deposits");

            migrationBuilder.DropColumn(
                name: "RefundReason",
                table: "Deposits");

            migrationBuilder.DropColumn(
                name: "RefundedAt",
                table: "Deposits");

            migrationBuilder.DropColumn(
                name: "ReleasedAt",
                table: "Deposits");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Deposits");

            migrationBuilder.DropColumn(
                name: "TransactionId",
                table: "Deposits");

            migrationBuilder.DropColumn(
                name: "ViewingBookingId",
                table: "Deposits");
        }
    }
}
