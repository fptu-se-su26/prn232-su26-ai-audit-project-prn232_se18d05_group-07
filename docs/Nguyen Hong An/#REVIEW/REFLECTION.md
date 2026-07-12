# AI Learning Reflection

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
| Ngày hoàn thành reflection | 12/07/2026 |

---

## 2. Mục Đích Reflection

File này để sinh viên Nguyễn Hồng An tự đánh giá quá trình dùng AI khi thực hiện chức năng **Đánh giá phòng/chủ trọ** cho người thuê.

Reflection thể hiện:
- AI hỗ trợ gì trong quá trình học.
- Sinh viên kiểm chứng kết quả AI thế nào.
- Sinh viên tự chỉnh sửa, cải tiến ra sao.
- Sinh viên học được gì về môn học và về cách dùng AI có trách nhiệm.

---

## 3. Tóm tắt quá trình sử dụng AI

```text
Ở chức năng Đánh giá, em dùng Claude Code để rà soát repo tìm phần chưa code và hiện thực hóa một lát cắt full-stack
theo Clean Architecture: DTO, Repository, Service, Controller và đăng ký Dependency Injection ở backend; trang React
MyReviews cùng điều hướng ở frontend. Em định hướng phạm vi (chọn chức năng, mỗi chức năng một nhánh), quyết định
thiết kế (route theo chuẩn dự án, không cần migration vì bảng Reviews đã tồn tại, làm rõ nhãn cảm xúc là quy tắc chứ
không phải AI) và kiểm chứng bằng build backend + typecheck frontend.
```

---

## 4. Công cụ AI đã sử dụng

- [ ] ChatGPT
- [ ] Gemini
- [x] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [ ] Antigravity
- [ ] Microsoft Copilot

### Công cụ được sử dụng nhiều nhất

```text
Claude (Claude Code - Opus 4.8)
```

---

## 5. AI đã hỗ trợ em ở điểm nào?

- [x] Hiểu yêu cầu đề bài
- [x] Phân tích bài toán
- [x] Tìm ý tưởng giải pháp
- [ ] Thiết kế database
- [x] Thiết kế giao diện
- [x] Thiết kế kiến trúc hệ thống
- [x] Viết code mẫu
- [x] Debug lỗi
- [ ] Viết test case
- [x] Review code
- [x] Tối ưu code
- [ ] Kiểm tra bảo mật
- [x] Viết báo cáo

---

## 6. AI có giúp em học tốt hơn không?

### 6.1. Những điểm AI giúp em học tốt hơn

- Hiểu rõ hơn cách tổ chức một chức năng theo Clean Architecture: dữ liệu đi từ Controller → Service → Repository → DbContext.
- Biết cách lấy danh tính người dùng từ JWT claims (`ClaimTypes.NameIdentifier`) và phân quyền theo role `Tenant`.
- Biết cách nối một trang React mới vào hệ thống điều hướng và layout sẵn có.

### 6.2. Những điểm AI chưa giúp tốt hoặc gây khó khăn

- AI không tự biết trạng thái môi trường (thiếu .NET 10 SDK, DB đã có sẵn bảng) nên các lệnh build/migrate ban đầu bị lỗi; em phải kiểm tra và xử lý.
- Nhãn cảm xúc dễ bị hiểu nhầm là AI; em phải yêu cầu ghi rõ đây chỉ là quy tắc suy từ số sao.

### 6.3. Em có bị phụ thuộc vào AI không?

- [x] Không phụ thuộc

Giải thích:

```text
Em là người quyết định chọn chức năng, cách chia nhánh, route API, và kiểm tra lại toàn bộ trước khi push. AI chỉ
sinh nháp mã theo định hướng của em; em đọc hiểu và chịu trách nhiệm về kết quả cuối cùng.
```

---

## 7. Em đã kiểm tra kết quả AI như thế nào?

- Build backend (`dotnet build`) đảm bảo 0 lỗi và không phát sinh cảnh báo từ code Review.
- Chạy `tsc -b --noEmit` cho frontend, exit code 0.
- Kiểm tra danh sách file trước khi commit để loại `bin/obj/node_modules/package-lock.json`.

---

