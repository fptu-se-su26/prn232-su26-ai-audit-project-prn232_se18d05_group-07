# AI Audit Log

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
| Ngày bắt đầu | 28/05/2026 |
| Ngày hoàn thành | 28/05/2026 |

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

- Phân tích yêu cầu bài toán và quy trình làm việc (workflow) tài liệu học thuật của nhóm.
- Gợi ý ý tưởng giải pháp tổ chức cấu trúc mã nguồn theo chuẩn Clean Architecture (Onion Architecture).
- Thiết kế sơ đồ phân lớp của Backend C# .NET và cấu trúc dự án Frontend React TypeScript (Vite).
- Hỗ trợ viết kịch bản script/lệnh CLI để khởi tạo tự động giải pháp (.sln), các dự án con (Class Libraries, Web API) và liên kết tham chiếu (Dependency References).
- Cài đặt các thư viện NuGet cốt lõi và khởi tạo toàn bộ hệ thống thư mục con tiêu chuẩn có chứa file ẩn `.gitkeep` để kiểm soát mã nguồn trên Git.

### Mô tả mục tiêu sử dụng AI

```text
Sử dụng trợ lý AI Antigravity để phân tích cấu trúc tài liệu mẫu của dự án (AI_AUDIT_LOG.md, CHANGELOG.md, PROMPTS.md, REFLECTION.md). Sau đó, tham vấn ý kiến chuyên gia của AI để thiết kế giải pháp cấu trúc dự án phẳng (Flat Root Structure) gồm RoomHub.Backend (Clean Architecture) và RoomHub.Frontend (React TS Vite) đặt trực tiếp tại thư mục gốc, cùng cấp với thư mục docs. Cuối cùng, sử dụng AI để thực thi các lệnh CLI dotnet và npm để khởi tạo dự án nhanh chóng, chính xác và không có lỗi biên dịch.
```
## 4. Nhật ký sử dụng AI chi tiết

> Mỗi lần sử dụng AI cho một phần quan trọng của bài tập/project, sinh viên cần ghi lại theo mẫu bên dưới.  
> Sinh viên/nhóm có thể nhân bản mẫu “Lần sử dụng AI” nhiều lần tùy theo số lần sử dụng AI thực tế.

---

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 28/05/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Phân tích tài liệu mẫu và thiết lập kế hoạch kiến trúc |
| Phần việc liên quan | Requirement / Design / Project Architecture |
| Mức độ sử dụng | Hỗ trợ ý tưởng / Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng

```text
bạn hãy giúp tôi phân tích dự án thật kĩ và nêu ra phân tích ý nghĩa thật kĩ của các file docs\Phan Hoai An\#1\AI_AUDIT_LOG.md, docs\Phan Hoai An\#1\CHANGELOG.md, docs\Phan Hoai An\#1\PROMPTS.md, docs\Phan Hoai An\#1\REFLECTION.md để đảm bảo bạn hiểu rõ quy trình làm việc trước nhé, hãy bắt đầu phân tích
```

#### 4.2. Kết quả AI gợi ý

