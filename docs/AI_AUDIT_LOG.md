Dưới đây là nội dung file **AI Audit Log** hoàn chỉnh, đã được điền sẵn thông tin dựa trên đợt làm việc thực tế của bạn bằng **Grok** để thiết kế database cho dự án **RoomHub**.

Mục số 4 đã được áp dụng mẹo **gộp toàn bộ các prompt nhỏ thành một đợt lớn** và bọc trong thẻ đóng/mở (`<details>`) như đã thảo luận để file của bạn cực kỳ gọn gàng, chuyên nghiệp và không bị loạn.

---

# AI Audit Log

## 1. Thông tin chung

| Thông tin | Nội dung |
| --- | --- |
| Môn học | Phát triển ứng dụng với .NET |
| Mã môn học | PRN232 |
| Lớp | SE18D05 |
| Học kỳ | Summer 2026 |
| Tên bài tập / Project | RoomHub - Nền tảng kết nối trực tuyến giữa người thuê và người cho thuê |
| Tên sinh viên / Nhóm | Group 07 |
| MSSV / Danh sách MSSV | *[Điền danh sách MSSV của nhóm bạn vào đây]* |
| Giảng viên hướng dẫn | Quang Lê |
| Ngày bắt đầu | 15/05/2026 |
| Ngày hoàn thành | *[17/5/2026]* |

---

## 2. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng trong quá trình thực hiện bài tập/project.

* [ ] ChatGPT
* [ ] Gemini
* [ ] Claude
* [ ] GitHub Copilot
* [ ] Cursor
* [ ] Antigravity
* [ ] Perplexity
* [ ] Microsoft Copilot
* [x] Công cụ khác: Grok (xAI)

---

## 3. Mục tiêu sử dụng AI

Mô tả ngắn gọn sinh viên/nhóm đã sử dụng AI để hỗ trợ những công việc nào.

### Mô tả mục tiêu sử dụng AI

```text
Nhóm đã sử dụng AI (Grok) để hỗ trợ quá trình phân tích thực thể và thiết kế cấu trúc Database (SQL Server) ban đầu cho hệ thống RoomHub. Mục tiêu là nhanh chóng có được bộ khung cơ sở dữ liệu chuẩn hóa, thiết lập chính xác các mối quan hệ giữa các bảng cốt lõi (Người dùng, Phòng trọ, Lượt đặt phòng) trước khi tiến hành code phần Backend.

```

---

## 4. Nhật ký sử dụng AI chi tiết

> **Hướng dẫn cho nhóm:** Click vào đợt làm việc bên dưới để xem hoặc bổ sung chi tiết nhật ký.

---

### Lần sử dụng AI số 1: [AI-LOG-01] Thiết kế cấu trúc Database cho RoomHub

| Nội dung | Thông tin |
| --- | --- |
| Ngày sử dụng | 17/05/2026 |
| Công cụ AI | Grok |
| Mục đích sử dụng | Thiết kế Database ban đầu cho hệ thống kết nối thuê phòng |
| Phần việc liên quan | Database |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng

```text
Tôi đang làm dự án RoomHub - nền tảng kết nối trực tuyến giữa người thuê và người cho thuê phòng. Hệ thống có các đối tượng chính như Người dùng (gồm chủ nhà và khách thuê), Phòng trọ (Rooms), và các lượt đặt phòng (Bookings). Hãy viết script SQL Server để tạo database hoàn chỉnh cho hệ thống này, đảm bảo có các ràng buộc khóa chính, khóa ngoại và chuẩn hóa dữ liệu.

```

#### 4.2. Kết quả AI gợi ý

Grok đã phân tích và sinh ra đoạn script SQL tạo cấu trúc cơ bản bao gồm các bảng:

* `Users`: Lưu thông tin tài khoản, phân biệt vai trò (Chủ nhà / Khách thuê) qua trường `Role`.
* `Rooms`: Lưu thông tin phòng trọ (Địa chỉ, giá cả, diện tích, trạng thái, ID chủ nhà).
* `Bookings`: Lưu thông tin đặt phòng (ID khách thuê, ID phòng, ngày bắt đầu, ngày kết thúc, trạng thái thanh toán).
* Các đoạn mã tạo ràng buộc khóa ngoại `FOREIGN KEY` liên kết giữa các bảng một cách hợp lý.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

