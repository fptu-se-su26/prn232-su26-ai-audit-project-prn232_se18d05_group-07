# AI Learning Reflection

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
| Ngày hoàn thành reflection | 28/05/2026 |

---

## 2. Mục Định Reflection

File này dùng để sinh viên/nhóm tự đánh giá quá trình sử dụng AI trong học tập và thực hiện bài tập, lab, assignment hoặc project.

Reflection cần thể hiện:

- AI đã hỗ trợ gì trong quá trình học.
- Sinh viên/nhóm đã kiểm chứng kết quả AI như thế nào.
- Sinh viên/nhóm đã tự chỉnh sửa, cải tiến ra sao.
- Sinh viên/nhóm học được gì về môn học.
- Sinh viên/nhóm học được gì về cách sử dụng AI minh bạch và có trách nhiệm.

---

## 3. Tóm tắt quá trình sử dụng AI

Mô tả ngắn gọn quá trình sử dụng AI trong bài tập/project này.

```text
Trong Phase 01: Khởi tạo project, em đã đồng hành cùng AI Antigravity từ những bước đầu tiên. Bắt đầu bằng việc nhờ AI phân tích cấu trúc 4 file markdown học thuật mẫu để hiểu sâu sắc quy trình. Sau đó, phối hợp cùng AI thiết kế giải pháp cấu trúc dự án phẳng (Flat Root Structure) gồm RoomHub.Backend và RoomHub.Frontend đặt trực tiếp tại thư mục gốc của repo. Cuối cùng, sử dụng khả năng tự động hóa của AI để khởi tạo giải pháp .NET, các layers con, cài đặt NuGet/npm, dọn dẹp boilerplate và xây dựng hệ thống folder trống kèm file .gitkeep. Toàn bộ dự án đã được chạy kiểm chứng biên dịch thành công.
```

Gợi ý:

