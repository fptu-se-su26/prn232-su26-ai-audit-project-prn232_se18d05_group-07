# AI Learning Reflection - Đợt cập nhật #5

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
| Ngày hoàn thành reflection | 08/06/2026 |

---

## 2. Mục đích Reflection

File này dùng để sinh viên/nhóm tự đánh giá quá trình sử dụng AI trong học tập và thực hiện bài tập, lab, assignment hoặc project.

Reflection cần thể hiện:
- AI đã hỗ trợ gì trong quá trình học.
- Sinh viên/nhóm đã kiểm chứng kết quả AI như thế nào.
- Sinh viên/nhóm đã tự chỉnh sửa, cải tiến ra sao.
- Sinh viên/nhóm học được gì về môn học.
- Sinh viên/nhóm học được gì về cách sử dụng AI minh bạch và có trách nhiệm.

---

## 3. Tóm tắt quá trình sử dụng AI

```text
Trong đợt cập nhật #5: Xây dựng luồng Xác nhận nhận phòng của khách thuê và trang Quản lý Người thuê của chủ nhà, em đã phối hợp chặt chẽ cùng AI Antigravity. Giai đoạn này bắt đầu bằng việc phân tích yêu cầu nghiệp vụ để: (1) Thiết lập trạng thái hợp đồng Pending và trạng thái phòng PendingApproval, xây dựng API accept/reject phía backend và tích hợp vào giao diện MyRoom.tsx phía khách thuê; (2) Phát triển trang quản lý người thuê của chủ nhà Tenants.tsx, viết API backend lấy danh sách khách thuê thực tế kèm dữ liệu tòa nhà; (3) Tinh chỉnh sidebar loại bỏ card hướng dẫn và mẹo nhỏ mock; (4) Giải quyết triệt để lỗi alert trình duyệt khi đăng xuất bằng cách xây dựng Modal React custom xác nhận đăng xuất và cập nhật hàm logout điều hướng trực tiếp về trang đăng nhập /login.
```

---

## 4. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng.

- [ ] ChatGPT
- [ ] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [x] Antigravity
- [ ] Microsoft Copilot
- [ ] Perplexity
- [ ] Công cụ khác: ....................................

### Công cụ được sử dụng nhiều nhất

```text
Antigravity
```

### Lý do sử dụng công cụ đó

```text
Antigravity hỗ trợ viết code Frontend React kết nối với API backend .NET một cách trơn tru. Ngoài ra, AI có khả năng đọc hiểu ngữ cảnh nghiệp vụ phức tạp của hai role khác nhau (Chủ nhà và Khách thuê) để tạo ra luồng dữ liệu khớp nối chính xác.
```

---

## 5. AI đã hỗ trợ em/nhóm ở điểm nào?

Đánh dấu các nội dung phù hợp.

- [x] Hiểu yêu cầu đề bài
- [x] Phân tích bài toán
- [x] Tìm ý tưởng giải pháp
- [ ] Thiết kế database
- [ ] Thiết kế giao diện
- [ ] Thiết kế kiến trúc hệ thống
- [x] Viết code mẫu
- [x] Debug lỗi
- [ ] Viết test case
- [ ] Review code
- [x] Tối ưu code
- [ ] Kiểm tra bảo mật
- [x] Viết báo cáo
- [ ] Làm slide thuyết trình
- [ ] Tìm hiểu công nghệ mới
- [ ] Khác: ....................................

### Mô tả chi tiết

```text
AI hỗ trợ viết các repository query nạp liên kết tòa nhà, thiết kế cấu trúc DTO truyền dữ liệu giữa client-server. Đồng thời hỗ trợ thiết kế giao diện Tenants.tsx gọn gàng, tích hợp bộ lọc tìm kiếm động. Đặc biệt, AI giúp phân tích và cung cấp giải pháp chuyển đổi từ window.confirm sang React Modal custom để loại bỏ hộp thoại mặc định xấu của trình duyệt.
```

---