* Sử dụng cấu trúc thiết kế của bảng `Bookings` vì AI đã tính toán chính xác mối quan hệ n-n giữa `Users` và `Rooms`.
* Sử dụng các đoạn mã ràng buộc dữ liệu (`FOREIGN KEY`, `DEFAULT`, `CHECK`) do AI sinh ra để đảm bảo toàn vẹn dữ liệu.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

* **Thay đổi kiểu dữ liệu:** Đổi toàn bộ khóa chính (`Id`) của các bảng từ kiểu `INT IDENTITY(1,1)` sang kiểu `UNIQUEIDENTIFIER` (GUID) tạo tự động bằng `NEWID()` để phù hợp với kiến trúc ba lớp và bảo mật URL hệ thống tốt hơn.
* **Bổ sung nghiệp vụ:** Hệ thống thực tế cần lưu chi tiết trạng thái phòng và hình ảnh phòng. Nhóm đã tự tạo thêm bảng `RoomImages` và trường `VerifyStatus` (để Admin duyệt phòng) mà Grok chưa tự động nhận diện được ở prompt đầu tiên.

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
| --- | --- |
| Link commit | *[Dán link commit chứa file database.sql trên GitHub của nhóm bạn vào đây]* |
| File liên quan | `src/Database/RoomHub_DB.sql` |
| Screenshot | *[Dán link ảnh hoặc đính kèm ảnh chụp màn hình chạy script SQL thành công trong SSMS]* |
| Kết quả chạy/test | Đã chạy thành công trên SQL Server 2022, tạo đủ các bảng và diagram đúng quan hệ. |

#### 4.6. Nhận xét cá nhân/nhóm

Grok hiểu rất nhanh nghiệp vụ của một ứng dụng kết nối trung gian. Tuy nhiên, mã nguồn do AI sinh ra mang tính tổng quát; nhóm vẫn phải chủ động tinh chỉnh lại kiểu dữ liệu (như đổi sang GUID) và thêm các trường đặc thù của đồ án để khớp với cấu trúc .NET 8 đang triển khai.

---

*(Khi nhóm bạn có thêm các đợt dùng AI sau như làm UI, làm API, chỉ cần nhân bản phần `<details>` của Lần số 2, số 3 ra phía dưới là xong)*

---

## 5. Bảng tổng hợp mức độ sử dụng AI

Đánh dấu mức độ AI hỗ trợ ở từng hạng mục.

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| Phân tích yêu cầu |   | [x] |   |   | Khảo sát luồng RoomHub |
| Viết user story/use case |   |   |   |   |   |
| Thiết kế database |   |   | [x] |   | Dùng Grok lên khung |
| Thiết kế kiến trúc hệ thống | [x] |   |   |   | Tự làm theo 3-Layer |
| Thiết kế giao diện |   |   |   |   |   |
| Code frontend |   |   |   |   |   |
| Code backend |   |   |   |   |   |
| Debug lỗi |   |   |   |   |   |
| Viết test case |   |   |   |   |   |
| Kiểm thử sản phẩm |   |   |   |   |   |
| Tối ưu code |   |   |   |   |   |
| Viết báo cáo |   |   |   |   |   |
| Làm slide thuyết trình |   |   |   |   |   |

---

## 6. Các lỗi hoặc hạn chế từ AI

Ghi lại các trường hợp AI trả lời sai, thiếu, chưa phù hợp hoặc sinh code không chạy.

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
| --- | --- | --- | --- |
| 1 | Thiết kế thiếu bảng lưu hình ảnh phòng trọ (`RoomImages`). | Khi vẽ ERD, nhóm nhận thấy một phòng trọ có thể có nhiều ảnh (quan hệ 1-n) nên không thể nhét chung một trường vào bảng `Rooms`. | Nhóm tự viết bổ sung bảng `RoomImages` có khóa ngoại trỏ về `Rooms(Id)`. |
| 2 | Sử dụng kiểu dữ liệu tăng tự động `INT IDENTITY` cho khóa chính. | Đối chiếu với quy chuẩn bảo mật dự án (tránh để người dùng đoán được ID của phòng/user qua URL). | Chuyển toàn bộ khóa chính sang kiểu `UNIQUEIDENTIFIER`. |