- Em/nhóm đã dùng AI ở giai đoạn nào? (Phase 01)
- Dùng AI để hỗ trợ việc gì? (Phân tích, Thiết kế kiến trúc, Khởi tạo dự án mẫu, Cài đặt dependencies)
- Công cụ AI nào được sử dụng nhiều nhất? (Antigravity)
- AI có giúp cải thiện chất lượng bài làm không? (Có, cấu trúc chuẩn chỉnh không lỗi liên kết)
- Có phần nào AI gợi ý nhưng em/nhóm không sử dụng không? (Có, cấu trúc folder trung gian src)

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
Antigravity là một trợ lý AI mạnh mẽ được tích hợp trực tiếp vào môi trường lập trình của IDE, có khả năng phân tích trực tiếp mã nguồn trong workspace, tự động đề xuất kế hoạch triển khai và thực thi các câu lệnh CLI phức tạp một cách chính xác mà không gặp lỗi rào cản môi trường.
```

---

## 5. AI đã hỗ trợ em/nhóm ở điểm nào?

Đánh dấu các nội dung phù hợp.

- [x] Hiểu yêu cầu đề bài
- [x] Phân tích bài toán
- [x] Tìm ý tưởng giải pháp
- [ ] Thiết kế database
- [ ] Thiết kế giao diện
- [x] Thiết kế kiến trúc hệ thống
- [x] Viết code mẫu
- [x] Debug lỗi
- [ ] Viết test case
- [ ] Review code
- [x] Tối ưu code
- [ ] Kiểm tra bảo mật
- [x] Viết báo cáo
- [ ] Chuẩn bị thuyết trình
- [x] Tìm hiểu công nghệ mới
- [ ] Khác: ....................................

### Mô tả chi tiết

```text
AI giúp giải nghĩa quy trình báo cáo tiến độ bằng file markdown, phác thảo sơ đồ dependencies giữa các layers Clean Architecture (Domain -> Application -> Infrastructure -> API), tự động hóa toàn bộ CLI để build khung xương backend & frontend và thiết lập tệp .gitkeep để hỗ trợ làm việc nhóm qua Git.
```

---

## 6. AI có giúp em/nhóm học tốt hơn không?

### 6.1. Những điểm AI giúp em/nhóm học tốt hơn

```text
- Giúp tiếp cận và hiểu nhanh mô hình Clean Architecture trong C# thực tế thay vì chỉ học lý thuyết suông.
- Biết cách tổ chức các thư mục con (Entities, Enums, Behaviors, Repositories, Middlewares) một cách chuyên nghiệp.
- Học được cách tích hợp các package hữu ích (MediatR, Mapster, FluentValidation) vào tầng Application.
```

### 6.2. Những điểm AI chưa giúp tốt hoặc gây khó khăn

```text
- AI đôi khi đề xuất các giải pháp theo khuôn mẫu mặc định (như tạo thêm thư mục trung gian src chứa cả backend/frontend), buộc sinh viên phải tự tư duy điều hướng và bắt AI điều chỉnh lại thiết kế để tối ưu theo thực tế nhóm.
- Đôi khi chạy các lệnh kết hợp phức tạp trong PowerShell dễ bị cảnh báo hoặc lỗi exit code nhỏ nếu không được phân tách rõ ràng.
```

### 6.3. Em/nhóm có bị phụ thuộc vào AI không?

- [x] Không phụ thuộc
- [ ] Phụ thuộc ít
- [ ] Phụ thuộc trung bình
- [ ] Phụ thuộc nhiều

Giải thích:

```text
Em hoàn toàn làm chủ thiết kế. Em đã chủ động từ chối cấu trúc thư mục src lồng nhau do AI đề xuất ban đầu và yêu cầu thiết kế lại cấu trúc phẳng. Đồng thời, em tự kiểm duyệt từng folder con, kiểm tra tính đúng đắn của từng tham chiếu dự án (.csproj) và chạy thử nghiệm lệnh biên dịch để đảm bảo chất lượng thật sự của sản phẩm.
```

---

## 7. Em/nhóm đã kiểm tra kết quả AI như thế nào?

Đánh dấu các cách đã sử dụng.

- [x] Chạy thử chương trình
- [x] Kiểm tra output
- [ ] Viết test case
- [x] So sánh với yêu cầu đề bài
- [x] Đối chiếu với tài liệu môn học
- [x] Review code
- [ ] Hỏi lại giảng viên
- [x] Tra cứu tài liệu chính thống
- [x] Thảo luận với thành viên nhóm
- [x] Kiểm tra bằng dữ liệu mẫu
- [x] So sánh trước và sau khi dùng AI
- [ ] Khác: ....................................

### Mô tả quá trình kiểm chứng

```text
Em đã chạy trực tiếp các lệnh biên dịch hệ thống trên terminal (dotnet build đối với RoomHub.Backend và npm run build đối với RoomHub.Frontend). Kết quả cả hai phần đều build thành công hoàn hảo không phát sinh lỗi cú pháp hay cảnh báo nào.
```

### Ví dụ cụ thể về một lần kiểm chứng

| Nội dung | Mô tả |
|---|---|
| AI đã gợi ý gì? | Gợi ý cấu trúc giải pháp Clean Architecture chứa các Class Library và API với các liên kết tham chiếu chéo |
| Em/nhóm đã kiểm tra bằng cách nào? | Chạy lệnh `dotnet build` tại thư mục giải pháp và kiểm tra trực quan các thẻ `<ProjectReference>` bên trong từng file `.csproj` |
| Kết quả kiểm tra | Đúng / Sai / Cần chỉnh sửa |
| Em/nhóm đã xử lý tiếp như thế nào? | Cấu hình thêm tệp tin `.gitkeep` vào các folder trống vừa được tạo ra để phục vụ việc chia nhánh đẩy lên Git của nhóm không bị thiếu thư mục. |

---

## 8. Ví dụ AI gợi ý sai hoặc chưa phù hợp

Ghi lại ít nhất một ví dụ nếu có.

| Nội dung | Mô tả |
|---|---|
| AI đã gợi ý gì? | Thiết lập thư mục chứa code là `src/RoomHub.Backend` và `src/RoomHub.Frontend`. |
| Vì sao gợi ý đó sai/chưa phù hợp? | Vì cấu trúc này lồng quá sâu, gây phức tạp khi các thành viên nhóm làm việc độc lập với frontend/backend và viết các script CI/CD/Docker sau này. |
| Em/nhóm phát hiện bằng cách nào? | Đọc kỹ đề xuất trong file [implementation_plan.md] trước khi cho phép AI thực thi. |
| Em/nhóm đã sửa như thế nào? | Từ chối bản thiết kế đó, yêu cầu AI đổi thành cấu trúc phẳng trực tiếp tại root của repository và cập nhật lại bản kế hoạch. |
| Bài học rút ra | Luôn kiểm duyệt kỹ tài liệu thiết kế và kế hoạch của AI trước khi bắt đầu viết code hoặc khởi tạo tài liệu dự án chính thức. |

---

## 9. Phần đóng góp thật sự của sinh viên/nhóm

Mô tả rõ phần nào là đóng góp chính của sinh viên/nhóm, không phải chỉ copy từ AI.

```text
- Nghiên cứu yêu cầu môn học PRN232 để định hình sơ đồ lớp phù hợp.
- Quyết định và định hướng cấu trúc phẳng của repository.
- Thiết kế hệ thống thư mục con phục vụ phát triển nghiệp vụ (Entities, Repositories, Controllers...).
- Kiểm duyệt và xác thực tính biên dịch thành công của hệ thống.
- Thực hiện viết báo cáo tài liệu hóa học thuật chuẩn chỉnh.
```

---

## 10. So sánh trước và sau khi dùng AI

| Nội dung | Trước khi dùng AI | Sau khi dùng AI | Cải thiện đạt được |
|---|---|---|---|
| Hiểu yêu cầu | Biết yêu cầu đề bài chung chung | Nắm rõ ý nghĩa quy trình tài liệu hóa | Tự tin cập nhật các file markdown học thuật |
| Phân tích bài toán | Mơ hồ về cách triển khai | Hình dung rõ sơ đồ Clean Architecture | Định hình rõ ràng lộ trình phát triển |
| Thiết kế giải pháp | Khó thiết kế cấu trúc thư mục tối ưu | Có cấu trúc dự án phẳng ngăn nắp | Tiết kiệm thời gian, dễ phân chia việc cho nhóm |
| Code/Implementation | Mất thời gian gõ CLI khởi tạo | Khung dự án được tạo tự động trơn tru | Tiết kiệm hàng giờ thiết lập thủ công |
| Debug/Testing | Dễ gặp lỗi liên kết tham chiếu chéo | Dự án build thành công 0 lỗi từ đầu | Yên tâm phát triển tiếp nghiệp vụ |
| Báo cáo/Thuyết trình | Tự soạn tài liệu tốn thời gian | Có các file markdown cập nhật chi tiết | Báo cáo chuyên nghiệp, khoa học |
| Làm việc nhóm | Dễ bị thiếu thư mục khi đẩy code | Có `.gitkeep` đồng bộ cấu trúc tốt | Tránh conflict và thiếu file trên Git |

---

## 11. Bài học về môn học

Sau bài tập/project này, em/nhóm học được gì về kiến thức môn học?

```text
- Hiểu rõ thế nào là Clean Architecture (Domain làm nhân, Application chứa usecases, Infrastructure xử lý kết nối ngoài và API làm Presentation).
- Biết cách quản lý liên kết thư viện chéo và cài đặt các package C# thiết yếu.
- Biết cách thiết lập dự án React TypeScript kết hợp chuẩn với Backend .NET.
```

---

## 12. Bài học về sử dụng AI có trách nhiệm

Sau bài tập/project này, em/nhóm học được gì về việc sử dụng AI một cách minh bạch, có trách nhiệm?

```text
- Không sao chép máy móc kết quả AI.
- Phải luôn đóng vai trò là kiến trúc sư trưởng kiểm duyệt kết quả của trợ lý AI.
- Minh bạch hóa quá trình sử dụng AI bằng cách ghi nhận chi tiết prompt và nhận xét phản tỉnh.
- Chịu trách nhiệm hoàn toàn đối với tính đúng đắn và khả năng giải trình sản phẩm của mình trước giảng viên.
```

---

## 13. Điều em/nhóm sẽ không làm khi sử dụng AI

Đánh dấu các cam kết phù hợp.

- [x] Không dùng AI để làm toàn bộ bài mà không hiểu nội dung.
- [x] Không nộp nguyên văn kết quả AI nếu chưa kiểm tra.
- [x] Không che giấu việc sử dụng AI trong các phần quan trọng.
- [x] Không dùng AI để tạo nội dung sai lệch hoặc gian lận.
- [x] Không dùng AI thay thế hoàn toàn quá trình học.
- [x] Không bỏ qua yêu cầu, rubric hoặc hướng dẫn của giảng viên.

---

## 14. Kế hoạch cải thiện lần sau

Lần sau em/nhóm sẽ sử dụng AI tốt hơn bằng cách nào?

```text
- Chuẩn bị trước các rules, coding convention chuẩn của nhóm để huấn luyện AI bám sát phong cách lập trình hơn.
- Chia nhỏ các yêu cầu nghiệp vụ phức tạp thành các bài toán nhỏ để AI xử lý tối ưu nhất.
- Thực hiện ghi log prompt thường xuyên và liên kết chặt chẽ với từng mã commit trên Git.
```

---

## 15. Tự đánh giá mức độ hoàn thành

Sinh viên/nhóm tự đánh giá theo thang 1-5.

| Tiêu chí | Điểm tự đánh giá 1-5 | Ghi chú |
|---|:---:|---|
| Ghi nhận việc dùng AI trung thực | 5 | Ghi chép cực kỳ chi tiết |
| Prompt có mục tiêu rõ ràng | 5 | Rõ mục đích khởi tạo |
| Kiểm chứng kết quả AI | 5 | Đã build thành công 100% |
| Tự chỉnh sửa/cải tiến | 5 | Điều hướng cấu trúc phẳng thành công |
| Hiểu nội dung đã nộp | 5 | Nắm rõ 100% từng layer và thư mục con |
| Reflection có chiều sâu | 5 | Phản tỉnh rõ ràng về tự chủ công nghệ |
| Sử dụng AI có trách nhiệm | 5 | Nghiêm túc, minh bạch và có cam kết |

---

## 16. Câu hỏi tự vấn cuối bài

### 16.1. Nếu giảng viên hỏi về phần AI đã hỗ trợ, em/nhóm có giải thích lại được không?

```text
Chắc chắn giải thích được rõ ràng. AI chỉ đóng vai trò trợ lý tự động hóa việc gõ lệnh CLI và tạo folder, em nắm rõ 100% kiến trúc và ý nghĩa của từng layer (Domain, Application, Infrastructure, API) cũng như liên kết references giữa chúng.
```

### 16.2. Nếu không có AI, em/nhóm có thể tự làm lại phần quan trọng nhất không?

```text
Hoàn toàn có thể. Việc tạo solution, add project và add reference có thể thực hiện thủ công trên Visual Studio hoặc gõ lệnh CLI, chỉ là tốn nhiều thời gian hơn so với dùng AI hỗ trợ.
```

### 16.3. Phần nào trong bài thể hiện rõ nhất năng lực thật sự của em/nhóm?

```text
Phần tư duy thiết kế cấu trúc phẳng (Flat Root Structure) để tối ưu hóa khả năng làm việc nhóm độc lập và quản lý Git, cũng như việc thiết kế toàn bộ hệ thống thư mục con nghiệp vụ.
```

### 16.4. Em/nhóm muốn cải thiện kỹ năng nào sau bài này?

```text
Kỹ năng thiết kế Database chuẩn hóa và kỹ năng viết Clean Code theo đúng triết lý SOLID trong C#.
```

---

## 17. Cam kết Reflection

Em/nhóm cam kết rằng nội dung reflection này phản ánh trung thực quá trình sử dụng AI và quá trình học tập trong bài tập/project.

Sinh viên/nhóm hiểu rằng:

- AI là công cụ hỗ trợ học tập, không thay thế hoàn toàn năng lực cá nhân.
- Mọi kết quả AI gợi ý cần được kiểm tra trước khi sử dụng.
- Sinh viên/nhóm chịu trách nhiệm với sản phẩm cuối cùng.
- Sinh viên/nhóm cần giải thích được các phần đã nộp.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phan Hoài An | 28/05/2026 |
