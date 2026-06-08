# AI Audit Log - Đợt cập nhật #6

## 1. Thông tin chung

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
| Ngày bắt đầu | 08/06/2026 |
| Ngày hoàn thành | 08/06/2026 |

---

## 2. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng trong quá trình thực hiện bài tập/project.

- [ ] ChatGPT
- [ ] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [x] Antigravity
- [ ] Perplexity
- [ ] Microsoft Copilot
- [ ] Công cụ khác: ....................................

---

## 3. Mục tiêu sử dụng AI

Mô tả ngắn gọn sinh viên/nhóm đã sử dụng AI để hỗ trợ những công việc nào.

- Xây dựng phần Backend Service và API Controller bảo mật dành riêng cho Tenant (Khách thuê) để phục vụ việc truy xuất danh sách hóa đơn, xem chi tiết và thực hiện thanh toán online (mô phỏng).
- Cập nhật định tuyến React Router SPA trong `App.tsx` hỗ trợ chuyển đổi state `selectedInvoiceId` và đồng bộ hash-routing khớp với URL của khách thuê.
- Thay thế hoàn toàn dữ liệu tĩnh trong trang `MyInvoices.tsx` và `InvoiceDetail.tsx` bằng dữ liệu động lấy từ API thực tế thông qua Axios client.
- Tạo luồng xử lý và dịch nhãn tự động cho các mục thanh toán dịch vụ (Rent, Electricity, Water, Internet, Garbage...).
- Thiết kế Warning block hiển thị động trên Tenant Dashboard cảnh báo hóa đơn quá hạn hoặc chưa thanh toán gần nhất, đi kèm nút điều hướng nhanh.
- Thực hiện kiểm chứng biên dịch toàn hệ thống.

---

## 4. Nhật ký sử dụng AI chi tiết

---

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Giai đoạn | Backend API & Services / Phase 08 |
| Ngày sử dụng | 08/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Phát triển các endpoint và dịch vụ hóa đơn cho Tenant |
| Phần việc liên quan | Infrastructure Repository, Application Services & API Controller |
| Mức độ sử dụng | Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
tiếp theo sau đây tôi muốn thực hiện tính năng quan trọng đó chính là tính năng Hóa đơn & Chốt tiền của hệ thống, bạn hãy giup tôi phân tích thật kĩ tất cả các file liên quan để hiểu rõ dự án và hãy đề xuất ra kế hoạch thực hiện owner sẽ làm gì về tính năng đó và đồng thời tenant cũng sẽ làm gì, hãy phân tích thật kĩ đảm bảo tính năng đúng chuẩn và tối ưu và hợp lí vưới thực tế
```

*(Sau khi lập kế hoạch, tiến hành viết code)*

```text
bạn hãy thực hiện triển khai và đảm bảo đúng chuẩn cấu trúc dự án và hãy phải hồi tôi bằng tiếng việt chứ đừng phản hồi bằng tiếng anh đồng thời tạo giúp tôi #6 trong docs\Phan Hoai An đảm bảo template đồng bộ với các # trước đó, hãy thực hiện triên rkhai đảm bảo đúng chuẩn
```

#### 4.2. Kết quả AI gợi ý

AI thiết kế và viết code:
- Thêm `GetInvoicesByTenantAsync` vào `InvoiceRepository.cs` nạp liên kết Floor và Building.
- Viết `GetTenantInvoicesAsync`, `GetTenantInvoiceDetailAsync`, và `TenantPayInvoiceAsync` trong `InvoiceService.cs` thực hiện kiểm tra bảo mật đúng mã khách thuê.
- Tạo mới controller `TenantInvoicesController.cs` phân quyền Role "Tenant" với 3 endpoint: GET, GET/{id}, và POST/{id}/pay.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Sử dụng toàn bộ logic backend code ở Controller và Services.

#### 4.4. Minh chứng

- Files liên quan: `InvoiceRepository.cs`, `InvoiceService.cs`, `TenantInvoicesController.cs`

---

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Giai đoạn | Frontend Invoices & Detail Pages / Phase 08 |
| Ngày sử dụng | 08/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Định tuyến và kết nối API thật cho các trang hóa đơn của khách thuê |
| Phần việc liên quan | Frontend Routing (App.tsx), MyInvoices.tsx, InvoiceDetail.tsx |
| Mức độ sử dụng | Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
(AI tự động thực hiện triển khai dựa theo task.md để kết nối các trang frontend với API backend mới viết)
```

