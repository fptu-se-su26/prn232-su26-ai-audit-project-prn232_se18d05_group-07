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

Tự đánh giá quá trình dùng AI khi thực hiện chức năng **Lịch sử tìm kiếm** cho người thuê.

---

## 3. Tóm tắt quá trình sử dụng AI

```text
Em dùng Claude Code để dựng chức năng Lịch sử tìm kiếm theo đúng mẫu chức năng Đánh giá đã làm trước: DTO,
Repository, Service, Controller và DI ở backend; trang SearchHistory cùng điều hướng ở frontend; đồng thời hook ghi
log vào hàm submit tìm kiếm của trang Browse (chỉ khi đã đăng nhập). Em quyết định các điểm quan trọng (chỉ ghi khi
người dùng bấm tìm để tránh spam, nuốt lỗi để không ảnh hưởng khách), và kiểm chứng bằng cách chạy thử API thật
trên một cổng phụ trước khi push.
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

- Hiểu cách tái sử dụng một mẫu kiến trúc đã có để làm nhanh chức năng mới.
- Biết cách hook một hành vi (ghi log) vào trang dùng chung mà vẫn an toàn với người chưa đăng nhập.

### 6.2. Những điểm AI chưa giúp tốt hoặc gây khó khăn

- AI mặc định có thể ghi log ở mọi tình huống; em phải giới hạn chỉ khi đã đăng nhập và chỉ khi bấm tìm.

### 6.3. Em có bị phụ thuộc vào AI không?

- [x] Không phụ thuộc

Giải thích:

```text
Em quyết định thiết kế, điểm hook, cách chống spam và tự kiểm chứng bằng chạy thử API thật trước khi push.
```

---

## 7. Em đã kiểm tra kết quả AI như thế nào?

- Build backend (0 lỗi) và typecheck frontend (exit 0).
- Chạy bản build tạm trên cổng 5299, đăng nhập tenant1 và test lần lượt POST, GET, DELETE — kết quả đúng, dữ liệu test đã dọn sạch.

---

## 8. Ví dụ AI gợi ý sai hoặc chưa phù hợp

| Nội dung | Mô tả |
|---|---|
| AI đã gợi ý gì? | Ghi log tìm kiếm mà chưa giới hạn điều kiện |
| Vì sao gợi ý đó sai/chưa phù hợp? | Có thể ghi cả khi chưa đăng nhập hoặc spam khi đổi bộ lọc |
| Em phát hiện bằng cách nào? | Rà soát luồng Browse và yêu cầu chức năng |
| Em đã sửa như thế nào? | Chỉ ghi khi có token và khi người dùng bấm submit tìm kiếm |
| Bài học rút ra | Luôn xác định rõ điều kiện kích hoạt trước khi ghi dữ liệu |

---

## 9. Phần đóng góp thật sự của sinh viên

```text
- Chốt đối tượng (người thuê) và vị trí chức năng.
- Quyết định điểm hook ghi log và cách chống spam/an toàn với khách.
- Kiểm chứng chạy thật và giữ commit sạch.
- Tài liệu hóa trong 4 file audit.
```

---

## 10. So sánh trước và sau khi dùng AI

| Nội dung | Trước khi dùng AI | Sau khi dùng AI | Cải thiện đạt được |
|---|---|---|---|
| Implementation | Phải dựng lại lát cắt từ đầu | Tái dùng mẫu, làm nhanh | Tiết kiệm thời gian |
| Kiểm thử | Khó dựng môi trường test nhanh | Chạy API tạm + curl để test | Tự tin về tính đúng |

---

## 11. Bài học về môn học

```text
- Hiểu cách thiết kế API lịch sử theo người dùng và bảo vệ bằng role.
- Biết cách tổ chức dữ liệu lọc dưới dạng JSON để hiển thị lại.
```

---

## 12. Bài học về sử dụng AI có trách nhiệm

```text
- Khai báo trung thực công cụ AI và mức độ hỗ trợ.
- Tự kiểm chứng chạy thật trước khi đưa lên Git.
```

---

## 13. Điều em sẽ không làm khi sử dụng AI

- [x] Không dùng AI để làm toàn bộ bài mà không hiểu nội dung.
- [x] Không nộp nguyên văn kết quả AI nếu chưa kiểm tra.
- [x] Không che giấu việc sử dụng AI trong các phần quan trọng.

---

## 14. Kế hoạch cải thiện lần sau

```text
Thêm giới hạn số lượng lịch sử lưu trữ và cho phép "tìm lại" khôi phục đúng bộ lọc cũ trên trang Browse.
```

---

## 15. Tự đánh giá mức độ hoàn thành

| Tiêu chí | Điểm tự đánh giá 1-5 | Ghi chú |
|---|:---:|---|
| Ghi nhận việc dùng AI trung thực | 5 | Khai báo rõ Claude |
| Kiểm chứng kết quả AI | 5 | Chạy thử API thật |
| Tự chỉnh sửa/cải tiến | 4 | Chống spam, an toàn với khách |
| Hiểu nội dung đã nộp | 5 | Nắm luồng FE-BE |

---

## 16. Cam kết Reflection

Sinh viên cam kết nội dung reflection phản ánh trung thực quá trình học và làm việc cùng AI.

| Sinh viên xác nhận | Ngày xác nhận |
|---|---|
| Nguyễn Hồng An | 12/07/2026 |
