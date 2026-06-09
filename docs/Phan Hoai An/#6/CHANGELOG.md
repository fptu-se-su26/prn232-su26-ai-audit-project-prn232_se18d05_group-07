# Changelog - Đợt cập nhật #6

## 1. Quy định ghi Changelog

File này dùng để ghi lại các thay đổi quan trọng trong quá trình thực hiện bài tập, lab, assignment hoặc project.

Nguyên tắc ghi changelog:
- Chỉ ghi những gì đã hoàn thành thật sự.
- Không ghi kế hoạch nếu chưa thực hiện.
- Mỗi thay đổi nên có ngày, nội dung, người thực hiện và minh chứng.
- Nếu có AI hỗ trợ, cần ghi rõ AI đã hỗ trợ phần nào.
- Nếu có commit GitHub, cần ghi link commit.
- Nếu có lỗi đã sửa, cần ghi rõ lỗi, nguyên nhân và cách xử lý.

---

## 2. Thông tin project

| Thông tin | Nội dung |
|---|---|
| Môn học | Lập trình C# |
| Mã môn học | PRN232 |
| Lớp | SE18D05 |
| Học kỳ | SU26 |
| Tên bài tập / Project | RoomHub - Quản lý phòng/nhà trọ |
| Tên sinh viên / Nhóm | Phan Hoài An / Nhóm 07 |
| MSSV / Danh sách MSSV | DE180303 |
| Giảng viên hướng dẫn | Thầy Lê Thiện Nhật Quang |
| Repository URL | https://github.com/fptu-se-su26/prn232-su26-ai-audit-project-prn232_se18d05_group-07 |
| Ngày bắt đầu | 08/06/2026 |
| Ngày hoàn thành | 08/06/2026 |

---

## 3. Tổng quan các phiên bản/giai đoạn

| Phiên bản/Giai đoạn | Thời gian | Nội dung chính | Trạng thái |
|---|---|---|---|
| Phase 01 | 28/05/2026 | Khởi tạo cấu trúc Backend Clean Architecture & CSDL SQL Server | Completed |
| Phase 02 | 29/05/2026 | Giao diện công khai dành cho Khách trọ | Completed |
| Phase 03 | 30/05/2026 | Giao diện Vận hành & Quản lý tài sản của Chủ nhà | Completed |
| Phase 04 | 04/06/2026 | Sửa lỗi UX/UI, loại bỏ mock data, kết nối API thực tế cho toàn bộ Owner pages | Completed |
| Phase 06 | 07/06/2026 | Luồng Xác nhận nhận phòng/từ chối của Khách thuê (Tenant Room Acceptance/Rejection Flow) | Completed |
| Phase 07 | 08/06/2026 | Trang Quản lý Khách thuê dành cho Chủ nhà, sửa giao diện sidebar/avatar, tạo EF migration | Completed |
| Phase 08 | 08/06/2026 | Triển Khai & Cải Tiến Tính Năng Hóa Đơn & Chốt Tiền (Chủ nhà & Khách thuê) | Completed |

---

# [Phase 08] Triển Khai & Cải Tiến Tính Năng Hóa Đơn & Chốt Tiền (Chủ nhà & Khách thuê)

## Ngày thực hiện

```text
08/06/2026
```

## Đã hoàn thành

- [x] **Nghiệp vụ tính nước cố định & Sửa chỉ số cũ**:
  - Bổ sung các trường `IsWaterFixed` và `WaterFixedAmount` vào `RoomReadingInput` DTO.
  - Cập nhật logic tính toán chi phí nước và mô tả hóa đơn (Fixed vs By Volume) trong [InvoiceService.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Application/Services/InvoiceService.cs).
  - Hỗ trợ endpoint xuất báo cáo Excel cho Tenant `GET api/tenant/invoices/{id}/export` trong [TenantInvoicesController.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.API/Controllers/TenantInvoicesController.cs).
  - Fix triệt để lỗi eager loading tại RoomRepository khi tải building/floor tránh NullReferenceException.