---

## 7. Kiểm chứng kết quả AI

### Nội dung kiểm chứng

```text
Nhóm đã kiểm chứng kết quả thiết kế database từ Grok thông qua các bước:
1. Copy đoạn script SQL vào phần mềm SQL Server Management Studio (SSMS).
2. Chạy thử (Execute) lệnh để đảm bảo không bị lỗi cú pháp T-SQL.
3. Tạo Database Diagram trực tiếp trên SSMS để kiểm tra trực quan các đường nối khóa ngoại xem đã đúng mối quan hệ (1-n, n-n) giữa Người dùng, Phòng và Đơn đặt phòng hay chưa.
4. Chèn thử một vài dữ liệu mẫu (Sample data) để test xem các ràng buộc (Constraints) hoạt động chính xác.

```

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.1. Đối với bài cá nhân

*(Bỏ trống mục này nếu làm bài nhóm)*

### 8.2. Đối với bài nhóm

| Thành viên | MSSV | Nhiệm vụ chính | Có sử dụng AI không? | Minh chứng đóng góp |
| --- | --- | --- | --- | --- |
| *[Tên bạn]* | *[MSSV]* | Nghiên cứu nghiệp vụ, hỏi Grok để thiết kế DB, sửa script SQL | Có | Link commit file RoomHub_DB.sql |
| *[Thành viên 2]* |  |  | Có / Không |  |
| *[Thành viên 3]* |  |  | Có / Không |  |

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em/nhóm ở điểm nào?

```text
AI đã hỗ trợ nhóm đẩy nhanh tốc độ viết code SQL thô. Thay vì mất thời gian gõ từng dòng lệnh CREATE TABLE hay nhớ cú pháp ràng buộc khóa ngoại phức tạp, AI sinh ra mẫu chuẩn trong vài giây.

```

### 9.2. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
Nhóm không dùng kiểu khóa chính tăng tự động (INT IDENTITY) vì nó không an toàn cho các hệ thống web hiện đại và không tối ưu khi làm việc với ORM trong .NET 8 nếu muốn quản lý ID từ tầng ứng dụng.

```

### 9.3. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

```text
Chạy trực tiếp trên hệ quản trị cơ sở dữ liệu SQL Server và tạo Diagram để thẩm định mối quan hệ thực thể.

```

### 9.4. Nếu không có AI, phần nào sẽ khó khăn nhất?

```text
Việc tự ngồi gõ và chuẩn hóa các mối quan hệ khóa ngoại bằng tay dễ dẫn đến sai sót về mặt cú pháp hoặc thiếu sót các ràng buộc toàn vẹn dữ liệu.

```

### 9.5. Sau bài tập/project này, em/nhóm học được gì về môn học?

```text
Hiểu sâu hơn về cách tổ chức cơ sở dữ liệu cho một hệ thống mang tính chất nền tảng kết nối (Platform) thực tế.

```

### 9.6. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

```text
Học được rằng AI chỉ là người đưa ra bản phác thảo. Lập trình viên bắt buộc phải có kiến thức nền tảng vững chắc để phản biện, lọc bỏ những phần code không an toàn và bổ sung những phần nghiệp vụ thực tế mà AI chưa hiểu hết.

```

---

## 10. Cam kết học thuật

Sinh viên/nhóm cam kết rằng:

* Nội dung AI hỗ trợ đã được ghi nhận trung thực.
* Không nộp nguyên văn kết quả AI mà không kiểm tra.
* Có khả năng giải thích các phần đã nộp.
* Chịu trách nhiệm về tính đúng đắn của sản phẩm cuối cùng.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
| --- | --- |
| *[Đỗ Thanh Tín]* | 17/05/2026 |