## 6. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
AI ban đầu gợi ý sử dụng window.location.href = '/login' khi người dùng đăng xuất để reset hoàn toàn state của ứng dụng. Tuy nhiên, em nhận thấy điều này làm reload lại trang web, vi phạm nguyên tắc của Single Page Application (SPA). Em quyết định sử dụng hook useNavigate từ react-router-dom kết hợp với việc reset state trang hiện tại (setCurrentPage('home')) để chuyển hướng mượt mà không gây giật màn hình.
```

---

## 7. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

```text
Em đã áp dụng quy trình kiểm chứng 3 bước:
1. Compile Check: Chạy build cho cả dự án Frontend (npx tsc --noEmit) và Backend (dotnet build) để chắc chắn không có lỗi biên dịch.
2. API Testing: Sử dụng Chrome DevTools Network Tab kiểm chứng các API accept/reject và API lấy danh sách người thuê phản hồi mã 200 OK với đúng dữ liệu.
3. E2E Manual Test: Thực hiện gán phòng -> đăng nhập khách thuê đồng ý -> quay lại tài khoản chủ nhà kiểm tra danh sách người thuê -> test bộ lọc, tìm kiếm -> bấm đăng xuất kiểm chứng modal custom.
```

---

## 8. Nếu không có AI, phần nào sẽ khó khăn nhất?

```text
Khó khăn nhất là đồng bộ hóa trạng thái hợp đồng (Pending -> Active) và trạng thái phòng (PendingApproval -> Occupied) trên cả hai role chủ nhà và khách thuê. Việc viết logic giao dịch (Transaction) trong ContractService.cs backend đòi hỏi sự cẩn thận để tránh lỗi xung đột dữ liệu. AI đã giúp gợi ý mã nguồn xử lý Transaction sạch sẽ và chính xác.
```

---

## 9. Sau bài tập/project này, em/nhóm học được gì về môn học?

```text
Em học được:
1. Cách xây dựng giao dịch cơ sở dữ liệu (Database Transaction) trong ASP.NET Core EF Core để đảm bảo tính toàn vẹn dữ liệu khi cập nhật đồng thời nhiều bảng (Room và Contract).
2. Tầm quan trọng của việc nạp dữ liệu liên quan (Eager Loading) thông qua Include và ThenInclude trong Repository Pattern.
3. Kỹ thuật điều phối navigation SPA bằng React Router trong các layout dashboard phức tạp.
```

---

## 10. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

```text
Sử dụng AI có trách nhiệm là luôn kiểm chứng các logic chuyển trang và bảo mật. Khi AI gợi ý đăng xuất, nó chỉ chú trọng đến việc xóa giao diện mà quên mất việc gọi hàm xóa session/token thực tế trên bộ nhớ. Em đã tự chủ động gọi hàm `logout()` từ AuthContext trước khi chuyển trang để bảo mật tuyệt đối phiên làm việc của người dùng.
```

---

## 11. Tự đánh giá mức độ hoàn thành & Điểm tự đánh giá

| Tiêu chí | Điểm tự đánh giá 1-5 | Ghi chú |
|---|:---:|---|
| Ghi nhận việc dùng AI trung thực | 5 | Khai báo chi tiết 5 prompt đã sử dụng |
| Prompt có mục tiêu rõ ràng | 5 | Mô tả cụ thể luồng nghiệp vụ và lỗi alert native |
| Kiểm chứng kết quả AI | 5 | Kiểm tra biên dịch và chạy tích hợp E2E |
| Tự chỉnh sửa/cải tiến | 5 | Thay đổi cơ chế redirect sử dụng useNavigate |
| Hiểu nội dung đã nộp | 5 | Giải thích rõ các luồng Pending và custom modal |
| Reflection có chiều sâu | 5 | Rút ra bài học về Transaction C# và điều phối SPA |
| Sử dụng AI có trách nhiệm | 5 | Tự kiểm soát bảo mật token khi logout |

---

## 12. Câu hỏi tự vấn cuối bài

### 12.1. Nếu giảng viên hỏi về phần AI đã hỗ trợ, em/nhóm có giải thích lại được không?

```text
Chắc chắn giải thích được. Em hiểu rõ luồng đi của API từ Controller -> Service -> Repository, cách lấy thông tin Claims từ Token để định danh Owner, cơ chế hoạt động của modal React custom quản lý bởi React State (isLogoutConfirmOpen).
```

### 12.2. Nếu không có AI, em/nhóm có thể tự làm lại phần quan trọng nhất không?

```text
Có thể tự làm lại được. Phần backend service C# hoàn toàn nằm trong khả năng lập trình của em, và trang frontend chỉ cần thời gian kéo layout CSS và viết hàm gọi axios/api thông thường.
```

### 12.3. Phần nào trong bài thể hiện rõ nhất năng lực thật sự của em/nhóm?

```text
Việc thiết kế và tích hợp bộ lọc động ở Tenants.tsx (từ khóa, tòa nhà, trạng thái, online/offline) được thực hiện hoàn toàn ở phía Client để tối ưu hóa tốc độ tải trang, giảm thiểu số lần gọi API lên server khi người dùng chuyển đổi các tùy chọn lọc nhanh.
```

### 12.4. Em/nhóm muốn cải thiện kỹ năng nào sau bài này?

```text
Cải thiện kỹ năng thiết kế middleware phân quyền nâng cao trong C# và viết các test case tự động cho luồng xác nhận hợp đồng.
```

---

## 13. Cam kết Reflection

Em/nhóm cam kết nội dung phản ánh trung thực quá trình học tập.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phan Hoài An | 08/06/2026 |