#### 4.2. Kết quả AI gợi ý

AI đề xuất:
- Cập nhật `App.tsx` bọc các component hóa đơn của tenant bằng props `invoiceId` và `setSelectedInvoiceId`, hỗ trợ hash router bắt dạng `#tenant/invoices/<id>`.
- Viết lại `MyInvoices.tsx` gọi `/api/tenant/invoices` tính toán stats động.
- Viết lại `InvoiceDetail.tsx` hiển thị hóa đơn dịch vụ thật, tạo nút thanh toán gửi POST `/api/tenant/invoices/{id}/pay` với request body mô phỏng.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Sử dụng toàn bộ code định tuyến và các component hóa đơn.

#### 4.4. Minh chứng

- Files liên quan: `App.tsx`, `MyInvoices.tsx`, `InvoiceDetail.tsx`

---

### Lần sử dụng AI số 3

| Nội dung | Thông tin |
|---|---|
| Giai đoạn | Tenant Dashboard Dynamic warning / Phase 08 |
| Ngày sử dụng | 08/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Động hóa cảnh báo hóa đơn chưa thanh toán trên Dashboard |
| Phần việc liên quan | Dashboard.tsx |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng

```text
(AI tự động thực hiện triển khai dựa theo task.md để đồng bộ Dashboard)
```

#### 4.2. Kết quả AI gợi ý

AI đề xuất fetch `/tenant/invoices` tại `Dashboard.tsx`, tìm hóa đơn quá hạn hoặc chưa đóng đầu tiên và render Warning block đỏ nổi bật thay thế khối task_alt tĩnh.

#### 4.3. Minh chứng

- Files liên quan: `Dashboard.tsx`

---

### Lần sử dụng AI số 4