- [x] **Nâng cấp giao diện Chốt hóa đơn hàng loạt (InvoiceCreate.tsx)**:
  - Cho phép chỉnh sửa cả Số điện cũ (`oldElectric`) và Số nước cũ (`oldWater`) trực tiếp bằng ô nhập `<input type="number">`.
  - Bổ sung cột chọn hình thức nước: **Theo khối** hoặc **Cố định** bằng thẻ `<select>`.
  - Tự động thay đổi input nhập chỉ số: Nếu chọn Cố định, ẩn ô nhập chỉ số và hiển thị ô nhập tiền nước cố định trực tiếp.
  - Tinh gọn Stepper từ 5 bước xuống còn **3 bước** rõ ràng (Nhập số liệu -> Rà soát -> Thành công).
  - Tự động cuộn màn hình lên đầu trang (`window.scrollTo`) khi chốt hóa đơn thành công để trải nghiệm người dùng tự nhiên hơn.
- [x] **Cải tiến Menu 3 chấm danh sách hóa đơn (InvoiceList.tsx)**:
  - Thay thế cơ chế Hover của menu thao tác 3 chấm bằng Click trigger sử dụng React state (`activeMenuId`).
  - Tích hợp hook lắng nghe sự kiện nhấn chuột bên ngoài (`outside click handler`) để đóng dropdown menu một cách tự nhiên.
- [x] **Xuất báo cáo Excel phía Tenant (InvoiceDetail.tsx)**:
  - Tích hợp nút **"Xuất file Excel"** ở đầu trang chi tiết hóa đơn phía Tenant, gọi API backend và thực hiện tải file blob.
- [x] **Repository & Service ở Backend cho Khách thuê (Tenant Invoices)**:
  - Thêm phương thức `GetInvoicesByTenantAsync` vào [InvoiceRepository.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Infrastructure/Persistence/Repositories/InvoiceRepository.cs) nạp eager loading các bảng `Floor`, `Building`, `Room`, `InvoiceItems`, `Payments` giúp khách thuê truy cập đủ thông tin hóa đơn.
  - Triển khai `GetTenantInvoicesAsync`, `GetTenantInvoiceDetailAsync`, và `TenantPayInvoiceAsync` trong [InvoiceService.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Application/Services/InvoiceService.cs).
- [x] **Cập nhật định tuyến ứng dụng (App.tsx)**:
  - Cập nhật định tuyến hash-routing trong [App.tsx](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Frontend/src/App.tsx) để truyền state `selectedInvoiceId` và `setSelectedInvoiceId` cho tenant invoice và chi tiết hóa đơn, đồng thời cập nhật xử lý URL để nhận biết chính xác URL `#tenant/invoices/<id>` khi truy cập trực tiếp.
- [x] **Động hóa danh sách hóa đơn của Khách thuê (MyInvoices.tsx)**:
  - Cập nhật [MyInvoices.tsx](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Frontend/src/pages/tenant/MyInvoices.tsx) gọi API `api.get('/tenant/invoices')` để thay thế hoàn toàn mock data tĩnh.
  - Hiển thị các khố- [x] **Cập nhật cảnh báo hóa đơn chưa thanh toán trên Dashboard (Dashboard.tsx)**:
  - Cập nhật [Dashboard.tsx](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Frontend/src/pages/tenant/Dashboard.tsx) để gọi API nạp hóa đơn thật.
  - Tự động quét và hiển thị hộp cảnh báo màu đỏ (Warning block) của hóa đơn chưa thanh toán gần nhất kèm số tiền cần đóng và nút **"Thanh toán ngay"** dẫn trực tiếp sang trang chi tiết hóa đơn.
  - Nếu đã đóng đủ tiền, hiển thị khối nhiệm vụ hoàn thành "Không có hóa đơn chưa trả" sạch sẽ.
