# Changelog

## 1. Quy định ghi Changelog

File này dùng để ghi lại các thay đổi quan trọng trong quá trình thực hiện chức năng **Đánh giá phòng/chủ trọ** của sinh viên Nguyễn Hồng An.

Nguyên tắc ghi changelog:
- Chỉ ghi những gì đã hoàn thành thật sự.
- Không ghi kế hoạch nếu chưa thực hiện.
- Mỗi thay đổi có ngày, nội dung, người thực hiện và minh chứng.
- Nếu có AI hỗ trợ, cần ghi rõ AI đã hỗ trợ phần nào.

---

## 2. Thông tin project

| Thông tin | Nội dung |
|---|---|
| Môn học | Lập trình C# |
| Mã môn học | PRN232 |
| Lớp | SE18D05 |
| Học kỳ | SU26 |
| Tên bài tập / Project | RoomHub - Quản lý phòng/nhà trọ (Tách biệt FE-BE) |
| Tên sinh viên / Nhóm | Nguyễn Hồng An / Nhóm 07 |
| MSSV / Danh sách MSSV | DE180358 |
| Giảng viên hướng dẫn | Thầy Lê Thiện Nhật Quang |
| Repository URL | https://github.com/fptu-se-su26/prn232-su26-ai-audit-project-prn232_se18d05_group-07 |
| Ngày bắt đầu | 12/07/2026 |
| Ngày hoàn thành | 12/07/2026 |

---

## 3. Tổng quan các phiên bản/giai đoạn

| Phiên bản/Giai đoạn | Thời gian | Nội dung chính | Trạng thái |
|---|---|---|---|
| Phase 02 | 12/07/2026 | Rà soát & phân tích chức năng còn thiếu | Completed |
| Phase 04 | 12/07/2026 | Implementation: Chức năng Đánh giá (FE + BE) | Completed |
| Phase 05 | 12/07/2026 | Build backend + typecheck frontend | Completed |

---

# [Phase 04] Chức năng Đánh giá phòng/chủ trọ cho người thuê

## Ngày thực hiện

```text
12/07/2026
```

## Đã hoàn thành

- [x] Tạo nhánh riêng `feature/de180358-tenant-reviews` từ `main` (không code trực tiếp vào main)
- [x] DTO: `CreateReviewRequest`, `ReviewDto`, `RoomReviewSummaryDto`
- [x] Repository: `IReviewRepository` + `ReviewRepository` (truy vấn theo phòng, theo người thuê, kiểm tra trùng)
- [x] Service: `IReviewService` + `ReviewService` (validate sao 1–5, chặn đánh giá trùng phòng, lấy OwnerId từ phòng, tính điểm trung bình)
- [x] Controller: `ReviewsController` với 4 endpoint
- [x] Đăng ký `IReviewRepository` và `IReviewService` trong `DependencyInjection.cs`
- [x] Frontend: trang `MyReviews.tsx` (chọn sao, bình luận, danh sách, sửa, xóa, badge cảm xúc theo sao)
- [x] Bổ sung chức năng Sửa đánh giá: endpoint `PUT /api/tenant/reviews/{id}` + form sửa inline ở FE
- [x] Gắn route `tenant-reviews` trong `App.tsx` và mục menu "Đánh giá của tôi" trong `TenantLayout.tsx`
- [x] Xác nhận KHÔNG cần migration (bảng `Reviews` đã có sẵn từ InitialMigration)
- [x] Build backend 0 lỗi, typecheck frontend exit 0

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Tạo các DTO cho đánh giá | Nguyễn Hồng An | `Application/Common/DTOs/Reviews/ReviewDtos.cs` | Commit Git |
| 2 | Interface + repository truy cập DB | Nguyễn Hồng An | `IReviewRepository.cs`, `ReviewRepository.cs` | Commit Git |
| 3 | Interface + service nghiệp vụ | Nguyễn Hồng An | `IReviewService.cs`, `ReviewService.cs` | Commit Git |
| 4 | Controller 4 endpoint (tạo/của tôi/xóa/công khai theo phòng) | Nguyễn Hồng An | `API/Controllers/ReviewsController.cs` | Commit Git |
| 5 | Đăng ký DI repository & service | Nguyễn Hồng An | `Infrastructure/DependencyInjection.cs` | Commit Git |
| 6 | Trang người thuê chấm sao + xem/xóa đánh giá | Nguyễn Hồng An | `Frontend/src/pages/tenant/MyReviews.tsx` | Commit Git |
| 7 | Điều hướng + menu sidebar | Nguyễn Hồng An | `App.tsx`, `components/tenant/TenantLayout.tsx` | Commit Git |

## API endpoints

| Method | Route | Quyền | Mô tả |
|---|---|---|---|
| POST | `/api/tenant/reviews` | Tenant | Tạo đánh giá cho phòng (rating + comment) |
| GET | `/api/tenant/reviews/my` | Tenant | Danh sách đánh giá của chính mình |
| PUT | `/api/tenant/reviews/{id}` | Tenant | Sửa đánh giá của mình (rating + comment) |
| DELETE | `/api/tenant/reviews/{id}` | Tenant | Xóa đánh giá của mình |
| GET | `/api/reviews/room/{roomId}` | Công khai | Điểm trung bình + danh sách đánh giá của 1 phòng |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
Claude Code hỗ trợ đọc convention dự án và sinh mã backend (DTO/Repository/Service/Controller/DI) cùng trang
frontend MyReviews. Sinh viên định hướng phạm vi, quyết định thiết kế (route, không migration, badge cảm xúc là
quy tắc chứ không phải AI) và kiểm tra biên dịch.
```

## Commit/Screenshot minh chứng

```text
Nhánh: feature/de180358-tenant-reviews
Commit: [DE180358] feat: add tenant room/owner review feature (a9ee9ec)
```

## Ghi chú

```text
Badge cảm xúc (Tích cực/Trung tính/Tiêu cực) hiện suy ra từ số sao, KHÔNG dùng AI. Có thể nâng cấp gọi Gemini/Groq
phân tích bình luận ở bước sau.
```

---

## 4. Tổng kết thay đổi cuối chức năng

### 4.1. Các chức năng đã hoàn thành

| STT | Chức năng | Trạng thái | Minh chứng | Ghi chú |
|---|---|---|---|---|
| 1 | Người thuê gửi đánh giá phòng (rating + comment) | Completed | POST /api/tenant/reviews | Chặn đánh giá trùng |
| 2 | Xem danh sách đánh giá của mình, sửa & xóa | Completed | GET/PUT/DELETE /api/tenant/reviews | Trang MyReviews |
| 3 | Xem điểm trung bình + đánh giá theo phòng | Completed | GET /api/reviews/room/{id} | Công khai |

---

## 5. Cam kết cập nhật Changelog

Sinh viên cam kết rằng nội dung changelog phản ánh đúng các thay đổi thực tế đã thực hiện.

| Sinh viên xác nhận | Ngày xác nhận |
|---|---|
| Nguyễn Hồng An | 12/07/2026 |