| Nội dung | Thông tin |
|---|---|
| Giai đoạn | Hình thức nước & Tính toán tiền nước / Phase 08 |
| Ngày sử dụng | 08/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Bổ sung hình thức tính nước theo đầu người và chức năng sửa MaxCapacity của phòng |
| Phần việc liên quan | Entity, Migration, DTOs, Services, Controllers, React Components |
| Mức độ sử dụng | Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
bạn hãy thực hiện cập nhật chỉnh sử cụ thể như sau đây, hiện tại về vấn đề tiền nước tôi muốn tính theo khối hay theo số tiền mặc định thì việc đó sẽ phụ thước vào lúc mình tạo mới tài sản và phòng hiện tại lúc thực hiện tạo mới tài sản thì chỉ có ổ nhập số tiền nước theo mét khối mà thôi...
```

#### 4.2. Kết quả AI gợi ý

AI đề xuất:
- Thêm `WaterBillingType` và `MaxCapacity` vào `Building.cs` và `Room.cs`, tạo migration và update DB.
- Cập nhật logic tính nước tự động trong `CreateBatchInvoicesAsync` ở `InvoiceService.cs` (`Đơn giá nước * MaxCapacity` của phòng).
- Tạo API `PUT api/owner/units/{id}` ở `UnitsController.cs` để hỗ trợ sửa phòng trọ.
- Thêm modal sửa chi tiết phòng trọ ở `UnitDetail.tsx` và tự động ẩn/khóa các ô nhập chỉ số nước ở `InvoiceCreate.tsx`.

#### 4.3. Minh chứng

- Files liên quan: `Building.cs`, `Room.cs`, `InvoiceService.cs`, `PropertyService.cs`, `UnitDetail.tsx`, `InvoiceCreate.tsx`

---

### Lần sử dụng AI số 5

| Nội dung | Thông tin |
|---|---|
| Giai đoạn | Sửa lỗi Excel Export & TypeScript / Phase 08 |
| Ngày sử dụng | 08/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Sửa lỗi tô màu nền ô Excel trong EPPlus và lỗi compile TypeScript frontend |
| Phần việc liên quan | Backend InvoiceService, Frontend InvoiceCreate |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng

```text
Sửa lỗi export Excel (Bad Request 400) ở Backend và lỗi compile TypeScript frontend (validateUnit gọi sai đối số và lỗi phép tính toán).
```

#### 4.2. Kết quả AI gợi ý

AI sửa đổi:
- Khai báo `worksheet.Cells[...].Style.Fill.PatternType = ExcelFillStyle.Solid` trong file `InvoiceService.cs` trước khi gán màu nền.
- Truyền đủ 8 đối số cho hàm `validateUnit` tại `InvoiceCreate.tsx` và dùng `Number(oldElectric)` để bảo vệ kiểu dữ liệu trong phép toán.

#### 4.3. Minh chứng

- Files liên quan: `InvoiceService.cs`, `InvoiceCreate.tsx`

---

## 5. Mức độ sử dụng AI trong các hạng mục dự án

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu |  |  | [x] |  |  |
| Database / ERD |  | [x] |  |  | Thêm WaterBillingType và MaxCapacity |
| Thiết kế giao diện |  | [x] |  |  | Modal sửa phòng và bộ lọc hóa đơn |
| Code frontend |  |  | [x] |  | InvoiceCreate.tsx, UnitDetail.tsx, MyInvoices.tsx |
| Code backend |  |  | [x] |  | Cập nhật Entity, DTO, Service, Controller |
| Debug lỗi |  |  | [x] |  | Lỗi EPPlus Excel, lỗi TypeScript compile |
| Kiểm thử sản phẩm |  | [x] |  |  |  |
| Viết báo cáo |  |  | [x] |  | Tạo tài liệu học thuật đợt 6 |

---

## 6. Các lỗi hoặc hạn chế từ AI

- Lỗi NullReferenceException khi chốt hóa đơn do thiếu eager loading Floor/Building trong repository RoomRepository. Đã xử lý bằng cách thêm Include vào query.
- Lỗi EPPlus Excel tô màu ô nền bị ném exception do thiếu PatternType = Solid. Đã cấu hình thêm PatternType.
- Lỗi compile TypeScript do gọi validateUnit bị thiếu tham số ở hai vị trí bulk action trong frontend. Đã bổ sung đầy đủ tham số.

---

## 7. Kiểm chứng kết quả AI

- Chạy lệnh `npm run build` ở Frontend kiểm duyệt hoàn thành thành công không có lỗi kiểu dữ liệu TypeScript.
- Chạy `dotnet build` ở Backend kiểm thử và biên dịch thành công.
- Thực hiện kiểm chứng nghiệp vụ:
  1. Tạo tài sản với cấu hình nước mặc định theo đầu người, tạo phòng với sức chứa `MaxCapacity = 3`, đơn giá nước `30,000đ/người`.
  2. Tại trang chi tiết phòng, chỉnh sửa `MaxCapacity` lên `4` người, đơn giá nước đổi thành `25,000đ/người`.
  3. Lập hóa đơn hàng loạt: Phòng tự động hiển thị WaterBillingType là cố định, ô nhập chỉ số nước bị khóa và hiển thị số tiền cố định dự kiến là `100,000đ` (4 người * 25,000đ).
  4. Xác nhận tạo hóa đơn: Hóa đơn được tạo thành công, các mục thanh toán thể hiện đúng chi phí nước cố định.
  5. Xuất Excel hóa đơn của chủ nhà hoạt động trơn tru không còn lỗi 400 Bad Request.

---

## 8. Cam kết học thuật

Sinh viên/nhóm cam kết nội dung phản ánh đúng quá trình sử dụng AI trong project.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phan Hoài An | 08/06/2026 |

