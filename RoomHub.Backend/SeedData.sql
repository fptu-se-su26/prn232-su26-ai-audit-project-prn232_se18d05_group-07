-- SQL SEED DATA FOR ROOMHUB MVPs
-- ONLY USING THE 4 CORE ROOM TYPES: BoardingHouse, Studio, MiniApartment, Apartment
-- Scope: Da Nang City, with realistic district details

USE [RoomHubDb];
GO

BEGIN TRANSACTION;
BEGIN TRY

    -- 1. Ensure seed Landlord user exists in AspNetUsers
    DECLARE @LandlordId NVARCHAR(450) = N'seed-landlord-01';
    IF NOT EXISTS (SELECT 1 FROM [AspNetUsers] WHERE [Id] = @LandlordId)
    BEGIN
        INSERT INTO [AspNetUsers] (
            [Id], [FullName], [Gender], [Address], [AvatarUrl], [IsVerified], [VerificationDate], 
            [CurrentPlan], [CreatedAt], [IsDeleted], [IsBanned], [Email], [NormalizedEmail], 
            [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], 
            [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnabled], [AccessFailedCount]
        ) VALUES (
            @LandlordId, N'Phan Hoài An', N'Nam', N'137 Nguyễn Hữu Thọ, Hải Châu, Đà Nẵng', 
            N'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', 
            1, GETUTCDATE(), 1, GETUTCDATE(), 0, 0, N'landlord@roomhub.vn', N'LANDLORD@ROOMHUB.VN', 
            1, N'AQAAAAIAAYagAAAAEElvU5Q9l4H/Vn3Z9u8zKxYm593v9h5b7s9s==', -- Mock password hash
            N'SECURITY_STAMP_DEV', N'CONCURRENCY_STAMP_DEV', N'0905123456', 
            1, 0, 1, 0
        );
    END;

    -- 2. Link landlord to PropertyOwner role
    -- Check if role owner-role-id exists
    IF EXISTS (SELECT 1 FROM [AspNetRoles] WHERE [Id] = N'owner-role-id')
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM [AspNetUserRoles] WHERE [UserId] = @LandlordId AND [RoleId] = N'owner-role-id')
        BEGIN
            INSERT INTO [AspNetUserRoles] ([UserId], [RoleId]) VALUES (@LandlordId, N'owner-role-id');
        END;
    END;

    -- 3. Clean up old seed records for seed landlord to avoid conflicts
    DELETE FROM [RoomAmenities] WHERE [RoomId] IN (SELECT [Id] FROM [Rooms] WHERE [LandlordId] = @LandlordId);
    DELETE FROM [RoomPhotos] WHERE [RoomId] IN (SELECT [Id] FROM [Rooms] WHERE [LandlordId] = @LandlordId);
    DELETE FROM [Rooms] WHERE [LandlordId] = @LandlordId;
    DELETE FROM [Floors] WHERE [BuildingId] IN (SELECT [Id] FROM [Buildings] WHERE [OwnerId] = @LandlordId);
    DELETE FROM [Buildings] WHERE [OwnerId] = @LandlordId;

    -- 4. Seed Amenities (Ensure they exist)
    -- We map Ids 1 to 10
    SET IDENTITY_INSERT [Amenities] ON;
    
    IF NOT EXISTS (SELECT 1 FROM [Amenities] WHERE [Id] = 1) INSERT INTO [Amenities] ([Id], [Name], [IconUrl]) VALUES (1, N'Wifi tốc độ cao', N'wifi');
    IF NOT EXISTS (SELECT 1 FROM [Amenities] WHERE [Id] = 2) INSERT INTO [Amenities] ([Id], [Name], [IconUrl]) VALUES (2, N'Điều hòa nhiệt độ', N'ac_unit');
    IF NOT EXISTS (SELECT 1 FROM [Amenities] WHERE [Id] = 3) INSERT INTO [Amenities] ([Id], [Name], [IconUrl]) VALUES (3, N'Tủ lạnh riêng', N'kitchen');
    IF NOT EXISTS (SELECT 1 FROM [Amenities] WHERE [Id] = 4) INSERT INTO [Amenities] ([Id], [Name], [IconUrl]) VALUES (4, N'Máy giặt dùng chung', N'local_laundry_service');
    IF NOT EXISTS (SELECT 1 FROM [Amenities] WHERE [Id] = 5) INSERT INTO [Amenities] ([Id], [Name], [IconUrl]) VALUES (5, N'Gác lửng', N'vertical_align_top');
    IF NOT EXISTS (SELECT 1 FROM [Amenities] WHERE [Id] = 6) INSERT INTO [Amenities] ([Id], [Name], [IconUrl]) VALUES (6, N'WC riêng biệt', N'wc');
    IF NOT EXISTS (SELECT 1 FROM [Amenities] WHERE [Id] = 7) INSERT INTO [Amenities] ([Id], [Name], [IconUrl]) VALUES (7, N'Ban công thoáng mát', N'balcony');
    IF NOT EXISTS (SELECT 1 FROM [Amenities] WHERE [Id] = 8) INSERT INTO [Amenities] ([Id], [Name], [IconUrl]) VALUES (8, N'Kệ bếp nấu ăn', N'countertops');
    IF NOT EXISTS (SELECT 1 FROM [Amenities] WHERE [Id] = 9) INSERT INTO [Amenities] ([Id], [Name], [IconUrl]) VALUES (9, N'Bình nóng lạnh', N'water_heater');
    IF NOT EXISTS (SELECT 1 FROM [Amenities] WHERE [Id] = 10) INSERT INTO [Amenities] ([Id], [Name], [IconUrl]) VALUES (10, N'Giờ giấc tự do', N'schedule');

    SET IDENTITY_INSERT [Amenities] OFF;

    -- 5. Seed Buildings
    DECLARE @BuildingId1 INT, @BuildingId2 INT, @BuildingId3 INT, @BuildingId4 INT, @BuildingId5 INT;

    INSERT INTO [Buildings] ([OwnerId], [Name], [Province], [City], [District], [Ward], [Address], [CreatedAt], [IsDeleted], [ElectricityPrice], [WaterPrice], [InternetPrice], [GarbagePrice], [ThumbnailUrl])
    VALUES (@LandlordId, N'Tòa nhà RoomHub Hải Châu House', N'Đà Nẵng', N'Đà Nẵng', N'Quận Hải Châu', N'Thạch Thang', N'12 Lương Nhữ Hộc', GETUTCDATE(), 0, 3500.00, 10000.00, 100000.00, 30000.00, N'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80');
    SET @BuildingId1 = SCOPE_IDENTITY();

    INSERT INTO [Buildings] ([OwnerId], [Name], [Province], [City], [District], [Ward], [Address], [CreatedAt], [IsDeleted], [ElectricityPrice], [WaterPrice], [InternetPrice], [GarbagePrice], [ThumbnailUrl])
    VALUES (@LandlordId, N'Tòa nhà RoomHub FPT Home', N'Đà Nẵng', N'Đà Nẵng', N'Quận Ngũ Hành Sơn', N'Hòa Hải', N'Khu đô thị FPT City', GETUTCDATE(), 0, 3800.00, 12000.00, 80000.00, 25000.00, N'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80');
    SET @BuildingId2 = SCOPE_IDENTITY();

    INSERT INTO [Buildings] ([OwnerId], [Name], [Province], [City], [District], [Ward], [Address], [CreatedAt], [IsDeleted], [ElectricityPrice], [WaterPrice], [InternetPrice], [GarbagePrice], [ThumbnailUrl])
    VALUES (@LandlordId, N'Tòa nhà Ocean View Apartment', N'Đà Nẵng', N'Đà Nẵng', N'Quận Sơn Trà', N'Phước Mỹ', N'55 Võ Nguyên Giáp', GETUTCDATE(), 0, 4000.00, 15000.00, 120000.00, 40000.00, N'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80');
    SET @BuildingId3 = SCOPE_IDENTITY();

    INSERT INTO [Buildings] ([OwnerId], [Name], [Province], [City], [District], [Ward], [Address], [CreatedAt], [IsDeleted], [ElectricityPrice], [WaterPrice], [InternetPrice], [GarbagePrice], [ThumbnailUrl])
    VALUES (@LandlordId, N'Tòa nhà RoomHub Bách Khoa', N'Đà Nẵng', N'Đà Nẵng', N'Quận Liên Chiểu', N'Hòa Khánh Nam', N'88 Ngô Sĩ Liên', GETUTCDATE(), 0, 3000.00, 8000.00, 70000.00, 20000.00, N'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80');
    SET @BuildingId4 = SCOPE_IDENTITY();

    INSERT INTO [Buildings] ([OwnerId], [Name], [Province], [City], [District], [Ward], [Address], [CreatedAt], [IsDeleted], [ElectricityPrice], [WaterPrice], [InternetPrice], [GarbagePrice], [ThumbnailUrl])
    VALUES (@LandlordId, N'Tòa nhà RoomHub Thanh Khê House', N'Đà Nẵng', N'Đà Nẵng', N'Quận Thanh Khê', N'Chính Gián', N'20 Điện Biên Phủ', GETUTCDATE(), 0, 3500.00, 10000.00, 90000.00, 30000.00, N'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80');
    SET @BuildingId5 = SCOPE_IDENTITY();

    -- 6. Seed Floors
    DECLARE @FloorId1_1 INT, @FloorId1_2 INT, @FloorId2_1 INT, @FloorId2_2 INT, @FloorId3_1 INT, @FloorId3_2 INT, @FloorId4_1 INT, @FloorId5_1 INT;

    INSERT INTO [Floors] ([BuildingId], [FloorNumber], [Description], [CreatedAt], [IsDeleted]) VALUES (@BuildingId1, 1, N'Tầng 1 - Hải Châu', GETUTCDATE(), 0);
    SET @FloorId1_1 = SCOPE_IDENTITY();
    INSERT INTO [Floors] ([BuildingId], [FloorNumber], [Description], [CreatedAt], [IsDeleted]) VALUES (@BuildingId1, 2, N'Tầng 2 - Hải Châu', GETUTCDATE(), 0);
    SET @FloorId1_2 = SCOPE_IDENTITY();

    INSERT INTO [Floors] ([BuildingId], [FloorNumber], [Description], [CreatedAt], [IsDeleted]) VALUES (@BuildingId2, 1, N'Tầng 1 - FPT', GETUTCDATE(), 0);
    SET @FloorId2_1 = SCOPE_IDENTITY();
    INSERT INTO [Floors] ([BuildingId], [FloorNumber], [Description], [CreatedAt], [IsDeleted]) VALUES (@BuildingId2, 2, N'Tầng 2 - FPT', GETUTCDATE(), 0);
    SET @FloorId2_2 = SCOPE_IDENTITY();

    INSERT INTO [Floors] ([BuildingId], [FloorNumber], [Description], [CreatedAt], [IsDeleted]) VALUES (@BuildingId3, 1, N'Tầng 1 - Ocean View', GETUTCDATE(), 0);
    SET @FloorId3_1 = SCOPE_IDENTITY();
    INSERT INTO [Floors] ([BuildingId], [FloorNumber], [Description], [CreatedAt], [IsDeleted]) VALUES (@BuildingId3, 2, N'Tầng 2 - Ocean View', GETUTCDATE(), 0);
    SET @FloorId3_2 = SCOPE_IDENTITY();

    INSERT INTO [Floors] ([BuildingId], [FloorNumber], [Description], [CreatedAt], [IsDeleted]) VALUES (@BuildingId4, 1, N'Tầng 1 - Bách Khoa', GETUTCDATE(), 0);
    SET @FloorId4_1 = SCOPE_IDENTITY();

    INSERT INTO [Floors] ([BuildingId], [FloorNumber], [Description], [CreatedAt], [IsDeleted]) VALUES (@BuildingId5, 1, N'Tầng 1 - Thanh Khê', GETUTCDATE(), 0);
    SET @FloorId5_1 = SCOPE_IDENTITY();

    -- 7. Seed Rooms (Ensure only the 4 target RoomTypes are used: BoardingHouse, Studio, MiniApartment, Apartment)
    DECLARE @RoomId1 INT, @RoomId2 INT, @RoomId3 INT, @RoomId4 INT, @RoomId5 INT, @RoomId6 INT, @RoomId7 INT, @RoomId8 INT, @RoomId9 INT, @RoomId10 INT;

    -- Room 1: Studio in Hai Chau
    INSERT INTO [Rooms] (
        [FloorId], [RoomNumber], [RoomType], [MaxCapacity], [SurfaceArea], [BasePrice], [Description], 
        [IsFurnished], [Status], [LandlordId], [Title], [CreatedAt], [IsDeleted], [IsPublished],
        [ElectricityPrice], [WaterPrice], [InternetPrice], [GarbagePrice]
    ) VALUES (
        @FloorId1_1, N'101', N'Studio', 2, 35.00, 5500000.00, N'Studio ban công cực rộng view biển Mỹ Khê thoáng gió, trang bị đầy đủ tủ lạnh, điều hòa, bếp nấu ăn, đệm lò xo cao cấp.', 
        1, N'Available', @LandlordId, N'Studio ban công view biển Mỹ Khê - Đầy đủ nội thất', GETUTCDATE(), 0, 1,
        3500.00, 10000.00, 100000.00, 30000.00
    );
    SET @RoomId1 = SCOPE_IDENTITY();

    -- Room 2: Apartment in Hai Chau
    INSERT INTO [Rooms] (
        @FloorId1_2, N'201', N'Apartment', 3, 45.00, 6200000.00, N'Căn hộ dịch vụ 1 phòng ngủ (1PN) trung tâm Quận Hải Châu, giờ giấc tự do, bảo vệ an ninh 24/7, thang máy tốc độ cao.', 
        1, N'Available', @LandlordId, N'Căn hộ 1PN trung tâm Hải Châu, an ninh 24/7', GETUTCDATE(), 0, 1,
        3500.00, 10000.00, 100000.00, 30000.00
    );
    SET @RoomId2 = SCOPE_IDENTITY();

    -- Room 3: BoardingHouse in Lien Chieu (near Bach Khoa)
    INSERT INTO [Rooms] (
        @FloorId4_1, N'102', N'BoardingHouse', 2, 20.00, 2000000.00, N'Phòng trọ sạch sẽ có gác lửng kiên cố gần ĐH Bách Khoa Đà Nẵng, giá rẻ tiết kiệm điện nước riêng biệt theo công tơ.', 
        0, N'Available', @LandlordId, N'Phòng trọ sạch sẽ gần ĐH Bách Khoa, có gác lửng', GETUTCDATE(), 0, 1,
        3000.00, 8000.00, 70000.00, 20000.00
    );
    SET @RoomId3 = SCOPE_IDENTITY();

    -- Room 4: Studio in Ngu Hanh Son (near FPT)
    INSERT INTO [Rooms] (
        @FloorId2_1, N'103', N'Studio', 2, 30.00, 4500000.00, N'Studio cao cấp full nội thất gỗ đầm ấm gần ĐH FPT City Đà Nẵng, có ban công phơi đồ cực tiện lợi, giờ giấc tự do không chung chủ.', 
        1, N'Available', @LandlordId, N'Studio full nội thất cao cấp gần ĐH FPT', GETUTCDATE(), 0, 1,
        3800.00, 12000.00, 80000.00, 25000.00
    );
    SET @RoomId4 = SCOPE_IDENTITY();

    -- Room 5: BoardingHouse in Lien Chieu (Student single room concept)
    INSERT INTO [Rooms] (
        @FloorId4_1, N'103', N'BoardingHouse', 2, 18.00, 1500000.00, N'Phòng trọ khép kín khang trang sạch sẽ, thích hợp cho sinh viên ở 1-2 người, khu vực an ninh Hòa Khánh cực tốt.', 
        1, N'Available', @LandlordId, N'Phòng trọ sinh viên Hòa Khánh khép kín, gần chợ', GETUTCDATE(), 0, 1,
        3000.00, 8000.00, 70000.00, 20000.00
    );
    SET @RoomId5 = SCOPE_IDENTITY();

    -- Room 6: Apartment in Son Tra (luxury view)
    INSERT INTO [Rooms] (
        @FloorId3_1, N'104', N'Apartment', 3, 55.00, 8500000.00, N'Căn hộ dịch vụ cao cấp view trọn vẹn sông Hàn và cầu Rồng, ban công rộng mở ngắm pháo hoa tuyệt đẹp, bảo vệ túc trực 24/24.', 
        1, N'Available', @LandlordId, N'Căn hộ cao cấp view sông Hàn cực kỳ sang trọng', GETUTCDATE(), 0, 1,
        4000.00, 15000.00, 120000.00, 40000.00
    );
    SET @RoomId6 = SCOPE_IDENTITY();

    -- Room 7: BoardingHouse in Son Tra (close to sea)
    INSERT INTO [Rooms] (
        @FloorId3_2, N'202', N'BoardingHouse', 2, 28.00, 3200000.00, N'Phòng trọ rộng rãi đầy đủ tiện nghi điều hòa, bình nóng lạnh gần bãi biển Phạm Văn Đồng, cực tiện lợi đi dạo biển.', 
        1, N'Available', @LandlordId, N'Phòng trọ rộng rãi phù hợp 2 người, gần biển Phạm Văn Đồng', GETUTCDATE(), 0, 1,
        4000.00, 15000.00, 120000.00, 40000.00
    );
    SET @RoomId7 = SCOPE_IDENTITY();

    -- Room 8: BoardingHouse in Cam Le (dorm concept)
    INSERT INTO [Rooms] (
        @FloorId2_2, N'203', N'BoardingHouse', 4, 32.00, 1200000.00, N'Phòng ký túc xá dịch vụ cao cấp sạch sẽ thoáng mát tại Cẩm Lệ, có người dọn vệ sinh hàng tuần miễn phí.', 
        1, N'Available', @LandlordId, N'Phòng trọ ký túc xá dịch vụ cao cấp tại Cẩm Lệ', GETUTCDATE(), 0, 1,
        3800.00, 12000.00, 80000.00, 25000.00
    );
    SET @RoomId8 = SCOPE_IDENTITY();

    -- Room 9: Apartment in Son Tra (beach luxury)
    INSERT INTO [Rooms] (
        @FloorId3_2, N'204', N'Apartment', 4, 65.00, 9000000.00, N'Căn hộ chung cư cao cấp 2 phòng ngủ (2PN) view ôm trọn vịnh biển Đà Nẵng, gió thổi lồng lộng mát mẻ cả ngày.', 
        1, N'Available', @LandlordId, N'Căn hộ chung cư cao cấp 2PN view vịnh biển cực mát', GETUTCDATE(), 0, 1,
        4000.00, 15000.00, 120000.00, 40000.00
    );
    SET @RoomId9 = SCOPE_IDENTITY();

    -- Room 10: MiniApartment in Thanh Khe (loft concept)
    INSERT INTO [Rooms] (
        @FloorId5_1, N'105', N'MiniApartment', 2, 28.00, 3800000.00, N'Căn hộ mini thiết kế thông minh hiện đại có gác lửng cực đẹp tại trung tâm Thanh Khê, kiệt rộng xe hơi ra vào tự do.', 
        1, N'Available', @LandlordId, N'Căn hộ mini thông minh có gác lửng cực đẹp tại Thanh Khê', GETUTCDATE(), 0, 1,
        3500.00, 10000.00, 90000.00, 30000.00
    );
    SET @RoomId10 = SCOPE_IDENTITY();

    -- 8. Seed Room Photos
    INSERT INTO [RoomPhotos] ([RoomId], [Url], [PublicId], [IsMain], [DisplayOrder], [UploadedAt]) VALUES 
    (@RoomId1, N'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', N'p1', 1, 0, GETUTCDATE()),
    (@RoomId2, N'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', N'p2', 1, 0, GETUTCDATE()),
    (@RoomId3, N'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80', N'p3', 1, 0, GETUTCDATE()),
    (@RoomId4, N'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80', N'p4', 1, 0, GETUTCDATE()),
    (@RoomId5, N'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80', N'p5', 1, 0, GETUTCDATE()),
    (@RoomId6, N'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', N'p6', 1, 0, GETUTCDATE()),
    (@RoomId7, N'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80', N'p7', 1, 0, GETUTCDATE()),
    (@RoomId8, N'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80', N'p8', 1, 0, GETUTCDATE()),
    (@RoomId9, N'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80', N'p9', 1, 0, GETUTCDATE()),
    (@RoomId10, N'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', N'p10', 1, 0, GETUTCDATE());

    -- 9. Seed Room Amenities relations
    -- Room 1 (Studio) has Wifi, AC, Fridge, Balcony, WC
    INSERT INTO [RoomAmenities] ([RoomId], [AmenityId]) VALUES (@RoomId1, 1), (@RoomId1, 2), (@RoomId1, 3), (@RoomId1, 6), (@RoomId1, 7);
    -- Room 2 (Apartment) has Wifi, AC, Fridge, WC, HotWater, CurfewFree
    INSERT INTO [RoomAmenities] ([RoomId], [AmenityId]) VALUES (@RoomId2, 1), (@RoomId2, 2), (@RoomId2, 3), (@RoomId2, 6), (@RoomId2, 9), (@RoomId2, 10);
    -- Room 3 (BoardingHouse) has Wifi, Loft, Parking(Amenities 1, 5)
    INSERT INTO [RoomAmenities] ([RoomId], [AmenityId]) VALUES (@RoomId3, 1), (@RoomId3, 5);
    -- Room 4 (Studio) has Wifi, AC, Fridge, Kitchenette, WC
    INSERT INTO [RoomAmenities] ([RoomId], [AmenityId]) VALUES (@RoomId4, 1), (@RoomId4, 2), (@RoomId4, 3), (@RoomId4, 6), (@RoomId4, 8);
    -- Room 5 (BoardingHouse) has WC, Wifi
    INSERT INTO [RoomAmenities] ([RoomId], [AmenityId]) VALUES (@RoomId5, 1), (@RoomId5, 6);
    -- Room 6 (Apartment) has all high-end
    INSERT INTO [RoomAmenities] ([RoomId], [AmenityId]) VALUES (@RoomId6, 1), (@RoomId6, 2), (@RoomId6, 3), (@RoomId6, 4), (@RoomId6, 6), (@RoomId6, 7), (@RoomId6, 8), (@RoomId6, 9), (@RoomId6, 10);
    -- Room 7 (BoardingHouse) has Wifi, AC, HotWater
    INSERT INTO [RoomAmenities] ([RoomId], [AmenityId]) VALUES (@RoomId7, 1), (@RoomId7, 2), (@RoomId7, 9);
    -- Room 8 (BoardingHouse) has Wifi, AC, Washing Machine
    INSERT INTO [RoomAmenities] ([RoomId], [AmenityId]) VALUES (@RoomId8, 1), (@RoomId8, 2), (@RoomId8, 4);
    -- Room 9 (Apartment) has Wifi, AC, Fridge, WC, Balcony, HotWater, Kitchenette
    INSERT INTO [RoomAmenities] ([RoomId], [AmenityId]) VALUES (@RoomId9, 1), (@RoomId9, 2), (@RoomId9, 3), (@RoomId9, 6), (@RoomId9, 7), (@RoomId9, 8), (@RoomId9, 9);
    -- Room 10 (MiniApartment) has Wifi, AC, Loft, WC, Kitchenette, CurfewFree
    INSERT INTO [RoomAmenities] ([RoomId], [AmenityId]) VALUES (@RoomId10, 1), (@RoomId10, 2), (@RoomId10, 5), (@RoomId10, 6), (@RoomId10, 8), (@RoomId10, 10);

    COMMIT TRANSACTION;
    PRINT N'=== RoomHub DB Seeding Completed Successfully! ===';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT N'!!! Error occurred during seeding database !!!';
    PRINT ERROR_MESSAGE();
END CATCH;
GO