## 8. Ví dụ AI gợi ý sai hoặc chưa phù hợp

| Nội dung | Mô tả |
|---|---|
| AI đã gợi ý gì? | Chạy `dotnet ef database update` để tạo bảng |
| Vì sao gợi ý đó sai/chưa phù hợp? | Máy thiếu .NET 10 SDK và DB đã có sẵn bảng nên lệnh thất bại; chức năng Review cũng không cần migration |
| Em phát hiện bằng cách nào? | Đọc log lỗi build và kiểm tra `ApplicationDbContext` thấy DbSet `Reviews` đã tồn tại |
| Em đã sửa như thế nào? | Cài .NET 10 SDK, bỏ bước migration cho chức năng này |
| Bài học rút ra | Luôn kiểm tra môi trường và trạng thái DB trước khi chạy lệnh AI đề xuất |

---

## 9. Phần đóng góp thật sự của sinh viên

```text
- Chọn chức năng và phạm vi (mỗi chức năng một nhánh riêng).
- Quyết định thiết kế route, bỏ migration thừa, làm rõ giới hạn của nhãn cảm xúc.
- Kiểm chứng build/typecheck và giữ commit sạch, gọn.
- Tài liệu hóa toàn bộ quá trình trong 4 file audit.
```

---

## 10. So sánh trước và sau khi dùng AI

| Nội dung | Trước khi dùng AI | Sau khi dùng AI | Cải thiện đạt được |
|---|---|---|---|
| Hiểu yêu cầu | Chưa rõ phần nào còn thiếu | Nắm rõ chức năng thiếu theo vai trò | Chọn task chính xác |
| Phân tích bài toán | Chưa rõ cách dựng 1 lát cắt | Hiểu luồng Controller→Service→Repository | Tự tin hiện thực hóa |
| Code/Implementation | Sẽ mất nhiều giờ dò convention | Có khung code chạy được nhanh | Tiết kiệm thời gian |
| Báo cáo/Changelog | Soạn thủ công | Có nháp 4 file audit để tự sửa | Báo cáo bài bản |

---

## 11. Bài học về môn học

```text
- Hiểu rõ hơn về Clean Architecture và tách trách nhiệm giữa các tầng.
- Nắm cách bảo vệ endpoint bằng [Authorize(Roles=...)] và lấy userId từ token.
```

---

## 12. Bài học về sử dụng AI có trách nhiệm

```text
- Khai báo trung thực công cụ AI (Claude) và mức độ hỗ trợ.
- Không tô vẽ chức năng: nhãn cảm xúc là quy tắc, không phải AI.
- Tự kiểm chứng và chịu trách nhiệm với sản phẩm cuối.
```

---

## 13. Điều em sẽ không làm khi sử dụng AI

- [x] Không dùng AI để làm toàn bộ bài mà không hiểu nội dung.
- [x] Không nộp nguyên văn kết quả AI nếu chưa kiểm tra.
- [x] Không che giấu việc sử dụng AI trong các phần quan trọng.

---

## 14. Kế hoạch cải thiện lần sau

```text
Bổ sung test case cho chức năng Đánh giá và cân nhắc tích hợp AI sentiment thật (Gemini/Groq) để phân tích bình luận,
kèm khai báo audit tương ứng.
```

---

## 15. Tự đánh giá mức độ hoàn thành

| Tiêu chí | Điểm tự đánh giá 1-5 | Ghi chú |
|---|:---:|---|
| Ghi nhận việc dùng AI trung thực | 5 | Khai báo rõ Claude + giới hạn nhãn cảm xúc |
| Kiểm chứng kết quả AI | 4 | Build + typecheck; chưa có unit test |
| Tự chỉnh sửa/cải tiến | 4 | Chốt route, bỏ migration thừa, commit sạch |
| Hiểu nội dung đã nộp | 5 | Nắm luồng FE-BE của chức năng |

---

## 16. Cam kết Reflection

Sinh viên cam kết nội dung reflection phản ánh trung thực quá trình học và làm việc cùng AI.

| Sinh viên xác nhận | Ngày xác nhận |
|---|---|
| Nguyễn Hồng An | 12/07/2026 |
