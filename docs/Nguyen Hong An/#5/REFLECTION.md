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
| Ngày hoàn thành reflection | 25/07/2026 |

---

## 2. Mục Đích Reflection

Tự đánh giá quá trình dùng AI khi thực hiện chức năng **Yêu cầu bảo trì** cho người thuê.

---

## 3. Tóm tắt quá trình sử dụng AI

```text
Em dùng Claude Code để rà soát main mới, xác định Yêu cầu bảo trì là tính năng người thuê còn thiếu (mock + chưa có
controller), rồi dựng lát cắt backend (DTO/Repository/Service/Controller/DI) tái dùng IContractService để lấy phòng
đang thuê, và nối trang Maintenance vào API. Em quyết định bỏ nhãn AI sentiment cho trung thực, cho phép hủy khi yêu
cầu còn Open, và kiểm chứng bằng chạy thử API thật trước khi push.
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

- Biết cách tái sử dụng dịch vụ có sẵn (IContractService) để lấy dữ liệu người dùng thay vì viết lại.
- Hiểu cách nối một trang mock có sẵn vào API mà giữ nguyên giao diện.

### 6.2. Những điểm AI chưa giúp tốt hoặc gây khó khăn

- AI không lường được môi trường (SQL chậm, encoding curl) nên phần chạy thử cần điều chỉnh.

### 6.3. Em có bị phụ thuộc vào AI không?

- [x] Không phụ thuộc

Giải thích:

```text
Em quyết định phạm vi, cách lấy phòng, điều kiện hủy, bỏ nhãn AI sentiment và tự kiểm chứng bằng chạy thử API.
```

---

## 7. Em đã kiểm tra kết quả AI như thế nào?

- Build backend (0 lỗi), typecheck frontend đạt.
- Chạy bản build tạm trên cổng 5299: đăng nhập tenant1, tạo yêu cầu (tự gắn đúng phòng), lấy danh sách, hủy khi Open — đều đúng, dữ liệu test đã dọn.

---

## 8. Ví dụ AI gợi ý sai hoặc chưa phù hợp

| Nội dung | Mô tả |
|---|---|
| AI đã gợi ý gì? | Giữ nhãn "AI phân tích cảm xúc" từ bản mock |
| Vì sao gợi ý đó sai/chưa phù hợp? | Backend không tính sentiment nên nhãn đó gây hiểu nhầm |
| Em phát hiện bằng cách nào? | Đọc kỹ trang mock và đối chiếu backend |
| Em đã sửa như thế nào? | Bỏ nhãn AI sentiment, chỉ giữ trạng thái xử lý |
| Bài học rút ra | Chỉ hiển thị đúng thông tin hệ thống thật sự có |

---

## 9. Phần đóng góp thật sự của sinh viên

```text
- Chọn đúng tính năng còn thiếu để làm.
- Quyết định lấy phòng qua IContractService, điều kiện hủy, và bỏ nhãn AI sentiment.
- Kiểm chứng chạy thật và giữ commit sạch.
- Tài liệu hóa trong 4 file audit.
```

---

## 10. So sánh trước và sau khi dùng AI

| Nội dung | Trước khi dùng AI | Sau khi dùng AI | Cải thiện đạt được |
|---|---|---|---|
| Rà soát | Khó biết phần nào còn mock | Nhanh chóng phân loại | Chọn đúng việc |
| Implementation | Phải dựng lại lát cắt | Tái dùng mẫu, làm nhanh | Tiết kiệm thời gian |
| Kiểm thử | Khó dựng test nhanh | Chạy API tạm + curl | Tin tưởng tính đúng |

---

## 11. Bài học về môn học

```text
- Hiểu cách thiết kế API theo người dùng và tái dùng service tầng Application.
- Nắm cách quản lý trạng thái vòng đời (Open/InProgress/Resolved).
```

---

## 12. Bài học về sử dụng AI có trách nhiệm

```text
- Khai báo trung thực công cụ AI và mức độ hỗ trợ.
- Không hiển thị tính năng mà hệ thống chưa thật sự có (AI sentiment).
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
Bổ sung đính kèm ảnh cho yêu cầu bảo trì và phần xử lý phía chủ trọ (chuyển trạng thái, phân công).
```

---

## 15. Tự đánh giá mức độ hoàn thành

| Tiêu chí | Điểm tự đánh giá 1-5 | Ghi chú |
|---|:---:|---|
| Ghi nhận việc dùng AI trung thực | 5 | Khai báo rõ Claude, bỏ nhãn AI giả |
| Kiểm chứng kết quả AI | 5 | Chạy thử API thật |
| Tự chỉnh sửa/cải tiến | 4 | Lấy phòng qua service, điều kiện hủy |
| Hiểu nội dung đã nộp | 5 | Nắm luồng FE-BE |

---

## 16. Cam kết Reflection

Sinh viên cam kết nội dung reflection phản ánh trung thực quá trình học và làm việc cùng AI.

| Sinh viên xác nhận | Ngày xác nhận |
|---|---|
| Nguyễn Hồng An | 25/07/2026 |
