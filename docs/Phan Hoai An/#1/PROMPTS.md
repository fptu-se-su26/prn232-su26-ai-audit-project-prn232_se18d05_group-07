# Prompt Log

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
| Ngày cập nhật gần nhất | 28/05/2026 |

---

## 2. Mục đích của file Prompt Log

File này dùng để ghi lại các prompt quan trọng đã sử dụng trong quá trình thực hiện bài tập, lab, assignment hoặc project.

Sinh viên/nhóm cần ghi lại:

- Đã hỏi AI điều gì.
- Mục đích sử dụng prompt.
- Công cụ AI đã sử dụng.
- AI đã trả lời hoặc gợi ý gì.
- Kết quả đó có được áp dụng vào bài hay không.
- Sinh viên/nhóm đã kiểm tra, chỉnh sửa hoặc cải tiến gì sau khi nhận kết quả từ AI.

---

## 3. Công cụ AI đã sử dụng

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

---

## 4. Bảng tổng hợp prompt đã sử dụng

| STT | Ngày | Công cụ AI | Mục đích | Prompt tóm tắt | Kết quả chính | Có sử dụng vào bài không? | Minh chứng |
|---:|---|---|---|---|---|---|---|
| 1 | 28/05/2026 | Antigravity | Phân tích tài liệu | Phân tích ý nghĩa 4 file markdown mẫu | Hiểu rõ quy trình tài liệu hóa | Có | Link commit docs |
| 2 | 28/05/2026 | Antigravity | Thiết kế | Đề xuất Kế hoạch triển khai Clean Architecture | Bản thiết kế cấu trúc Backend & Frontend chi tiết | Có | [implementation_plan.md] |
| 3 | 28/05/2026 | Antigravity | Cấu hình | Yêu cầu điều chỉnh sang cấu trúc phẳng không qua src | Đề xuất sửa đổi bản thiết kế | Có | [implementation_plan.md] |
| 4 | 28/05/2026 | Antigravity | Khởi tạo | Thực thi lệnh CLI để tạo project Backend và dependencies | Tạo thành công Solution, 4 project con và NuGet Packages | Có | [walkthrough.md] |
| 5 | 28/05/2026 | Antigravity | Khởi tạo | Tạo thư mục con Entities, Repositories... kèm .gitkeep | Cấu trúc folder backend sạch sẽ và được theo dõi bởi Git | Có | [walkthrough.md] |
| 6 | 28/05/2026 | Antigravity | Khởi tạo | Tạo dự án Frontend React TS bằng Vite và install dependencies | Dựng thành công Frontend cùng các thư viện cơ bản | Có | [walkthrough.md] |

---

## 5. Prompt chi tiết

---

### Prompt số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 28/05/2026 |
| Công cụ AI | Antigravity |
| Mục đích | Thiết kế giải pháp kiến trúc tổng quát |
| Phần việc liên quan | Design / Project Architecture |
| Mức độ sử dụng | Hỏi ý tưởng / Hỏi sinh code |

#### 5.1. Prompt nguyên văn

```text
bạn hãy thực hiện đề xuất một Kế hoạch triển khai khởi tạo cấu trúc dự án Clean Architecture chi tiết, đảm bảo đúng chuẩn nhé
```

#### 5.2. Bối cảnh khi viết prompt

```text
Cần một thiết kế chuẩn chỉ về Clean Architecture cho Backend C# .NET kết hợp React TypeScript Frontend, phân tách rõ ràng trách nhiệm của từng layer để thảo luận nhóm trước khi code.
```

#### 5.3. Kết quả AI trả về

```text
AI đề xuất một file implementation_plan.md cực kỳ chi tiết, vẽ sơ đồ Mermaid về chiều phụ thuộc giữa các lớp, giải nghĩa vai trò của Domain, Application, Infrastructure, API và cấu trúc folder của React Frontend.
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Lấy cấu trúc layer và danh sách các NuGet packages quan trọng áp dụng vào thực tế dự án RoomHub.
```

#### 5.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến

```text
Yêu cầu AI điều chỉnh lại: Loại bỏ thư mục trung gian src, đưa hai thư mục RoomHub.Backend và RoomHub.Frontend ra trực tiếp thư mục gốc.
```