- [x] **Tính năng Tính nước tự động theo đầu người (`MaxCapacity`) & Chỉnh sửa chi tiết phòng**:
  - Thêm thuộc tính `WaterBillingType` và `MaxCapacity` vào database cho `Building` và `Room` (đã chạy migration thành công).
  - Tích hợp lựa chọn loại hình tính nước mặc định tại giao diện tạo tài sản `PropertyCreate.tsx`.
  - Hỗ trợ xem và cập nhật thông tin phòng (bao gồm đổi hình thức nước, đơn giá, và chỉnh sửa sức chứa tối đa `MaxCapacity`) trong modal sửa phòng tại `UnitDetail.tsx` thông qua API `PUT api/owner/units/{id}`.
  - Cập nhật logic backend tự động tính tiền nước theo đầu người (`Đơn giá * MaxCapacity`) tại `CreateBatchInvoicesAsync` của `InvoiceService.cs` khi lập hóa đơn cho các phòng cấu hình nước cố định.
  - Ẩn/khóa ô nhập tiền nước và chỉ số nước trên frontend lập hóa đơn hàng loạt (`InvoiceCreate.tsx`) nếu phòng được cấu hình tính nước cố định theo đầu người.
- [x] **Sửa lỗi xuất Excel phía Chủ nhà**:
  - Sửa lỗi ném Exception `400 Bad Request` từ EPPlus do thiết lập màu nền cho ô Excel khi chưa khai báo `PatternType = Solid` tại backend `InvoiceService.cs`.
- [x] **Sửa lỗi biên dịch TypeScript Frontend**:
  - Sửa lỗi gọi hàm `validateUnit` thiếu tham số (chỉ truyền 6 thay vì 8 tham số) tại `InvoiceCreate.tsx`.
  - Sửa lỗi phép toán do sai lệch kiểu dữ liệu `oldElectric` bằng cách ép kiểu `Number(oldElectric)`.

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Thêm Repository query hóa đơn cho khách thuê | Phan Hoài An | `IInvoiceRepository.cs`, `InvoiceRepository.cs` | Code backend compiled |
| 2 | Viết nghiệp vụ dịch vụ lấy & thanh toán hóa đơn | Phan Hoài An | `IInvoiceService.cs`, `InvoiceService.cs` | Code backend compiled |
| 3 | Tạo API Controller cho vai trò khách thuê | Phan Hoài An | `TenantInvoicesController.cs` | Code backend compiled |
| 4 | Cập nhật định tuyến state selectedInvoiceId | Phan Hoài An | `App.tsx` | URL hash update hoạt động |
| 5 | Thay thế mock data trong trang danh sách hóa đơn | Phan Hoài An | `MyInvoices.tsx` | Trang hiển thị hóa đơn thật |
| 6 | Viết trang chi tiết hóa đơn & kết nối API | Phan Hoài An | `InvoiceDetail.tsx` | Hiển thị chi tiết và thanh toán |
| 7 | Cập nhật cảnh báo hóa đơn động trên Dashboard | Phan Hoài An | `Dashboard.tsx` | Warning block tự động hiển thị |
| 8 | Biên dịch kiểm thử TypeScript và C# | Phan Hoài An | Frontend / Backend | Build succeeded & Typecheck OK |
| 9 | Thêm logic tính tiền nước cố định và cột mới | Phan Hoài An | `InvoiceService.cs`, `InvoiceCreate.tsx` | UI chọn nước cố định và nhập tiền |
| 10| Hỗ trợ chỉnh sửa số điện/nước cũ trên UI | Phan Hoài An | `InvoiceCreate.tsx` | Các ô nhập cũ/mới tự động validate |
| 11| Tinh gọn Stepper chốt tiền phòng thành 3 bước | Phan Hoài An | `InvoiceCreate.tsx` | Nhập số liệu -> Rà soát -> Thành công |
| 12| Đổi menu thao tác 3 chấm từ hover sang click | Phan Hoài An | `InvoiceList.tsx` | Nhấn để mở, tự đóng khi click outside |
| 13| Tích hợp nút xuất báo cáo Excel cho Tenant | Phan Hoài An | `InvoiceDetail.tsx` (Tenant) | Tải file Excel trực tiếp |
| 14| Thêm thuộc tính WaterBillingType và MaxCapacity vào DB | Phan Hoài An | `Building.cs`, `Room.cs`, DB Migration | Migration thành công |
| 15| Hỗ trợ API cập nhật chi tiết phòng | Phan Hoài An | `UnitsController.cs`, `PropertyService.cs` | PUT api/owner/units/{id} |
| 16| Thiết lập tính nước theo đầu người tự động | Phan Hoài An | `InvoiceService.cs`, `InvoiceCreate.tsx` | Tính tiền tự động và ẩn khóa ô nhập |
| 17| Modal cập nhật MaxCapacity và dịch vụ phòng | Phan Hoài An | `UnitDetail.tsx` | Cho phép sửa MaxCapacity trực tiếp |
| 18| Sửa lỗi tô màu ô Excel trong EPPlus | Phan Hoài An | `InvoiceService.cs` | Xuất Excel hoạt động tốt |
| 19| Sửa lỗi compile TypeScript | Phan Hoài An | `InvoiceCreate.tsx` | Compile sạch lỗi ở frontend |

