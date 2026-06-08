# AI Learning Reflection

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| MSSV | DE180794 |
| Sinh viên | Đỗ Thanh Tín |
| Issue | #21 |
| Ngày hoàn thành | 06/06/2026 |

---

## 2. Tóm tắt quá trình sử dụng AI

```text
Trong task kiểm duyệt tin đăng (rental post), em sử dụng Cursor AI xuyên suốt từ khảo sát codebase,
debug moderation không chạy, thiết kế pipeline 3 giai đoạn, đến triển khai API và UI. AI giúp em
nhanh chóng có khung code Clean Architecture đúng convention nhóm, nhưng em luôn tự chạy dotnet run,
test đăng tin, kiểm tra HTTP 500 và migration DB. Khi AI gợi ý Groq Vision model gây BadRequest,
em cùng AI thử model khác và xác nhận bằng log thực tế. Em học được cách tách commit theo chức năng
và ghi audit trung thực thay vì ghi Co-Authored-By trong git.
```

---

## 3. AI hỗ trợ tốt ở đâu?

- **Thiết kế pipeline moderation** phức tạp (rules + heuristic + 2 AI provider).
- **Debug nhanh** lỗi DI, migration thiếu cột, port 5143 bị lock.
- **Mirror validation** client/server để UX báo lỗi ngay bước 2.
- **Soạn nháp audit docs** theo template nhóm.

---

## 4. Em tự làm / kiểm chứng gì?

- Test tài khoản admin/owner/tenant trên local.
- Chạy `dotnet ef database update` và xác nhận cột `HiddenByOwner`.
- Điều chỉnh ngưỡng giá 500.000đ theo yêu cầu nghiệp vụ.
- Review từng file trước commit, loại `.vs/` và secret khỏi git.
- Đọc SKILL.md và tách commit đúng convention `[DE180794]`.

---

## 5. Bài học về sử dụng AI minh bạch

- Khai báo AI qua **file audit**, không qua `Co-Authored-By` — git history sạch hơn.
- Chỉ ghi trong audit những gì **thực sự đã làm**, không bịa prompt hay kết quả.
- AI soạn nháp, em **tự ký cam kết** sau khi hiểu và test được.

---

## 6. Cam kết

**Chữ ký:** [CẦN KÝ — Đỗ Thanh Tín]

**Ngày ký:** [CẦN ĐIỀN]
