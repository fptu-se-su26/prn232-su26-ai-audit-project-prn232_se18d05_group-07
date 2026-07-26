using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence
{
    public static class DbInitializer
    {
        public static async Task SeedDataAsync(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            // Apply migrations automatically if any pending
            if ((await context.Database.GetPendingMigrationsAsync()).Any())
            {
                await context.Database.MigrateAsync();
            }

            // 1. Seed Roles
            var roles = new[] { "Administrator", "PropertyOwner", "Tenant" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }

            // 1b. Seed Admin account
            var adminEmail = "admin@roomhub.vn";
            var existingAdmin = await userManager.FindByEmailAsync(adminEmail);
            if (existingAdmin == null)
            {
                var admin = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    FullName = "Admin RoomHub",
                    EmailConfirmed = true,
                    PhoneNumber = "0900000000",
                    IsVerified = true,
                    VerificationDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };
                var adminResult = await userManager.CreateAsync(admin, "Admin@123");
                if (adminResult.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, "Administrator");
                }
            }
            else
            {
                existingAdmin.EmailConfirmed = true;
                existingAdmin.IsVerified = true;
                existingAdmin.IsBanned = false;
                existingAdmin.BannedUntil = null;
                await userManager.UpdateAsync(existingAdmin);

                if (!await userManager.CheckPasswordAsync(existingAdmin, "Admin@123"))
                {
                    var token = await userManager.GeneratePasswordResetTokenAsync(existingAdmin);
                    await userManager.ResetPasswordAsync(existingAdmin, token, "Admin@123");
                }

                if (!await userManager.IsInRoleAsync(existingAdmin, "Administrator"))
                {
                    await userManager.AddToRoleAsync(existingAdmin, "Administrator");
                }
            }

            // 2. Seed Users
            ApplicationUser owner = null!;
            ApplicationUser tenant1 = null!;
            ApplicationUser tenant2 = null!;
            ApplicationUser tenant3 = null!;

            var ownerEmail = "owner@roomhub.vn";
            var existingOwner = await userManager.FindByEmailAsync(ownerEmail);
            if (existingOwner == null)
            {
                owner = new ApplicationUser
                {
                    UserName = ownerEmail,
                    Email = ownerEmail,
                    FullName = "Phan Hoài An",
                    EmailConfirmed = true,
                    PhoneNumber = "0905123456",
                    IsVerified = true,
                    VerificationDate = DateTime.UtcNow,
                    CurrentPlan = SubscriptionPlan.Yearly,
                    SubscriptionExpiry = DateTime.UtcNow.AddYears(1),
                    CreatedAt = DateTime.UtcNow
                };
                var result = await userManager.CreateAsync(owner, "Password123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(owner, "PropertyOwner");
                }
            }
            else
            {
                owner = existingOwner;
                owner.EmailConfirmed = true;
                owner.IsVerified = true;
                owner.IsBanned = false;
                owner.BannedUntil = null;
                owner.CurrentPlan = SubscriptionPlan.Yearly;
                owner.SubscriptionExpiry = DateTime.UtcNow.AddYears(1);
                await userManager.UpdateAsync(owner);

                if (!await userManager.CheckPasswordAsync(owner, "Password123!"))
                {
                    var token = await userManager.GeneratePasswordResetTokenAsync(owner);
                    await userManager.ResetPasswordAsync(owner, token, "Password123!");
                }

                if (!await userManager.IsInRoleAsync(owner, "PropertyOwner"))
                {
                    await userManager.AddToRoleAsync(owner, "PropertyOwner");
                }
            }

            // Seed Tenants
            var tenantsData = new[]
            {
                new { Email = "tenant1@gmail.com", FullName = "Nguyễn Văn A", Phone = "0905111111" },
                new { Email = "tenant2@gmail.com", FullName = "Trần Thị B", Phone = "0905222222" },
                new { Email = "tenant3@gmail.com", FullName = "Lê Văn C", Phone = "0905333333" }
            };

            var seededTenants = new List<ApplicationUser>();
            foreach (var tData in tenantsData)
            {
                var existingTenant = await userManager.FindByEmailAsync(tData.Email);
                if (existingTenant == null)
                {
                    var newTenant = new ApplicationUser
                    {
                        UserName = tData.Email,
                        Email = tData.Email,
                        FullName = tData.FullName,
                        EmailConfirmed = true,
                        PhoneNumber = tData.Phone,
                        CreatedAt = DateTime.UtcNow
                    };
                    var result = await userManager.CreateAsync(newTenant, "Password123!");
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(newTenant, "Tenant");
                        seededTenants.Add(newTenant);
                    }
                }
                else
                {
                    existingTenant.EmailConfirmed = true;
                    await userManager.UpdateAsync(existingTenant);

                    if (!await userManager.CheckPasswordAsync(existingTenant, "Password123!"))
                    {
                        var token = await userManager.GeneratePasswordResetTokenAsync(existingTenant);
                        await userManager.ResetPasswordAsync(existingTenant, token, "Password123!");
                    }

                    if (!await userManager.IsInRoleAsync(existingTenant, "Tenant"))
                    {
                        await userManager.AddToRoleAsync(existingTenant, "Tenant");
                    }

                    seededTenants.Add(existingTenant);
                }
            }

            tenant1 = seededTenants.FirstOrDefault(t => t.Email == "tenant1@gmail.com")!;
            tenant2 = seededTenants.FirstOrDefault(t => t.Email == "tenant2@gmail.com")!;
            tenant3 = seededTenants.FirstOrDefault(t => t.Email == "tenant3@gmail.com")!;

            // 3. Seed Buildings & Rooms (only if no buildings exist for this owner)
            if (!context.Buildings.Any(b => b.OwnerId == owner.Id))
            {
                // Building 1: FPT House
                var fptHouse = new Building
                {
                    OwnerId = owner.Id,
                    Name = "FPT House",
                    Province = "Đà Nẵng",
                    City = "Đà Nẵng",
                    District = "Quận Ngũ Hành Sơn",
                    Ward = "Hòa Hải",
                    Address = "Đường Nam Kỳ Khởi Nghĩa, Hòa Hải, Ngũ Hành Sơn, Đà Nẵng",
                    ElectricityPrice = 3500,
                    WaterPrice = 15000,
                    InternetPrice = 100000,
                    GarbagePrice = 30000,
                    ThumbnailUrl = "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
                    CreatedAt = DateTime.UtcNow
                };
                context.Buildings.Add(fptHouse);
                await context.SaveChangesAsync();

                // Create 4 Floors for FPT House
                var floors = new List<Floor>();
                for (int f = 1; f <= 4; f++)
                {
                    var floor = new Floor
                    {
                        BuildingId = fptHouse.Id,
                        FloorNumber = f,
                        Description = $"Tầng {f}"
                    };
                    context.Floors.Add(floor);
                    floors.Add(floor);
                }
                await context.SaveChangesAsync();

                // Create Rooms for each floor (5 rooms per floor)
                var rooms = new List<Room>();
                foreach (var floor in floors)
                {
                    for (int r = 1; r <= 5; r++)
                    {
                        var roomNumber = $"{floor.FloorNumber}0{r}";
                        var isUpper = floor.FloorNumber >= 3;
                        var room = new Room
                        {
                            FloorId = floor.Id,
                            RoomNumber = roomNumber,
                            RoomType = RoomType.BoardingHouse,
                            MaxCapacity = 2,
                            SurfaceArea = 25,
                            BasePrice = isUpper ? 2800000 : 2500000,
                            Description = $"Phòng tiện nghi sạch sẽ, thoáng mát tầng {floor.FloorNumber}",
                            IsFurnished = true,
                            Status = RoomStatus.Available,
                            LandlordId = owner.Id,
                            Title = $"Phòng trọ {roomNumber} tại FPT House",
                            IsPublished = true,
                            HasListing = true,
                            CreatedAt = DateTime.UtcNow
                        };
                        context.Rooms.Add(room);
                        rooms.Add(room);
                    }
                }
                await context.SaveChangesAsync();

                // Building 2: Mỹ Khê Sea View Studio
                var myKheStudio = new Building
                {
                    OwnerId = owner.Id,
                    Name = "Mỹ Khê Sea View Studio",
                    Province = "Đà Nẵng",
                    City = "Đà Nẵng",
                    District = "Quận Sơn Trà",
                    Ward = "Phước Mỹ",
                    Address = "Đường Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng",
                    ElectricityPrice = 3800,
                    WaterPrice = 18000,
                    InternetPrice = 120000,
                    GarbagePrice = 40000,
                    ThumbnailUrl = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
                    CreatedAt = DateTime.UtcNow
                };
                context.Buildings.Add(myKheStudio);
                await context.SaveChangesAsync();

                var studioFloor = new Floor
                {
                    BuildingId = myKheStudio.Id,
                    FloorNumber = 1,
                    Description = "Tầng trệt"
                };
                context.Floors.Add(studioFloor);
                await context.SaveChangesAsync();

                var studioRooms = new List<Room>();
                for (int r = 1; r <= 4; r++)
                {
                    var roomNumber = $"10{r}";
                    var room = new Room
                    {
                        FloorId = studioFloor.Id,
                        RoomNumber = roomNumber,
                        RoomType = RoomType.Studio,
                        MaxCapacity = 2,
                        SurfaceArea = 35,
                        BasePrice = 5500000,
                        Description = $"Căn hộ studio view biển Mỹ Khê phòng {roomNumber}",
                        IsFurnished = true,
                        Status = RoomStatus.Available,
                        LandlordId = owner.Id,
                        Title = $"Studio view biển Mỹ Khê {roomNumber}",
                        IsPublished = true,
                        HasListing = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    context.Rooms.Add(room);
                    studioRooms.Add(room);
                }
                await context.SaveChangesAsync();

                // 4. Seed Contracts
                // Room 101 (FPT House) -> Tenant 1
                var room101FPT = rooms.First(r => r.RoomNumber == "101");
                room101FPT.Status = RoomStatus.Occupied;

                var contract1 = new Contract
                {
                    RoomId = room101FPT.Id,
                    TenantId = tenant1?.Id,
                    OwnerId = owner.Id,
                    TemporaryTenantName = tenant1?.FullName ?? "Nguyễn Văn A",
                    TemporaryTenantPhone = tenant1?.PhoneNumber ?? "0905111111",
                    TemporaryTenantEmail = tenant1?.Email ?? "tenant1@gmail.com",
                    StartDate = DateTime.UtcNow.AddMonths(-3),
                    EndDate = DateTime.UtcNow.AddMonths(9),
                    RentAmount = room101FPT.BasePrice,
                    DepositAmount = room101FPT.BasePrice,
                    Terms = "Hợp đồng thuê 1 năm, đóng tiền ngày 5 hàng tháng. Tiền cọc 1 tháng.",
                    Status = ContractStatus.Active,
                    CreatedAt = DateTime.UtcNow.AddMonths(-3)
                };
                context.Contracts.Add(contract1);

                // Room 102 (FPT House) -> Tenant 2
                var room102FPT = rooms.First(r => r.RoomNumber == "102");
                room102FPT.Status = RoomStatus.Occupied;

                var contract2 = new Contract
                {
                    RoomId = room102FPT.Id,
                    TenantId = tenant2?.Id,
                    OwnerId = owner.Id,
                    TemporaryTenantName = tenant2?.FullName ?? "Trần Thị B",
                    TemporaryTenantPhone = tenant2?.PhoneNumber ?? "0905222222",
                    TemporaryTenantEmail = tenant2?.Email ?? "tenant2@gmail.com",
                    StartDate = DateTime.UtcNow.AddMonths(-1),
                    EndDate = DateTime.UtcNow.AddMonths(5),
                    RentAmount = room102FPT.BasePrice,
                    DepositAmount = room102FPT.BasePrice,
                    Terms = "Hợp đồng thuê 6 tháng. Đóng tiền ngày 5 hàng tháng.",
                    Status = ContractStatus.Active,
                    CreatedAt = DateTime.UtcNow.AddMonths(-1)
                };
                context.Contracts.Add(contract2);

                // Room 201 (FPT House) -> Tenant 3
                var room201FPT = rooms.First(r => r.RoomNumber == "201");
                room201FPT.Status = RoomStatus.Occupied;

                var contract3 = new Contract
                {
                    RoomId = room201FPT.Id,
                    TenantId = tenant3?.Id,
                    OwnerId = owner.Id,
                    TemporaryTenantName = tenant3?.FullName ?? "Lê Văn C",
                    TemporaryTenantPhone = tenant3?.PhoneNumber ?? "0905333333",
                    TemporaryTenantEmail = tenant3?.Email ?? "tenant3@gmail.com",
                    StartDate = DateTime.UtcNow.AddMonths(-2),
                    EndDate = DateTime.UtcNow.AddMonths(10),
                    RentAmount = room201FPT.BasePrice,
                    DepositAmount = room201FPT.BasePrice,
                    Terms = "Hợp đồng thuê 1 năm. Điện 3500đ/kwh, Nước 15000đ/m3.",
                    Status = ContractStatus.Active,
                    CreatedAt = DateTime.UtcNow.AddMonths(-2)
                };
                context.Contracts.Add(contract3);

                // Room 101 (Mỹ Khê Studio) -> Tenant 1 (again)
                var room101Studio = studioRooms.First(r => r.RoomNumber == "101");
                room101Studio.Status = RoomStatus.Occupied;

                var contract4 = new Contract
                {
                    RoomId = room101Studio.Id,
                    TenantId = tenant1?.Id,
                    OwnerId = owner.Id,
                    TemporaryTenantName = tenant1?.FullName ?? "Nguyễn Văn A",
                    TemporaryTenantPhone = tenant1?.PhoneNumber ?? "0905111111",
                    TemporaryTenantEmail = tenant1?.Email ?? "tenant1@gmail.com",
                    StartDate = DateTime.UtcNow.AddMonths(-1),
                    EndDate = DateTime.UtcNow.AddMonths(11),
                    RentAmount = room101Studio.BasePrice,
                    DepositAmount = room101Studio.BasePrice,
                    Terms = "Hợp đồng thuê Studio 1 năm.",
                    Status = ContractStatus.Active,
                    CreatedAt = DateTime.UtcNow.AddMonths(-1)
                };
                context.Contracts.Add(contract4);

                await context.SaveChangesAsync();

                // 5. Seed Utility Readings & Invoices
                // We seed meter readings for room 101 (FPT House) for the previous 2 months.
                var readingDate1 = DateTime.UtcNow.AddMonths(-2); // Month -2
                var readingDate2 = DateTime.UtcNow.AddMonths(-1); // Month -1

                var electricityReading1 = new UtilityReading
                {
                    ContractId = contract1.Id,
                    ReadingDate = readingDate1,
                    UtilityType = UtilityType.Electricity,
                    OldIndex = 100,
                    NewIndex = 180,
                    Usage = 80,
                    Amount = 80 * fptHouse.ElectricityPrice
                };
                var waterReading1 = new UtilityReading
                {
                    ContractId = contract1.Id,
                    ReadingDate = readingDate1,
                    UtilityType = UtilityType.Water,
                    OldIndex = 10,
                    NewIndex = 16,
                    Usage = 6,
                    Amount = 6 * fptHouse.WaterPrice
                };
                context.UtilityReadings.AddRange(electricityReading1, waterReading1);

                var electricityReading2 = new UtilityReading
                {
                    ContractId = contract1.Id,
                    ReadingDate = readingDate2,
                    UtilityType = UtilityType.Electricity,
                    OldIndex = 180,
                    NewIndex = 270,
                    Usage = 90,
                    Amount = 90 * fptHouse.ElectricityPrice
                };
                var waterReading2 = new UtilityReading
                {
                    ContractId = contract1.Id,
                    ReadingDate = readingDate2,
                    UtilityType = UtilityType.Water,
                    OldIndex = 16,
                    NewIndex = 23,
                    Usage = 7,
                    Amount = 7 * fptHouse.WaterPrice
                };
                context.UtilityReadings.AddRange(electricityReading2, waterReading2);
                await context.SaveChangesAsync();

                // Create paid invoice for Month -2
                var invoiceMonth2 = new Invoice
                {
                    ContractId = contract1.Id,
                    InvoiceDate = readingDate1,
                    DueDate = readingDate1.AddDays(5),
                    Status = InvoiceStatus.Paid,
                    CreatedAt = readingDate1,
                    TotalAmount = contract1.RentAmount + (80 * fptHouse.ElectricityPrice) + (6 * fptHouse.WaterPrice) + fptHouse.InternetPrice + fptHouse.GarbagePrice
                };
                context.Invoices.Add(invoiceMonth2);
                await context.SaveChangesAsync();

                var invoiceMonth2Items = new[]
                {
                    new InvoiceItem { InvoiceId = invoiceMonth2.Id, ItemType = "Rent", Amount = contract1.RentAmount, Description = "Tiền thuê phòng tháng " + readingDate1.ToString("MM/yyyy") },
                    new InvoiceItem { InvoiceId = invoiceMonth2.Id, ItemType = "Electricity", Amount = 80 * fptHouse.ElectricityPrice, Description = $"Tiền điện (Chỉ số: 100 -> 180, Sử dụng: 80 kWh)" },
                    new InvoiceItem { InvoiceId = invoiceMonth2.Id, ItemType = "Water", Amount = 6 * fptHouse.WaterPrice, Description = $"Tiền nước (Chỉ số: 10 -> 16, Sử dụng: 6 m³)" },
                    new InvoiceItem { InvoiceId = invoiceMonth2.Id, ItemType = "Internet", Amount = fptHouse.InternetPrice, Description = "Tiền mạng Internet" },
                    new InvoiceItem { InvoiceId = invoiceMonth2.Id, ItemType = "Garbage", Amount = fptHouse.GarbagePrice, Description = "Tiền đổ rác & dịch vụ chung" }
                };
                context.InvoiceItems.AddRange(invoiceMonth2Items);

                var paymentMonth2 = new Payment
                {
                    InvoiceId = invoiceMonth2.Id,
                    Amount = invoiceMonth2.TotalAmount,
                    PaymentMethod = "BankTransfer",
                    TransactionId = "TXN" + DateTime.UtcNow.Ticks,
                    Status = "Completed",
                    PaidAt = readingDate1.AddDays(2)
                };
                context.Payments.Add(paymentMonth2);
                await context.SaveChangesAsync();

                // Create unpaid/overdue invoice for Month -1
                var invoiceMonth1 = new Invoice
                {
                    ContractId = contract1.Id,
                    InvoiceDate = readingDate2,
                    DueDate = readingDate2.AddDays(5),
                    Status = InvoiceStatus.Unpaid,
                    CreatedAt = readingDate2,
                    TotalAmount = contract1.RentAmount + (90 * fptHouse.ElectricityPrice) + (7 * fptHouse.WaterPrice) + fptHouse.InternetPrice + fptHouse.GarbagePrice
                };
                context.Invoices.Add(invoiceMonth1);
                await context.SaveChangesAsync();

                var invoiceMonth1Items = new[]
                {
                    new InvoiceItem { InvoiceId = invoiceMonth1.Id, ItemType = "Rent", Amount = contract1.RentAmount, Description = "Tiền thuê phòng tháng " + readingDate2.ToString("MM/yyyy") },
                    new InvoiceItem { InvoiceId = invoiceMonth1.Id, ItemType = "Electricity", Amount = 90 * fptHouse.ElectricityPrice, Description = $"Tiền điện (Chỉ số: 180 -> 270, Sử dụng: 90 kWh)" },
                    new InvoiceItem { InvoiceId = invoiceMonth1.Id, ItemType = "Water", Amount = 7 * fptHouse.WaterPrice, Description = $"Tiền nước (Chỉ số: 16 -> 23, Sử dụng: 7 m³)" },
                    new InvoiceItem { InvoiceId = invoiceMonth1.Id, ItemType = "Internet", Amount = fptHouse.InternetPrice, Description = "Tiền mạng Internet" },
                    new InvoiceItem { InvoiceId = invoiceMonth1.Id, ItemType = "Garbage", Amount = fptHouse.GarbagePrice, Description = "Tiền đổ rác & dịch vụ chung" }
                };
                context.InvoiceItems.AddRange(invoiceMonth1Items);
                await context.SaveChangesAsync();
            }

            await SeedDaNangDemoListingsAsync(context, owner);
        }

        private static async Task SeedDaNangDemoListingsAsync(
            ApplicationDbContext context,
            ApplicationUser owner)
        {
            const string demoSeedPrefix = "danang-demo";
            var now = DateTime.UtcNow;
            var amenities = await context.Amenities
                .OrderBy(a => a.Id)
                .ToListAsync();

            var buildingSpecs = new[]
            {
                new DemoBuildingSpec(
                    "An Thượng Urban Stay",
                    "Ngũ Hành Sơn",
                    "Mỹ An",
                    "35 An Thượng 3",
                    16.0488m,
                    108.2442m,
                    RoomType.Studio,
                    3200000m,
                    28m,
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"),
                new DemoBuildingSpec(
                    "Khuê Mỹ Riverside Rooms",
                    "Ngũ Hành Sơn",
                    "Khuê Mỹ",
                    "118 Chương Dương",
                    16.0349m,
                    108.2380m,
                    RoomType.BoardingHouse,
                    2500000m,
                    24m,
                    "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80"),
                new DemoBuildingSpec(
                    "Sơn Trà Ocean House",
                    "Sơn Trà",
                    "Phước Mỹ",
                    "92 Hồ Nghinh",
                    16.0686m,
                    108.2423m,
                    RoomType.Studio,
                    3900000m,
                    30m,
                    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80"),
                new DemoBuildingSpec(
                    "Mân Thái Coastal Residence",
                    "Sơn Trà",
                    "Mân Thái",
                    "41 Trương Định",
                    16.0904m,
                    108.2449m,
                    RoomType.MiniApartment,
                    4300000m,
                    34m,
                    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"),
                new DemoBuildingSpec(
                    "Hải Châu Central Living",
                    "Hải Châu",
                    "Bình Hiên",
                    "76 Núi Thành",
                    16.0478m,
                    108.2176m,
                    RoomType.MiniApartment,
                    4100000m,
                    32m,
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"),
                new DemoBuildingSpec(
                    "Thanh Khê Student Home",
                    "Thanh Khê",
                    "Thạc Gián",
                    "155 Hà Huy Tập",
                    16.0657m,
                    108.1972m,
                    RoomType.BoardingHouse,
                    2200000m,
                    22m,
                    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80"),
                new DemoBuildingSpec(
                    "Cẩm Lệ Green Apartments",
                    "Cẩm Lệ",
                    "Hòa Xuân",
                    "28 Nguyễn Phước Lan",
                    16.0114m,
                    108.2249m,
                    RoomType.Apartment,
                    5200000m,
                    42m,
                    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"),
                new DemoBuildingSpec(
                    "Liên Chiểu Campus House",
                    "Liên Chiểu",
                    "Hòa Khánh Bắc",
                    "63 Ngô Văn Sở",
                    16.0749m,
                    108.1493m,
                    RoomType.BoardingHouse,
                    2000000m,
                    21m,
                    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80")
            };

            var existingBuildingNames = await context.Buildings
                .Where(b => b.OwnerId == owner.Id)
                .Select(b => b.Name)
                .ToListAsync();
            var existingNames = existingBuildingNames.ToHashSet(StringComparer.OrdinalIgnoreCase);

            for (var buildingIndex = 0; buildingIndex < buildingSpecs.Length; buildingIndex++)
            {
                var spec = buildingSpecs[buildingIndex];
                if (existingNames.Contains(spec.Name))
                {
                    continue;
                }

                var building = new Building
                {
                    OwnerId = owner.Id,
                    Name = spec.Name,
                    Province = "Đà Nẵng",
                    City = "Đà Nẵng",
                    District = spec.District,
                    Ward = spec.Ward,
                    Address = spec.StreetAddress,
                    Latitude = spec.Latitude,
                    Longitude = spec.Longitude,
                    ElectricityPrice = 3500m + (buildingIndex % 3) * 200m,
                    WaterPrice = 15000m + (buildingIndex % 2) * 5000m,
                    WaterBillingType = "PerCubicMeter",
                    InternetPrice = 100000m,
                    GarbagePrice = 30000m,
                    ThumbnailUrl = spec.ImageUrl,
                    CreatedAt = now.AddDays(-(buildingIndex + 1))
                };
                context.Buildings.Add(building);

                for (var floorNumber = 1; floorNumber <= 3; floorNumber++)
                {
                    var floor = new Floor
                    {
                        Building = building,
                        FloorNumber = floorNumber,
                        Description = $"Tầng {floorNumber}"
                    };
                    context.Floors.Add(floor);

                    for (var roomIndex = 1; roomIndex <= 6; roomIndex++)
                    {
                        var roomNumber = $"{floorNumber}{roomIndex:00}";
                        var priceOffset = (floorNumber - 1) * 150000m + (roomIndex - 1) * 50000m;
                        var areaOffset = (roomIndex - 1) % 3;
                        var room = new Room
                        {
                            Floor = floor,
                            RoomNumber = roomNumber,
                            RoomType = spec.RoomType,
                            MaxCapacity = spec.RoomType == RoomType.Apartment ? 4 : 2,
                            SurfaceArea = spec.BaseArea + areaOffset,
                            BasePrice = spec.BasePrice + priceOffset,
                            Description = BuildDemoDescription(spec, floorNumber, roomNumber),
                            AIFormattedDescription = BuildDemoDescription(spec, floorNumber, roomNumber),
                            IsFurnished = true,
                            Status = RoomStatus.Available,
                            LandlordId = owner.Id,
                            Title = $"{GetRoomTypeLabel(spec.RoomType)} {roomNumber} tại {spec.Name}",
                            IsPublished = true,
                            HasListing = true,
                            HiddenByOwner = false,
                            ModerationStatus = ModerationStatus.Approved,
                            ModerationRemarks = "Dữ liệu demo đã được duyệt sẵn.",
                            ModeratedAt = now,
                            ListingScore = 92 + ((buildingIndex + roomIndex) % 9),
                            CreatedAt = now.AddDays(-((buildingIndex * 2 + roomIndex) % 12))
                        };
                        context.Rooms.Add(room);

                        context.RoomPhotos.AddRange(
                            new RoomPhoto
                            {
                                Room = room,
                                Url = spec.ImageUrl,
                                PublicId = $"{demoSeedPrefix}-{buildingIndex + 1}-{floorNumber}-{roomIndex}-main",
                                IsMain = true,
                                DisplayOrder = 0,
                                UploadedAt = now
                            },
                            new RoomPhoto
                            {
                                Room = room,
                                Url = GetSecondaryImageUrl(buildingIndex, roomIndex),
                                PublicId = $"{demoSeedPrefix}-{buildingIndex + 1}-{floorNumber}-{roomIndex}-detail",
                                IsMain = false,
                                DisplayOrder = 1,
                                UploadedAt = now
                            });

                        foreach (var amenity in amenities
                                     .Skip((buildingIndex + roomIndex) % Math.Max(1, amenities.Count))
                                     .Concat(amenities)
                                     .DistinctBy(a => a.Id)
                                     .Take(Math.Min(4, amenities.Count)))
                        {
                            context.RoomAmenities.Add(new RoomAmenity
                            {
                                Room = room,
                                Amenity = amenity
                            });
                        }
                    }
                }
            }

            await context.SaveChangesAsync();
        }

        private static string BuildDemoDescription(
            DemoBuildingSpec spec,
            int floorNumber,
            string roomNumber)
        {
            return $"{GetRoomTypeLabel(spec.RoomType)} {roomNumber} ở tầng {floorNumber}, "
                + $"đầy đủ nội thất, thoáng sáng và sẵn sàng nhận phòng. "
                + $"Vị trí tại {spec.StreetAddress}, phường {spec.Ward}, quận {spec.District}, Đà Nẵng; "
                + "thuận tiện di chuyển, có chỗ để xe, WiFi và khu vực sinh hoạt an toàn.";
        }

        private static string GetRoomTypeLabel(RoomType roomType) => roomType switch
        {
            RoomType.Studio => "Studio",
            RoomType.MiniApartment => "Căn hộ mini",
            RoomType.Apartment => "Căn hộ",
            _ => "Phòng trọ"
        };

        private static string GetSecondaryImageUrl(int buildingIndex, int roomIndex)
        {
            var imageUrls = new[]
            {
                "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80"
            };
            return imageUrls[(buildingIndex + roomIndex) % imageUrls.Length];
        }

        private sealed record DemoBuildingSpec(
            string Name,
            string District,
            string Ward,
            string StreetAddress,
            decimal Latitude,
            decimal Longitude,
            RoomType RoomType,
            decimal BasePrice,
            decimal BaseArea,
            string ImageUrl);
    }
}
