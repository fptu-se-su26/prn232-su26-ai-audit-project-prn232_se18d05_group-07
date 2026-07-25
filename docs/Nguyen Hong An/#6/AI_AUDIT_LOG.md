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
| Ngày bắt đầu | 25/07/2026 |
| Ngày hoàn thành | 25/07/2026 |

---

## 2. Công cụ AI đã sử dụng

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

- Lập trình đầy đủ (full-stack) **Chức năng Dịch vụ (Service Requests)** — chức năng chính, nhiều tính năng con, trải 3 vai trò:
  - **Admin:** quản lý danh mục dịch vụ (thêm/sửa/xóa).
  - **Người thuê:** xem danh mục, gửi yêu cầu dịch vụ, theo dõi và hủy yêu cầu.
  - **Chủ trọ:** xem yêu cầu từ khách thuê của mình, duyệt/hoàn thành/từ chối.

### Mô tả mục tiêu sử dụng AI

```text
Sau khi rà soát main mới, entity Service và ServiceRequest chưa được code (không controller/service/FE). Dùng Claude
Code để dựng đầy đủ backend (DTO/Repository/Service/Controller/DI cho 3 vai trò) và frontend (3 trang: admin catalog,
tenant request, owner xử lý), liên kết yêu cầu với hợp đồng đang hiệu lực. Sinh viên định hướng phạm vi, thiết kế
mô hình phân quyền và kiểm chứng end-to-end.
```

---

## 4. Nhật ký sử dụng AI chi tiết

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 25/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích sử dụng | Rà soát & chọn chức năng chính còn thiếu |
| Phần việc liên quan | Requirement Analysis |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng

```text
còn chức năng nào nữa không code luôn cho tôi nào, hãy xem kĩ nhé và có tính chọn lọc, chức năng nào chưa code mà
nhiều tính năng chút tức là chức năng chính chút
```

#### 4.2. Kết quả AI gợi ý

Rà soát entity vs controller: Service/ServiceRequest chưa code, là chức năng lớn (3 vai trò) → được chọn thay vì UtilityReading (nhỏ, dễ trùng hóa đơn).

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Chọn làm chức năng Dịch vụ full 3 vai trò.

#### 4.5. Minh chứng

- Bảng rà soát entity/controller trong hội thoại.

---

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 25/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích sử dụng | Backend 3 vai trò |
| Phần việc liên quan | Backend / API |
| Mức độ sử dụng | Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
(tiếp tục) làm chức năng Dịch vụ: admin quản lý danh mục, người thuê yêu cầu, chủ trọ xử lý; chạy thử rồi push
```

#### 4.2. Kết quả AI gợi ý

- DTOs (`ServiceDtos`), repository (`ServiceRepository`, `ServiceRequestRepository`), service (`ServiceCatalogService`, `ServiceRequestService`), 3 controller (`ServicesController`, `TenantServiceRequestsController`, `OwnerServiceRequestsController`), đăng ký DI.
- Yêu cầu liên kết với hợp đồng đang hiệu lực của người thuê; chủ trọ chỉ xử lý được yêu cầu của khách thuê mình (lọc theo OwnerId của hợp đồng).

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Áp dụng vào nhánh `feature/de180358-service-requests`.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Chốt mô hình phân quyền theo hợp đồng (tenant ↔ owner), trạng thái Pending → Approved/Completed/Rejected, và chỉ cho người thuê hủy khi còn Pending.

#### 4.5. Minh chứng

- `TenantServiceRequestsController.cs`, `OwnerServiceRequestsController.cs`, `ServiceRequestService.cs`

---

### Lần sử dụng AI số 3

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 25/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích sử dụng | Frontend 3 vai trò + điều hướng |
| Phần việc liên quan | Frontend / React |
| Mức độ sử dụng | Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
(tiếp tục) làm 3 trang: người thuê xem/yêu cầu dịch vụ, chủ trọ xử lý, admin quản lý danh mục; gắn menu 3 khu vực
```

#### 4.2. Kết quả AI gợi ý

3 trang: `tenant/ServiceRequests.tsx`, `owner/ServiceRequests.tsx`, `admin/Services.tsx`; gắn route + menu vào `App.tsx`, `TenantLayout`, `OwnerLayout`, `AdminLayout`.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Tích hợp đầy đủ vào 3 khu vực người dùng.

#### 4.5. Minh chứng

- `tenant/ServiceRequests.tsx`, `owner/ServiceRequests.tsx`, `admin/Services.tsx`

---

## 5. Bảng tổng hợp mức độ sử dụng AI

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu |  |  | [x] |  | Chọn chức năng chính |
| Thiết kế kiến trúc hệ thống |  |  | [x] |  | Phân quyền 3 vai trò |
| Code frontend |  |  |  | [x] | 3 trang + điều hướng |
| Code backend |  |  |  | [x] | 3 controller + service/repo |
| Debug lỗi |  | [x] |  |  | SQL chậm, encoding curl |
| Kiểm thử sản phẩm |  |  | [x] |  | Test API 3 vai trò |
| Tối ưu code |  | [x] |  |  | Commit sạch |
| Viết báo cáo |  |  | [x] |  | Soạn nháp 4 file audit |

---

## 6. Các lỗi hoặc hạn chế từ AI

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | Cần đảm bảo chủ trọ chỉ xử lý yêu cầu của khách thuê mình | Rà soát nghiệp vụ phân quyền | Lọc yêu cầu theo OwnerId của hợp đồng, kiểm tra quyền khi cập nhật |
| 2 | Người thuê có thể hủy nhầm yêu cầu đã xử lý | Xét vòng đời trạng thái | Chỉ cho hủy khi trạng thái còn Pending |

---

## 7. Kiểm chứng kết quả AI

- Build backend thành công (0 lỗi). Không cần migration (bảng `Services`, `ServiceRequests` đã có sẵn).
- Typecheck frontend đạt (exit 0).
- Chạy thử API thật trên cổng phụ 5299 với 3 tài khoản: Admin tạo dịch vụ → Người thuê xem danh mục và gửi yêu cầu (tự gắn đúng hợp đồng/phòng) → Chủ trọ xem yêu cầu của khách thuê mình và cập nhật "Approved". Tất cả đúng.

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

| Thành viên | MSSV | Nhiệm vụ chính | Có sử dụng AI không? | Minh chứng đóng góp |
|---|---|---|---|---|
| Nguyễn Hồng An | DE180358 | Lập trình chức năng Dịch vụ (FE+BE, 3 vai trò), viết tài liệu | Có | Nhánh `feature/de180358-service-requests` |

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em ở điểm nào?
Dựng nhanh một chức năng lớn nhiều vai trò theo đúng convention và tái dùng dữ liệu hợp đồng có sẵn.

### 9.2. Phần nào em không sử dụng theo gợi ý của AI? Vì sao?
Siết chặt phân quyền theo hợp đồng và điều kiện hủy để tránh sai nghiệp vụ.

### 9.3. Nếu không có AI, phần nào sẽ khó khăn nhất?
Việc dựng đồng thời 3 vai trò (admin/tenant/owner) và nối menu/điều hướng cho cả 3 khu vực.

---

## 10. Cam kết học thuật

Sinh viên cam kết nội dung sử dụng trợ lý AI được ghi nhận hoàn toàn trung thực và chịu trách nhiệm với sản phẩm cuối cùng.

| Sinh viên xác nhận | Ngày xác nhận |
|---|---|
| Nguyễn Hồng An | 25/07/2026 |
