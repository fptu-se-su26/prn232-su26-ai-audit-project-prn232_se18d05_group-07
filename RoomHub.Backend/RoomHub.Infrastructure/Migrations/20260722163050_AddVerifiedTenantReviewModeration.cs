using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RoomHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVerifiedTenantReviewModeration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reviews_TenantId",
                table: "Reviews");

            migrationBuilder.AddColumn<int>(
                name: "ReviewEligibilityDaysAfterContract",
                table: "SystemSettings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "AdminNote",
                table: "ReviewViolations",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "ReviewViolations",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReasonCode",
                table: "ReviewViolations",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReporterId",
                table: "ReviewViolations",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ReviewId",
                table: "ReviewViolations",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReviewedAt",
                table: "ReviewViolations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReviewedByAdminId",
                table: "ReviewViolations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "ReviewViolations",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ContractId",
                table: "Reviews",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Reviews",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModeratedAt",
                table: "Reviews",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModeratedByAdminId",
                table: "Reviews",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModerationReason",
                table: "Reviews",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModerationStatus",
                table: "Reviews",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Visible");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Reviews",
                type: "datetime2",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 1,
                column: "ReviewEligibilityDaysAfterContract",
                value: 90);

            migrationBuilder.CreateIndex(
                name: "IX_ReviewViolations_ReviewId_ReporterId_Status",
                table: "ReviewViolations",
                columns: new[] { "ReviewId", "ReporterId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ContractId",
                table: "Reviews",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "UX_Reviews_Tenant_Room_Original",
                table: "Reviews",
                columns: new[] { "TenantId", "RoomId" },
                unique: true,
                filter: "[ParentReviewId] IS NULL AND [IsDeleted] = 0");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Contracts_ContractId",
                table: "Reviews",
                column: "ContractId",
                principalTable: "Contracts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ReviewViolations_Reviews_ReviewId",
                table: "ReviewViolations",
                column: "ReviewId",
                principalTable: "Reviews",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Contracts_ContractId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_ReviewViolations_Reviews_ReviewId",
                table: "ReviewViolations");

            migrationBuilder.DropIndex(
                name: "IX_ReviewViolations_ReviewId_ReporterId_Status",
                table: "ReviewViolations");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_ContractId",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "UX_Reviews_Tenant_Room_Original",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "ReviewEligibilityDaysAfterContract",
                table: "SystemSettings");

            migrationBuilder.DropColumn(
                name: "AdminNote",
                table: "ReviewViolations");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "ReviewViolations");

            migrationBuilder.DropColumn(
                name: "ReasonCode",
                table: "ReviewViolations");

            migrationBuilder.DropColumn(
                name: "ReporterId",
                table: "ReviewViolations");

            migrationBuilder.DropColumn(
                name: "ReviewId",
                table: "ReviewViolations");

            migrationBuilder.DropColumn(
                name: "ReviewedAt",
                table: "ReviewViolations");

            migrationBuilder.DropColumn(
                name: "ReviewedByAdminId",
                table: "ReviewViolations");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "ReviewViolations");

            migrationBuilder.DropColumn(
                name: "ContractId",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "ModeratedAt",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "ModeratedByAdminId",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "ModerationReason",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "ModerationStatus",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Reviews");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_TenantId",
                table: "Reviews",
                column: "TenantId");
        }
    }
}