#### 5.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [x] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [ ] Cần hỏi lại AI nhiều lần
- [ ] Cần tự kiểm tra và chỉnh sửa nhiều
- [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 5.7. Minh chứng liên quan

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | N/A |
| File liên quan | N/A |
| Screenshot | N/A |
| Kết quả chạy/test | Đã biên duyệt |
| Ghi chú khác | N/A |

#### 5.8. Ghi chú thêm

```text
Nhận được phản hồi rất nhanh và chi tiết.
```

---

### Prompt số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 28/05/2026 |
| Công cụ AI | Antigravity |
| Mục đích | Thực thi khởi tạo Backend |
| Phần việc liên quan | Backend / Project Structure |
| Mức độ sử dụng | Hỏi sinh code |

#### 5.1. Prompt nguyên văn

```text
bây giờ bạn hãy giúp tôi thực hiện triển khai các bước đảm bảo đúng chuẩn, hãy thực hiện các bước cụ thể... Bước 1: Tạo thư mục giải pháp .NET... Bước 2: Tạo các dự án con (Domain, Application, Infrastructure, API)... Bước 3: Thiết lập các Dependency References... Bước 4: Cài đặt các NuGet Packages cơ bản...
```

#### 5.2. Bối cảnh khi viết prompt

```text
Cần khởi tạo nhanh giải pháp và các lớp dự án mà không muốn thực hiện thủ công từng bước trên IDE hoặc gõ từng dòng CLI dài để tránh sai sót.
```

#### 5.3. Kết quả AI trả về

```text
AI chạy tự động một chuỗi lệnh CLI phức tạp: `dotnet new sln`, `dotnet new classlib`, `dotnet add reference`, `dotnet add package`.
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Tạo lập thành công toàn bộ hệ thống file dự án Backend chuẩn.
```

#### 5.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến

```text
N/A (AI chạy tự động hoàn hảo).
```

#### 5.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [x] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [ ] Cần hỏi lại AI nhiều lần
- [ ] Cần tự kiểm tra và chỉnh sửa nhiều
- [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 5.7. Minh chứng liên quan

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | N/A |
| File liên quan | N/A |
| Screenshot | N/A |
| Kết quả chạy/test | dotnet build thành công không lỗi |
| Ghi chú khác | N/A |

#### 5.8. Ghi chú thêm

```text
Rất hiệu quả, tiết kiệm hơn 1 tiếng thiết lập thủ công.
```

---

## 6. Prompt quan trọng nhất

Chọn một prompt có ảnh hưởng lớn nhất đến bài tập/project.

### 6.1. Prompt được chọn

```text
tôi không muốn tạo thư mục src và để backend và frontend cùng tầng với thư mục docs được không
```

### 6.2. Vì sao prompt này quan trọng?

```text
Prompt này giúp bẻ hướng thiết kế cấu trúc thư mục của dự án ngay từ đầu để đáp ứng sát sườn nhất nhu cầu thực tế của nhóm (quản lý phẳng, dễ chia việc), tránh việc sau này phải tái cấu trúc (refactor) lại đường dẫn của Git, rất phức tạp.
```

### 6.3. Kết quả prompt này mang lại

```text
Một bản thiết kế cấu trúc phẳng, thông thoáng và khoa học, được cả nhóm đồng thuận cao.
```

### 6.4. Sinh viên/nhóm đã kiểm tra kết quả như thế nào?

```text
Chạy thử nghiệm toàn bộ hệ thống dự án sau khi tạo ở thư mục gốc và thấy việc di chuyển giữa các project rất dễ dàng.
```

### 6.5. Sinh viên/nhóm đã cải tiến gì từ kết quả AI?

```text
Yêu cầu AI cập nhật luôn bản kế hoạch [implementation_plan.md] để các thành viên khác khi xem cũng hiểu được lý do vì sao không dùng thư mục src.
```

---

## 7. Prompt chưa hiệu quả

Ghi lại ít nhất một prompt chưa tạo ra kết quả tốt hoặc chưa phù hợp.

### 7.1. Prompt chưa hiệu quả

```text
$dirs = @("RoomHub.Domain\Entities", ...); foreach ($dir in $dirs) { New-Item -ItemType Directory -Force -Path $dir; New-Item -ItemType File -Force -Path (Join-Path $dir ".gitkeep") }; Remove-Item -Path "RoomHub.Domain\Class1.cs" ...
```

### 7.2. Vì sao prompt này chưa hiệu quả?

```text
Đây là một khối lệnh kết hợp PowerShell mà AI tự động chạy. Lệnh chạy thành công tạo thư mục con nhưng ở lệnh xóa file Class1.cs cuối cùng gặp một cảnh báo/lỗi PowerShell nhỏ về luồng thực thi, dẫn đến CLI trả về exit code 1 làm gián đoạn nhẹ.
```

### 7.3. Cách cải thiện prompt

```text
Tách biệt rõ ràng lệnh tạo thư mục con và lệnh dọn dẹp file, hoặc sử dụng cờ `-ErrorAction SilentlyContinue` một cách nhất quán cho mọi lệnh xóa trong Windows PowerShell.
```

### 7.4. Prompt sau khi cải tiến

```text
Remove-Item -Path "RoomHub.Domain\Class1.cs" -ErrorAction SilentlyContinue
```

### 7.5. Kết quả sau khi cải tiến prompt

```text
Lệnh chạy trơn tru, không sinh thêm bất kỳ lỗi terminal nào.
```

---

## 8. Bài học về cách viết prompt

### 8.1. Khi viết prompt, em/nhóm cần cung cấp thông tin gì để AI trả lời tốt hơn?

```text
- Mục tiêu cụ thể: Tạo solution hay cài NuGet package gì.
- Môi trường công nghệ: C# .NET 8, React TS Vite.
- Cấu trúc thư mục mong muốn: phẳng (flat root).
- Không yêu cầu AI tự đoán mà đưa ra các chỉ dẫn đường dẫn rõ ràng.
```

### 8.2. Em/nhóm đã học được gì về cách đặt câu hỏi cho AI?

```text
Đặt câu hỏi theo lối phân rã (Decomposition): Hỏi từng bước từ Phân tích ➜ Thiết kế kế hoạch ➜ Chỉnh sửa kế hoạch ➜ Thực thi từng phần Backend/Frontend ➜ Kiểm thử biên dịch.
```

### 8.3. Lần sau em/nhóm sẽ cải thiện prompt như thế nào?

```text
Cung cấp sẵn file cấu hình hoặc các quy tắc code chuẩn của nhóm để AI sinh mã nguồn bám sát nhất phong cách lập trình của nhóm.
```

---

## 9. Phân loại prompt đã sử dụng

Đánh dấu số lượng prompt theo từng nhóm.

| Loại prompt | Số lượng | Ví dụ prompt tiêu biểu |
|---|---:|---|
| Prompt phân tích yêu cầu | 1 | "bạn hãy giúp tôi phân tích dự án thật kĩ..." |
| Prompt giải thích kiến thức | 0 | N/A |
| Prompt thiết kế giải pháp | 2 | "bạn hãy thực hiện đề xuất một Kế hoạch..." |
| Prompt thiết kế database | 0 | N/A |
| Prompt sinh code mẫu | 3 | "bây giờ bạn hãy giúp tôi thực hiện triển khai..." |
| Prompt debug lỗi | 1 | Xử lý lỗi xóa Class1.cs |
| Prompt viết test case | 0 | N/A |
| Prompt review code | 0 | N/A |
| Prompt tối ưu code | 1 | Yêu cầu dọn dẹp file tự sinh và thêm `.gitkeep` |
| Prompt viết báo cáo | 1 | Yêu cầu cập nhật 4 file markdown học thuật |
| Prompt chuẩn bị thuyết trình | 0 | N/A |
| Prompt khác | 0 | N/A |

---

## 10. Checklist chất lượng prompt

Sinh viên/nhóm tự kiểm tra chất lượng prompt đã dùng.

| Tiêu chí | Đã đạt? | Ghi chú |
|---|:---:|---|
| Prompt có mục tiêu rõ ràng | [x] | Khởi tạo cấu trúc dự án |
| Prompt có đủ bối cảnh | [x] | .NET 8, React TS, SQL Server |
| Prompt có nêu công nghệ/ngôn ngữ sử dụng | [x] | C# và TypeScript |
| Prompt có nêu yêu cầu đầu ra | [x] | Solution biên dịch được |
| Prompt không yêu cầu AI làm toàn bộ bài một cách máy móc | [x] | Hỏi từng bước cấu trúc |
| Prompt có yêu cầu AI giải thích hoặc phân tích | [x] | Phân tích 4 file markdown trước |
| Kết quả AI được kiểm tra lại | [x] | Đã chạy thử lệnh build |
| Kết quả AI được chỉnh sửa trước khi sử dụng | [x] | Điều hướng cấu trúc phẳng |
| Prompt quan trọng được ghi lại đầy đủ | [x] | Đầy đủ trong log này |
| Prompt sai/chưa hiệu quả được rút kinh nghiệm | [x] | Đã phân tích mục 7 |

---

## 11. Cam kết sử dụng prompt minh bạch

Sinh viên/nhóm cam kết rằng:

- Các prompt quan trọng đã được ghi lại trung thực.
- Không che giấu việc sử dụng AI trong các phần quan trọng của bài.
- Không nộp nguyên văn kết quả AI nếu chưa kiểm tra và chỉnh sửa.
- Có khả năng giải thích các phần đã sử dụng từ AI.
- Chịu trách nhiệm với sản phẩm cuối cùng.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phan Hoài An | 28/05/2026 |