AI đã phân tích sâu sắc ý nghĩa của 4 file tài liệu học thuật:
- **`AI_AUDIT_LOG.md`**: Minh chứng học thuật khai báo sử dụng AI.
- **`CHANGELOG.md`**: Ghi nhận tiến độ thực tế theo từng phase công việc.
- **`PROMPTS.md`**: Ghi nhật ký prompt chi tiết để nâng cao kỹ năng prompt engineering.
- **`REFLECTION.md`**: Phản tỉnh tự đánh giá năng lực làm chủ công nghệ của sinh viên.
Đồng thời, AI đã đề xuất Kế hoạch triển khai khởi tạo cấu trúc dự án RoomHub sử dụng Clean Architecture (Backend C# .NET và Frontend React TS) rất khoa học.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Sử dụng toàn bộ phân tích ý nghĩa tài liệu để áp dụng vào quy trình hoạt động của nhóm và lấy khung sườn của Kế hoạch triển khai Clean Architecture để thảo luận nội bộ.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Yêu cầu AI cải tiến kiến trúc: Không dùng thư mục trung gian `src` mà đặt trực tiếp `RoomHub.Backend` và `RoomHub.Frontend` ở thư mục gốc (cùng cấp với `docs`) để các thành viên dễ làm việc, dễ cấu hình độc lập.

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | N/A |
| File liên quan | N/A |
| Screenshot | N/A |
| Kết quả chạy/test | Đạt đồng thuận 5 thành viên trong nhóm |
| Link video demo | N/A |
| Ghi chú khác | N/A |

#### 4.6. Nhận xét cá nhân/nhóm

Hiểu rõ hơn về mục đích và ý nghĩa sâu sắc của việc tài liệu hóa quá trình đồng hành cùng AI, cũng như định hình được sơ đồ kiến trúc chuẩn của dự án trước khi lập trình.

---

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 28/05/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Khởi tạo cấu trúc Backend C# .NET và Frontend React TypeScript |
| Phần việc liên quan | Backend / Frontend / Project Structure |
| Mức độ sử dụng | Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
bây giờ bạn hãy giúp tôi thực hiện triển khai các bước đảm bảo đúng chuẩn, hãy thực hiện các bước cụ thể... tạo RoomHub.Backend, RoomHub.sln, các dự án con (Domain, Application, Infrastructure, API), thiết lập các references, cài đặt các nuget packages... và khởi tạo luôn đầy đủ các thư mục con như Entities, Controllers, Interfaces... tiếp theo hãy thực hiện tiếp khởi tạo cấu trúc cho frontend đảm bảo đúng chuẩn
```

#### 4.2. Kết quả AI gợi ý

AI đã tự động chạy các dòng lệnh hệ thống để:
1. Tạo thư mục `RoomHub.Backend` chứa Solution `RoomHub.sln`.
2. Tạo 4 projects con `Domain`, `Application`, `Infrastructure`, `API` và liên kết chúng lại bằng các câu lệnh `dotnet add reference`.
3. Tải và cài đặt các thư viện NuGet: `MediatR`, `FluentValidation`, `Mapster`, `EFCore.SqlServer`, `EFCore.Tools`, `Jwt`, `OpenApi`, `Swashbuckle`...
4. Tạo đầy đủ cấu trúc thư mục con (`Entities`, `Enums`, `Interfaces`, `Behaviors`, `Repositories`, `Controllers`, `Middlewares`...) kèm file ẩn `.gitkeep`.
5. Tạo dự án Frontend React TS bằng Vite `RoomHub.Frontend`, chạy `npm install` các thư viện `axios`, `react-router-dom`, `lucide-react` và tạo cấu trúc thư mục frontend chuẩn (`components`, `pages`, `services`, `hooks`...).
6. Chạy thử nghiệm build cả Backend và Frontend và kiểm chứng biên dịch thành công 100%.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Sử dụng toàn bộ cấu trúc dự án mẫu đã được sinh ra để làm khung xương phát triển mã nguồn chính thức cho dự án RoomHub.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Kiểm tra lại cấu trúc file, dọn dẹp các tệp mẫu sinh tự động (`Class1.cs` trong backend), cấu hình tệp tin `.gitkeep` để kiểm soát hoạt động đồng bộ mã nguồn của nhóm trên Git tốt hơn.

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | Khởi tạo cấu trúc Clean Architecture Backend & Frontend React |
| File liên quan | N/A |
| Screenshot | Biên dịch backend và frontend build thành công |
| Kết quả chạy/test | `dotnet build` đạt 0 lỗi, 0 cảnh báo; `npm run build` thành công |
| Link video demo | N/A |
| Ghi chú khác | Đã tích hợp sẵn file `.gitkeep` ở mọi thư mục |

#### 4.6. Nhận xét cá nhân/nhóm

Quá trình khởi tạo diễn ra nhanh chóng, loại bỏ hoàn toàn các lỗi liên quan đến sai đường dẫn tham chiếu hoặc cài đặt sai phiên bản NuGet. Thư mục con phẳng giúp dự án trông rất chuyên nghiệp.

---

## 5. Bảng tổng hợp mức độ sử dụng AI

Đánh dấu mức độ AI hỗ trợ ở từng hạng mục.

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu |  |  | [x] |  | Hiểu quy trình tài liệu |
| Viết user story/use case | [x] |  |  |  | Sẽ làm ở các phase sau |
| Database / ERD | [x] |  |  |  | Sẽ thiết kế ở phase sau |
| Thiết kế kiến trúc hệ thống |  |  |  | [x] | Cấu trúc Clean Architecture phẳng |
| Thiết kế giao diện | [x] |  |  |  | Sẽ làm ở các phase sau |
| Code frontend |  |  |  | [x] | Khởi tạo cấu trúc folder Vite |
| Code backend |  |  |  | [x] | Khởi tạo solution & projects con |
| Debug lỗi | [x] |  |  |  | Không phát sinh lỗi biên dịch nào |
| Viết test case | [x] |  |  |  | Sẽ làm ở các phase sau |
| Kiểm thử sản phẩm |  | [x] |  |  | Xác thực biên dịch build dự án |
| Tối ưu code |  | [x] |  |  | Xóa các file Class1.cs tự sinh |
| Viết báo cáo |  |  | [x] |  | Cập nhật các file markdown hỗ trợ |
| Làm slide thuyết trình | [x] |  |  |  | Chưa thực hiện |

---

## 6. Các lỗi hoặc hạn chế từ AI

Ghi lại các trường hợp AI trả lời sai, thiếu, chưa phù hợp hoặc sinh code không chạy.

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | AI ban đầu đề xuất cấu trúc có thư mục trung gian `src` chứa cả backend và frontend | Đọc file đề xuất [implementation_plan.md] | Yêu cầu AI sửa đổi thành cấu trúc phẳng ở thư mục gốc |
| 2 | Lệnh PowerShell xóa file Class1.cs gặp lỗi nhỏ | Đọc log lỗi trên terminal | AI tự động điều hướng và dùng các lệnh chuyên biệt khác để xử lý |

---

## 7. Kiểm chứng kết quả AI

Mô tả cách sinh viên/nhóm kiểm tra lại kết quả do AI gợi ý.

Có thể bao gồm:
- Chạy thử lệnh biên dịch backend `dotnet build` tại thư mục `RoomHub.Backend/` để kiểm tra liên kết tham chiếu và các gói NuGet.
- Chạy thử lệnh build frontend `npm run build` tại thư mục `RoomHub.Frontend/` để kiểm duyệt TS Compiler và bundler Vite.
- Kiểm duyệt trực quan cấu trúc thư mục đã tạo trên IDE để đảm bảo file `.gitkeep` có mặt ở tất cả các folder con trống.

### Nội dung kiểm chứng

```text
Mã nguồn Backend và Frontend đã được biên dịch độc lập. Backend đạt 0 lỗi, 0 cảnh báo. Frontend build thành công tệp tin production tĩnh gọn nhẹ. Cấu trúc thư mục khớp chính xác với bản thiết kế trong file implementation_plan.md.
```

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.1. Đối với bài cá nhân

N/A (Đây là đồ án nhóm PRN232).

### 8.2. Đối với bài nhóm

| Thành viên | MSSV | Nhiệm vụ chính | Có sử dụng AI không? | Minh chứng đóng góp |
|---|---|---|---|---|
| Phan Hoài An | DE180303 | Phân tích yêu cầu kiến trúc, phối hợp AI khởi tạo thành công cấu trúc dự án | Có | Đã đẩy cấu trúc Clean Architecture & Frontend hoàn chỉnh lên Git kèm bộ tài liệu cập nhật |

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em/nhóm ở điểm nào?

```text
AI hỗ trợ thiết kế cấu trúc hệ thống một cách khoa học, tự động chạy lệnh CLI phức tạp để tạo cấu trúc và cài đặt hàng loạt thư viện NuGet/npm chuẩn mà không bị sai sót về phiên bản hoặc đường dẫn liên kết.
```

### 9.2. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
Phần cấu trúc thư mục trung gian src chứa cả Backend và Frontend. Nhóm quyết định từ bỏ vì nó tạo ra quá nhiều tầng thư mục sâu, gây khó khăn cho việc quản lý mã nguồn độc lập của các thành viên.
```

### 9.3. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

```text
Thông qua việc kiểm duyệt trực quan thư mục trên IDE và chạy trực tiếp lệnh biên dịch hệ thống (dotnet build & npm run build).
```

### 9.4. Nếu không có AI, phần nào sẽ khó khăn nhất?

```text
Việc thiết lập các liên kết tham chiếu chéo giữa các tầng Clean Architecture và cài đặt đúng các package NuGet tương thích phiên bản sẽ tốn nhiều thời gian tra cứu tài liệu và dễ phát sinh lỗi liên kết.
```

### 9.5. Sau bài tập/project này, em/nhóm học được gì về môn học?

```text
Hiểu sâu sắc về triết lý phân tách mối quan tâm (Separation of Concerns) của Clean Architecture, cách tổ chức thư mục ứng dụng C# thực tế và cách tích hợp React TS.
```

### 9.6. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

```text
Không nên phó thác hoàn toàn cho AI. Phải chủ động kiểm duyệt thiết kế của AI, chỉnh sửa những điểm chưa hợp lý để phù hợp với ngữ cảnh cụ thể của nhóm và kiểm thử nghiêm ngặt kết quả trước khi đưa vào sản xuất.
```

---

## 10. Cam kết học thuật

Sinh viên/nhóm cam kết rằng:

- Nội dung AI hỗ trợ đã được ghi nhận trung thực.
- Không nộp nguyên văn kết quả AI mà không kiểm tra.
- Có khả năng giải thích các phần đã nộp.
- Chịu trách nhiệm về tính đúng đắn của sản phẩm cuối cùng.
- Hiểu rằng việc sử dụng AI không khai báo có thể ảnh hưởng đến kết quả đánh giá.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phan Hoài An | 28/05/2026 |
