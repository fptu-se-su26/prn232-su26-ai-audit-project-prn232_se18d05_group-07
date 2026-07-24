# AI Audit Log

## 1. Thông tin chung

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
| Ngày bắt đầu | 12/07/2026 |
| Ngày hoàn thành | 12/07/2026 |

---

## 2. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng trong quá trình thực hiện bài tập/project.

- [ ] ChatGPT
- [ ] Gemini
- [x] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [ ] Antigravity
- [ ] Perplexity
- [ ] Microsoft Copilot

> Cụ thể: Claude Code (mô hình Opus 4.8) chạy trong terminal của VS Code.

---

## 3. Mục tiêu sử dụng AI

Mô tả ngắn gọn sinh viên đã sử dụng AI để hỗ trợ những công việc nào:
- Rà soát toàn bộ nhánh `main` và các nhánh của repo để xác định những chức năng còn chưa được code, phân loại theo vai trò (chủ trọ / người thuê / admin).
- Thiết kế và lập trình đầy đủ (full-stack) chức năng **Đánh giá phòng/chủ trọ** cho người thuê: từ tầng Domain lên API và giao diện React.
- Kiểm tra biên dịch backend và typecheck frontend để bảo đảm code chạy được.

### Mô tả mục tiêu sử dụng AI

```text
Dùng Claude Code để đọc hiểu cấu trúc Clean Architecture sẵn có của dự án (API → Application → Domain →
Infrastructure), tìm các entity đã khai báo nhưng chưa có API/giao diện, rồi hiện thực hóa chức năng Đánh giá
theo đúng convention của nhóm (DTO → Repository → Service → Controller → Dependency Injection ở backend; trang
tenant + điều hướng ở frontend). Em định hướng phạm vi, quyết định thiết kế và kiểm tra kết quả; AI hỗ trợ sinh
mã và giải thích.
```

---

## 4. Nhật ký sử dụng AI chi tiết

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 12/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích sử dụng | Rà soát chức năng chưa code, phân loại theo vai trò |
| Phần việc liên quan | Requirement Analysis / Code Audit |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng

```text
kiểm tra tất cả các nhánh cũng như trong main xem còn chức năng nào chưa code và nó thuộc về chủ trọ hay người
thuê trọ hay là admin nói rõ cho tôi biết nào  ... task nào mà chưa ai đụng vào kiểm tra xem chức năng nào chưa
ai đụng vào cái gì hết á
```

#### 4.2. Kết quả AI gợi ý

AI quét các entity trong `Domain/Entities`, đối chiếu với Controller/Service/DTO và các trang Frontend, xác định nhóm chức năng "chưa ai đụng vào": Đánh giá (Review), Lịch sử tìm kiếm (SearchHistory), Lịch sử đặt/xem phòng (BookingHistory), Yêu cầu dịch vụ, Cấu hình hệ thống... và phân loại theo vai trò.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Dựa vào kết quả rà soát để chọn 3 chức năng cho người thuê sẽ tự nhận: Đánh giá, Lịch sử tìm kiếm, Lịch sử đặt/xem phòng. Bắt đầu với chức năng Đánh giá.

#### 4.5. Minh chứng

- Bảng phân loại chức năng chưa code theo vai trò (trong hội thoại làm việc).

---

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 12/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích sử dụng | Lập trình backend chức năng Đánh giá |
| Phần việc liên quan | Backend / API Controllers, Service, Repository |
| Mức độ sử dụng | Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
tôi sẽ làm chức năng đánh giá phòng/chủ trọ và chức năng lịch sử tìm kiếm và lịch sử đặt/xem phòng cho người thuê
(làm từng chức năng một, bắt đầu với Đánh giá)
```

#### 4.2. Kết quả AI gợi ý

AI đọc các file mẫu (NotificationService, NotificationRepository, TenantRoomController, DependencyInjection, ApplicationDbContext) để nắm convention, sau đó sinh mã:
- `ReviewDtos.cs` (CreateReviewRequest, ReviewDto, RoomReviewSummaryDto)
- `IReviewRepository.cs` & `ReviewRepository.cs`
- `IReviewService.cs` & `ReviewService.cs`
- `ReviewsController.cs` với 4 endpoint
- Đăng ký repository & service trong `DependencyInjection.cs`

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Áp dụng toàn bộ mã vào solution `RoomHub.Backend`, kiểm tra logic: rating 1–5, chặn đánh giá trùng phòng, lấy `OwnerId` từ `Room.LandlordId`.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Xác nhận không cần migration mới vì bảng `Reviews` đã tồn tại (DbSet có sẵn từ InitialMigration). Chốt route theo chuẩn dự án: `api/tenant/reviews` cho người thuê và `api/reviews/room/{id}` công khai.

#### 4.5. Minh chứng

- `RoomHub.Backend/RoomHub.API/Controllers/ReviewsController.cs`
- `RoomHub.Backend/RoomHub.Application/Services/ReviewService.cs`

---

### Lần sử dụng AI số 3

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 12/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích sử dụng | Lập trình giao diện React cho người thuê |
| Phần việc liên quan | Frontend / React, điều hướng |
| Mức độ sử dụng | Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
(tiếp tục theo kế hoạch) làm trang cho người thuê chấm sao + bình luận phòng đang thuê, xem và xóa đánh giá của mình
```

