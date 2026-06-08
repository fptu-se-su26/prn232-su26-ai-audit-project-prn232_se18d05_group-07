# AI Audit Log - Đợt cập nhật #5

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
| Ngày bắt đầu | 07/06/2026 |
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

- Xây dựng luồng xác nhận nhận phòng/từ chối của khách thuê (Phase 06): cập nhật trạng thái hợp đồng `Pending` và phòng `PendingApproval`. Viết các service chấp nhận/từ chối và tích hợp giao diện cho Tenant Room dashboard.
- Xây dựng giao diện trang Người thuê trọ của chủ trọ (Phase 07) tại `http://localhost:5173/browse#/owner/tenants`: viết API, nạp liên kết tòa nhà, tạo bảng hiển thị danh sách khách hàng trọ kèm bộ lọc thông minh, xem chi tiết và thanh lý hợp đồng.
- Tinh chỉnh giao diện Sidebar: Xóa khối card hướng dẫn nhanh ở giao diện chủ nhà và khối mẹo nhỏ ở giao diện khách thuê.
- Thay thế hộp thoại native confirm của trình duyệt khi đăng xuất bằng Modal React xác nhận tuỳ chỉnh, sửa lỗi điều hướng đăng xuất về trang đăng nhập `/login` thay vì trang chủ.

---

## 4. Nhật ký sử dụng AI chi tiết

---

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 07/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Xây dựng luồng xác nhận nhận phòng/từ chối của khách thuê (Phase 06) |
| Phần việc liên quan | Backend Service & Controller / Frontend Tenant Room |
| Mức độ sử dụng | Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
tiếp theo bây giờ tôi muốn thực hiện tiếp tính năng thêm khách thuê tenant vào phòng ở cụ thể , cho biết sẽ có hai đối tượng khách thuê đó là người có sử dụng hệ thống app này đối với đối tượng thuê này thì khi người chủ thực hiện thêm người đó vào phòng cụ thể bằng Email và số điện thoại và các thông tin khác thì nó sẽ đồng thời ở phần phòng của tôi bên phía role tenant http://localhost:5173/browse#/tenant/room sẽ đồng thời được gán vào chính xác phòng đó luôn, và đối tượng hai nếu người thuê là người không có sử dụng hệ thống này thì chủ trọ vẫn thực hiện thêm thông tin người đó vào phòng mà người đó thuê bình thường
```

*(Tiếp tục bổ sung ở lượt tiếp theo về luồng chấp nhận/từ chối)*

```text
tiếp theo bây giờ bạn hãy giúp tôi phân tích lại dự án thật kĩ và hiện tại tôi muốn cập nhật bổ sung tiếp như sau cho luồng thêm người thuê vào phòng, hiện tại tôi muốn cập nhật lại cụ thể như sau, cho biết khi thực hiện thêm người thuê vào phòng nếu đối với người thuê có sử dụng hệ thống thì tôi muốn bên phía người thuê khi chủ nhà thực hiện thêm vào phòng thì người thuê đó có thể thực hiện chấp nhận hoặc từ chối việc thêm vào phòng đó hiện tại đang không có bước xác nhận của người thuê còn đối với người thuê không sử dụng hệ thống thì không cần phải xác nhận hay gì cả nhé
```

#### 4.2. Kết quả AI gợi ý

AI đã phân tích cấu trúc backend, đề xuất cập nhật các lớp dịch vụ:
- Thêm `Pending` vào `ContractStatus` enum và `PendingApproval` vào `RoomStatus` enum.
- Cập nhật logic `CreateContractAsync` và viết thêm `AcceptContractAsync`, `RejectContractAsync` vào `ContractService.cs`.
- Viết API endpoints trong `TenantRoomController.cs` và cập nhật UI phía khách thuê ở `MyRoom.tsx` hiển thị banner mời cùng 2 nút Đồng ý/Từ chối.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Sử dụng toàn bộ logic gọi API và cấu trúc component trong `MyRoom.tsx`, các hàm xử lý API backend trong `ContractService.cs`.

#### 4.4. Minh chứng

- Commit backend: `feat: implement tenant room acceptance confirmation flow`
- File liên quan: `TenantRoomController.cs`, `ContractService.cs`, `MyRoom.tsx`

---

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 08/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Xây dựng trang danh sách người thuê của chủ nhà (Phase 07) |
| Phần việc liên quan | Backend DTOs & Repository / Frontend Tenants Page |
| Mức độ sử dụng | Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
tiếp theo bây giờ bạn hãy giúp tôi phân tích dự án thật kĩ và cập nhật bổ sung trang giao diện người thuê của role chủ nhà owner http://localhost:5173/browse#/owner/tenants, hãy thực hiện cập nhật đảm bảo trang đó chưa những tính năng hợp lí và thực hiện phân tích thật kĩ và cập nhật đảm bảo hợp lí phù hợp với dự án và đảm bảo đúng chuẩn cấu trúc dự án hiện tại
```

#### 4.2. Kết quả AI gợi ý