## Bug Report chi tiết

| STT | Tên lỗi | Nguyên nhân | Cách sửa |
|---:|---|---|---|
| B-01 | Thiếu eager loading khi lấy hóa đơn | Lazy loading làm đứt liên kết tới Floor/Building gây lỗi | Thêm nạp liên kết Eager Loading trong InvoiceRepository |
| B-02 | Trang chi tiết hóa đơn không nhận dạng được ID | Component không nhận prop invoiceId và App.tsx không truyền prop | Bổ sung prop invoiceId vào component và cập nhật AppContent render |
| B-03 | Thanh toán hóa đơn phía Tenant không thể thực hiện | API hóa đơn cũ bị chặn quyền chỉ cho PropertyOwner | Viết API TenantInvoicesController riêng phân quyền Role Tenant |
| B-04 | Lỗi Object reference khi chốt hóa đơn hàng loạt | RoomRepository.GetRoomsByBuildingAsync không nạp Floor/Building dẫn tới room.Floor bị null khi tính giá dịch vụ | Thêm Include(r => r.Floor).ThenInclude(f => f.Building) trong RoomRepository |
| B-05| Lỗi EPPlus Excel PatternType | EPPlus yêu cầu thiết lập PatternType = Solid trước khi gán màu nền | Thêm khai báo `worksheet.Cells[...].Style.Fill.PatternType = ExcelFillStyle.Solid` trong file export |
| B-06| TypeScript compilation error validateUnit | Gọi hàm validateUnit với 6 tham số trong khi khai báo yêu cầu 8 tham số | Truyền đầy đủ các tham số gồm oldElectric, newElectric, oldWater, newWater... |
| B-07| TypeScript arithmetic operand type error | Phép tính toán trừ trực tiếp trên `oldElectric` kiểu string | number | Dùng wrapper `Number(oldElectric)` để bảo vệ kiểu dữ liệu |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI trợ lý Antigravity đã hỗ trợ tích cực trong việc: (1) Thiết kế API Controller TenantInvoicesController và tích hợp các phương thức Service tương ứng ở backend; (2) Thực hiện thay đổi cơ cấu định tuyến trong App.tsx giúp truyền selectedInvoiceId mượt mà và hỗ trợ bookmark URL trực tiếp; (3) Viết lại MyInvoices.tsx và InvoiceDetail.tsx kết nối dữ liệu API thật và mô phỏng thanh toán; (4) Cập nhật Dashboard.tsx tự động lọc và đưa ra warning block hóa đơn chưa đóng gần nhất. (5) Thiết lập cấu trúc lưu hình thức tính nước (WaterBillingType) và MaxCapacity cho tài sản/phòng. (6) Cải thiện logic Backend tính nước cố định theo đầu người và Sửa lỗi biên dịch TypeScript và Export Excel (EPPlus).
```

## Cam kết cập nhật Changelog

Sinh viên/nhóm cam kết rằng nội dung changelog phản ánh đúng các thay đổi đã thực hiện trong quá trình làm bài tập/project.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phan Hoài An | 08/06/2026 |
