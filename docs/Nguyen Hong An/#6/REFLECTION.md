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

Tự đánh giá quá trình dùng AI khi thực hiện **Chức năng Dịch vụ (Service Requests)** cho 3 vai trò.

---

## 3. Tóm tắt quá trình sử dụng AI

```text
Em dùng Claude Code để chọn và dựng một chức năng lớn còn thiếu: Dịch vụ. Chức năng trải 3 vai trò — Admin quản lý
danh mục, Người thuê gửi yêu cầu, Chủ trọ xử lý. AI sinh backend (DTO/Repository/Service/Controller/DI cho 3 vai trò)
và frontend (3 trang + gắn menu/điều hướng cho 3 khu vực), liên kết yêu cầu với hợp đồng đang hiệu lực. Em quyết định
mô hình phân quyền theo hợp đồng, vòng đời trạng thái, điều kiện hủy, và kiểm chứng end-to-end bằng chạy thử API với
cả 3 tài khoản trước khi push.
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
- [x] Kiểm tra bảo mật
- [x] Viết báo cáo

---

## 6. AI có giúp em học tốt hơn không?

### 6.1. Những điểm AI giúp em học tốt hơn

- Hiểu cách tổ chức một chức năng lớn nhiều vai trò và phân quyền theo dữ liệu (hợp đồng).
- Biết cách nối cùng một chức năng vào 3 khu vực giao diện (tenant/owner/admin).

### 6.2. Những điểm AI chưa giúp tốt hoặc gây khó khăn

- Cần tự siết lại phân quyền (chủ trọ chỉ xử lý yêu cầu của khách thuê mình) và vòng đời trạng thái.

### 6.3. Em có bị phụ thuộc vào AI không?

- [x] Không phụ thuộc

Giải thích:

```text
Em quyết định mô hình phân quyền, vòng đời trạng thái, điều kiện hủy và tự kiểm chứng bằng chạy thử API 3 vai trò.
```

---

## 7. Em đã kiểm tra kết quả AI như thế nào?

- Build backend (0 lỗi), typecheck frontend (exit 0).
- Chạy bản build tạm trên cổng 5299: Admin tạo dịch vụ → Người thuê gửi yêu cầu (tự gắn hợp đồng/phòng) → Chủ trọ xem và cập nhật "Approved". Kiểm tra dữ liệu trả về đúng cho từng vai trò.

---

## 8. Ví dụ AI gợi ý sai hoặc chưa phù hợp

| Nội dung | Mô tả |
|---|---|
| AI đã gợi ý gì? | Cho phép cập nhật trạng thái yêu cầu chung chung |
| Vì sao gợi ý đó sai/chưa phù hợp? | Cần đảm bảo chủ trọ chỉ xử lý được yêu cầu thuộc hợp đồng của mình |
| Em phát hiện bằng cách nào? | Rà soát nghiệp vụ phân quyền |
| Em đã sửa như thế nào? | Lọc theo OwnerId của hợp đồng và kiểm tra quyền trước khi cập nhật |
| Bài học rút ra | Luôn ràng buộc phân quyền theo dữ liệu sở hữu |

---

## 9. Phần đóng góp thật sự của sinh viên

```text
- Chọn chức năng chính (nhiều vai trò) để làm.
- Thiết kế phân quyền theo hợp đồng, vòng đời trạng thái, điều kiện hủy.
- Kiểm chứng end-to-end 3 vai trò và giữ commit sạch.
- Tài liệu hóa trong 4 file audit.
```

---

## 10. So sánh trước và sau khi dùng AI

| Nội dung | Trước khi dùng AI | Sau khi dùng AI | Cải thiện đạt được |
|---|---|---|---|
| Quy mô | Khó dựng chức năng 3 vai trò | Dựng nhanh, đồng bộ | Tiết kiệm thời gian lớn |
| Phân quyền | Dễ bỏ sót ràng buộc | Ràng buộc theo hợp đồng | An toàn nghiệp vụ |
| Kiểm thử | Khó test đủ vai trò | Test API 3 tài khoản | Tin tưởng tính đúng |

---

## 11. Bài học về môn học

```text
- Hiểu cách phân quyền theo dữ liệu sở hữu (owner/tenant qua hợp đồng).
- Nắm cách tổ chức API và giao diện cho một chức năng trải nhiều vai trò.
```

---

## 12. Bài học về sử dụng AI có trách nhiệm

```text
- Khai báo trung thực công cụ AI và mức độ hỗ trợ.
- Tự kiểm chứng phân quyền và chạy thật trước khi đưa lên Git.
```

---

## 13. Điều em sẽ không làm khi sử dụng AI

- [x] Không dùng AI để làm toàn bộ bài mà không hiểu nội dung.
- [x] Không nộp nguyên văn kết quả AI nếu chưa kiểm tra.
- [x] Không che giấu việc sử dụng AI trong các phần quan trọng.

---

## 14. Kế hoạch cải thiện lần sau

```text
Bổ sung thông báo cho chủ trọ/người thuê khi trạng thái yêu cầu thay đổi, và cho phép người thuê đánh giá dịch vụ.
```

---

## 15. Tự đánh giá mức độ hoàn thành

| Tiêu chí | Điểm tự đánh giá 1-5 | Ghi chú |
|---|:---:|---|
| Ghi nhận việc dùng AI trung thực | 5 | Khai báo rõ Claude |
| Kiểm chứng kết quả AI | 5 | Chạy thử API 3 vai trò |
| Tự chỉnh sửa/cải tiến | 4 | Siết phân quyền, vòng đời trạng thái |
| Hiểu nội dung đã nộp | 5 | Nắm luồng FE-BE 3 vai trò |

---

## 16. Cam kết Reflection

Sinh viên cam kết nội dung reflection phản ánh trung thực quá trình học và làm việc cùng AI.

| Sinh viên xác nhận | Ngày xác nhận |
|---|---|
| Nguyễn Hồng An | 25/07/2026 |