AI xác định dữ liệu cần lấy kèm theo liên kết tòa nhà. Đề xuất:
- Cập nhật repository `ContractRepository.cs` nạp liên kết `Floor` và `Building`.
- Thêm DTO `OwnerTenantDto` vào `ContractDtos.cs` và viết endpoint lấy danh sách người thuê.
- Tạo component `Tenants.tsx` hỗ trợ lọc theo Tòa nhà, Trạng thái (đang thuê/chờ xác nhận), Hình thức (online/offline), tìm kiếm nhanh, xem profile chi tiết và form thanh lý hợp đồng.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Sử dụng cấu trúc component `Tenants.tsx`, endpoint api backend và cách liên kết routing trong `App.tsx`.

#### 4.4. Minh chứng

- File liên quan: `Tenants.tsx`, `App.tsx`, `ContractRepository.cs`, `ContractsController.cs`

---

### Lần sử dụng AI số 3

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 08/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Tinh chỉnh thanh Sidebar, loại bỏ các card thừa của hai Role |
| Phần việc liên quan | Frontend / Sidebar Layout |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng

```text
tiếp theo giúp tôi xóa đi hai phần đầu tiên là phần Hướng dẫn nhanh
Tạo toà nhà, đăng tin và chốt hoá đơn hàng tháng chỉ trong 3 phút.
ở giao diện quản lí của role owner thứ hai là xóa đi phần _and_updates
Mẹo nhỏ
Xác minh danh tính để chủ trọ tin tưởng và duyệt hợp đồng nhanh hơn.
ở trang giao diện dashboard của role tenant nhé
```

#### 4.2. Kết quả AI gợi ý

AI đã tìm ra đoạn HTML dựng các card hướng dẫn và mẹo nhỏ trong `OwnerLayout.tsx` và `TenantLayout.tsx`, đề xuất xóa bỏ hoàn toàn các khối mã nguồn này.

#### 4.3. Minh chứng

- File liên quan: `OwnerLayout.tsx`, `TenantLayout.tsx`

---

### Lần sử dụng AI số 4

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 08/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Sửa lỗi đăng xuất xuất hiện localhost confirm và không về trang login |
| Phần việc liên quan | Frontend / Auth UX / Modal Logout |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng

```text
tiếp theo cập nhật khi nhấn đăng xuất ở dashboard của hai role thì thực hiện out ra trang login luôn chứ hiện tại đang bị out ra trang chủ thôi chứ không phải trang login
```
*(Yêu cầu bổ sung)*
```text
khi nhấn đăng xuất không muốn xuất hiện localhost sáy
```

#### 4.2. Kết quả AI gợi ý

AI phân tích: Việc dùng `window.confirm()` hiển thị thông báo mặc định của trình duyệt chứa văn bản `localhost says`. Giải pháp:
- Thêm state `isLogoutConfirmOpen` vào `OwnerLayout.tsx` và `TenantLayout.tsx`.
- Viết lại hàm `handleLogout` mở modal React custom thay vì gọi alert.
- Khi người dùng nhấn nút Đăng xuất trong modal, gọi `logout()`, reset page state và sử dụng `navigate('/login')` chuyển hướng về trang đăng nhập.

#### 4.3. Minh chứng

- File liên quan: `OwnerLayout.tsx`, `TenantLayout.tsx`

---

## 5. Mức độ sử dụng AI trong các hạng mục dự án

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu |  |  | [x] |  |  |
| Database / ERD | [x] |  |  |  | Giữ nguyên |
| Thiết kế giao diện |  | [x] |  |  | Chỉnh sửa sidebar & custom modal |
| Code frontend |  |  |  | [x] | Tạo Tenants.tsx, sửa MyRoom.tsx, Layouts |
| Code backend |  |  | [x] |  | Thêm endpoints, service và DTO |
| Debug lỗi |  |  | [x] |  | Khắc phục lỗi alert trình duyệt, redirect |
| Kiểm thử sản phẩm |  | [x] |  |  |  |
| Viết báo cáo |  |  | [x] |  | Tạo tài liệu học thuật đợt 5 |

---

## 6. Các lỗi hoặc hạn chế từ AI

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | AI gợi ý dùng `window.location.href` để chuyển hướng về trang đăng nhập | Quan sát hành vi trang bị load lại toàn bộ gây trễ | Sử dụng hook `useNavigate` từ `react-router-dom` giúp chuyển hướng SPA mượt mà |

---

## 7. Kiểm chứng kết quả AI

- Chạy lệnh `npx tsc --noEmit` kiểm duyệt hoàn toàn không phát sinh lỗi kiểu dữ liệu TypeScript ở Frontend.
- Chạy `dotnet build` ở Backend kiểm thử lỗi build của C#.
- Đăng nhập tài khoản Chủ nhà → Vào trang Người thuê trọ → Tìm kiếm lọc dữ liệu trơn tru. Bấm Đăng xuất → Modal custom xuất hiện chuyên nghiệp → Xác nhận đăng xuất → Chuyển hướng thẳng về `/login`.

---

## 8. Cam kết học thuật

Sinh viên/nhóm cam kết nội dung phản ánh đúng quá trình sử dụng AI trong project.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phan Hoài An | 08/06/2026 |
