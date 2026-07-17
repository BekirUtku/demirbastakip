using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DemirbasTakip.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailSignatureModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EnglishTitle",
                table: "Personnel",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SignatureLocationId",
                table: "Personnel",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SignatureLocations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    AddressLine1 = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    AddressLine2 = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    LokumPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    OgasPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SignatureLocations", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Personnel_SignatureLocationId",
                table: "Personnel",
                column: "SignatureLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_SignatureLocations_Name",
                table: "SignatureLocations",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_SignatureLocations_Type_IsActive",
                table: "SignatureLocations",
                columns: new[] { "Type", "IsActive" });

            migrationBuilder.AddForeignKey(
                name: "FK_Personnel_SignatureLocations_SignatureLocationId",
                table: "Personnel",
                column: "SignatureLocationId",
                principalTable: "SignatureLocations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Personnel_SignatureLocations_SignatureLocationId",
                table: "Personnel");

            migrationBuilder.DropTable(
                name: "SignatureLocations");

            migrationBuilder.DropIndex(
                name: "IX_Personnel_SignatureLocationId",
                table: "Personnel");

            migrationBuilder.DropColumn(
                name: "EnglishTitle",
                table: "Personnel");

            migrationBuilder.DropColumn(
                name: "SignatureLocationId",
                table: "Personnel");
        }
    }
}