#### 4.2. Kết quả AI gợi ý

AI tạo trang `MyReviews.tsx` (chọn sao, nhập bình luận, danh sách đánh giá, xóa, badge cảm xúc), gắn route `tenant-reviews` trong `App.tsx` và thêm mục menu "Đánh giá của tôi" trong `TenantLayout.tsx`, theo đúng phong cách Tailwind + Material Symbols có sẵn.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Tích hợp trang mới vào luồng điều hướng của khu vực người thuê, gọi đúng các endpoint đã tạo ở backend.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Thống nhất rằng nhãn cảm xúc (Tích cực/Trung tính/Tiêu cực) hiện là **quy tắc suy ra từ số sao**, KHÔNG phải AI — ghi rõ để minh bạch. Phần tích hợp AI thật (Gemini/Groq) để dành làm bước nâng cấp sau.

#### 4.5. Minh chứng

- `RoomHub.Frontend/src/pages/tenant/MyReviews.tsx`

---

### Lần sử dụng AI số 4

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 12/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích sử dụng | Bổ sung chức năng Sửa đánh giá cho hoàn thiện |
| Phần việc liên quan | Backend + Frontend |
| Mức độ sử dụng | Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
thêm sửa đánh giá để chức năng này hoàn thiện nhất có thể sau đó push code lên để tôi tự merge vào main nhé
```

#### 4.2. Kết quả AI gợi ý

AI thêm endpoint `PUT /api/tenant/reviews/{id}` (UpdateReviewRequest, UpdateReviewAsync, UpdateAsync ở repository) và form sửa inline trong `MyReviews.tsx` (nút Sửa, chọn lại sao, sửa bình luận, Lưu/Hủy), có kiểm tra quyền sở hữu và validate sao 1–5.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Tích hợp vào cùng nhánh `feature/de180358-tenant-reviews`, kiểm tra build backend + typecheck frontend đều đạt.

#### 4.5. Minh chứng

- `ReviewsController.cs` (endpoint PUT), `ReviewService.UpdateReviewAsync`, `MyReviews.tsx` (form sửa)

---

## 5. Bảng tổng hợp mức độ sử dụng AI

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu |  |  | [x] |  | Rà soát chức năng chưa code |
| Thiết kế kiến trúc hệ thống |  |  | [x] |  | Theo Clean Architecture sẵn có |
| Code frontend |  |  |  | [x] | Trang MyReviews + điều hướng |
| Code backend |  |  |  | [x] | DTO/Repo/Service/Controller |
| Debug lỗi |  | [x] |  |  | Lỗi môi trường (.NET SDK, DB) |
| Kiểm thử sản phẩm |  | [x] |  |  | Build + typecheck |
| Tối ưu code |  | [x] |  |  | Bỏ code dư, giữ commit sạch |
| Viết báo cáo |  |  | [x] |  | Soạn nháp 4 file audit |

---

## 6. Các lỗi hoặc hạn chế từ AI

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | Nhãn cảm xúc ban đầu dễ bị hiểu nhầm là "AI phân tích" trong khi thực chất chỉ suy từ số sao | Đọc kỹ code và đối chiếu mục tiêu môn AI Audit | Ghi chú rõ trong code và tài liệu rằng đây là quy tắc, không phải AI |
| 2 | AI không tự biết bảng `Reviews` đã tồn tại, ban đầu có thể tính tới migration | Kiểm tra `ApplicationDbContext` thấy DbSet có sẵn | Bỏ bước migration cho chức năng này |

---

## 7. Kiểm chứng kết quả AI

- Build backend thành công, 0 lỗi, 0 cảnh báo phát sinh từ code Review.
- Typecheck frontend (`tsc -b --noEmit`) trả về exit code 0.
- Kiểm tra endpoint dự kiến test trên Swagger và đăng nhập tài khoản `tenant1@gmail.com` để thử luồng chấm sao.

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

| Thành viên | MSSV | Nhiệm vụ chính | Có sử dụng AI không? | Minh chứng đóng góp |
|---|---|---|---|---|
| Nguyễn Hồng An | DE180358 | Lập trình chức năng Đánh giá (FE+BE), viết tài liệu audit | Có | Nhánh `feature/de180358-tenant-reviews` đã push |

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em ở điểm nào?
Giúp rà soát nhanh phần chức năng còn thiếu và sinh khung code full-stack đúng convention, tiết kiệm nhiều thời gian dựng lát cắt DTO–Repository–Service–Controller.

### 9.2. Phần nào em không sử dụng theo gợi ý của AI? Vì sao?
Không đưa tích hợp AI sentiment vào bản đầu để giữ chức năng gọn, chạy chắc chắn và khai báo trung thực.

### 9.3. Nếu không có AI, phần nào sẽ khó khăn nhất?
Việc dò đúng convention của dự án lớn (namespace, cách đăng ký DI, cách lấy userId từ claims) và dựng trang React khớp phong cách sẵn có sẽ tốn nhiều thời gian.

---

## 10. Cam kết học thuật

Sinh viên cam kết nội dung sử dụng trợ lý AI được ghi nhận hoàn toàn trung thực và chịu trách nhiệm với sản phẩm cuối cùng.

| Sinh viên xác nhận | Ngày xác nhận |
|---|---|
| Nguyễn Hồng An | 12/07/2026 |
