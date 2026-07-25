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

Tự đánh giá quá trình dùng AI khi thực hiện chức năng **Lịch sử xem phòng** cho người thuê.

---

## 3. Tóm tắt quá trình sử dụng AI

```text
Em dùng Claude Code để cập nhật main mới, đối chiếu và chọn phần người thuê còn thiếu (lịch sử xem phòng) sao cho
không trùng với phần "đặt lịch xem phòng" đã có. AI thêm TenantId vào BookingHistory kèm migration, dựng lát cắt
DTO/Repository/Service/Controller/DI và trang React, hook auto-log ở trang chi tiết phòng. Em quyết định cơ chế chống
trùng, điều kiện ghi log, và kiểm chứng bằng chạy thử API thật trước khi push.
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
- [x] Thiết kế database
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

- Hiểu quy trình thêm cột vào entity cũ và tạo migration đúng chuẩn khi dự án đã có nhiều migration.
- Biết cách hook một hành vi (ghi log) vào trang chi tiết phòng có điều kiện theo vai trò.

### 6.2. Những điểm AI chưa giúp tốt hoặc gây khó khăn

- AI không lường trước được SQL Server trên máy phản hồi chậm; phải tăng timeout và dùng SQL auth để chạy thử.

### 6.3. Em có bị phụ thuộc vào AI không?

- [x] Không phụ thuộc

Giải thích:

```text
Em quyết định phạm vi (tránh trùng), cơ chế chống trùng, điều kiện auto-log và tự kiểm chứng bằng chạy thử API.
```

---

## 7. Em đã kiểm tra kết quả AI như thế nào?

- Build backend (0 lỗi) và áp dụng migration thành công.
- Chạy bản build tạm trên cổng 5299: đăng nhập tenant1, POST ghi xem phòng, POST lại cùng phòng (chỉ cập nhật, không trùng), GET đúng 1 mục, DELETE toàn bộ đúng.

---

## 8. Ví dụ AI gợi ý sai hoặc chưa phù hợp

| Nội dung | Mô tả |
|---|---|
| AI đã gợi ý gì? | Auto-log khi mở chi tiết phòng nhưng chưa giới hạn điều kiện |
| Vì sao gợi ý đó sai/chưa phù hợp? | Có thể ghi cả phòng mock hoặc khi chưa đăng nhập, và tạo nhiều dòng trùng |
| Em phát hiện bằng cách nào? | Rà soát RoomDetail và nghĩ về trải nghiệm |
| Em đã sửa như thế nào? | Chỉ ghi khi vai trò Tenant, bỏ qua phòng mock, và chống trùng ở service |
| Bài học rút ra | Xác định rõ điều kiện trước khi tự động ghi dữ liệu |

---

## 9. Phần đóng góp thật sự của sinh viên

```text
- Chọn phần việc không trùng với các thành viên khác.
- Quyết định thiết kế dữ liệu (TenantId), cơ chế chống trùng, điều kiện auto-log.
- Kiểm chứng chạy thật và giữ commit sạch.
- Tài liệu hóa trong 4 file audit.
```

---

## 10. So sánh trước và sau khi dùng AI

| Nội dung | Trước khi dùng AI | Sau khi dùng AI | Cải thiện đạt được |
|---|---|---|---|
| Rà soát phần thiếu | Khó biết phần nào đã có | Nhanh chóng đối chiếu main | Chọn đúng việc |
| Migration | Dễ sai khi nhiều migration | Tạo migration gọn, đúng | Yên tâm về schema |
| Kiểm thử | Khó dựng test nhanh | Chạy API tạm + curl | Tin tưởng tính đúng |

---

## 11. Bài học về môn học

```text
- Hiểu cách mở rộng schema an toàn qua migration.
- Nắm cách bảo vệ endpoint theo role và tổ chức dữ liệu lịch sử theo người dùng.
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
Thêm giới hạn số lượng lịch sử lưu và hiển thị thêm thông tin phòng (ảnh, khu vực) trong danh sách đã xem.
```

---

## 15. Tự đánh giá mức độ hoàn thành

| Tiêu chí | Điểm tự đánh giá 1-5 | Ghi chú |
|---|:---:|---|
| Ghi nhận việc dùng AI trung thực | 5 | Khai báo rõ Claude |
| Kiểm chứng kết quả AI | 5 | Chạy thử API thật |
| Tự chỉnh sửa/cải tiến | 4 | Chống trùng, điều kiện auto-log |
| Hiểu nội dung đã nộp | 5 | Nắm luồng FE-BE + migration |

---

## 16. Cam kết Reflection

Sinh viên cam kết nội dung reflection phản ánh trung thực quá trình học và làm việc cùng AI.

| Sinh viên xác nhận | Ngày xác nhận |
|---|---|
| Nguyễn Hồng An | 25/07/2026 |
