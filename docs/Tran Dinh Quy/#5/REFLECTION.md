# AI Learning Reflection - Đợt cập nhật #5

## Điều đã học

- Dashboard analytics cần định nghĩa rõ ý nghĩa của từng số liệu trước khi viết query. Ví dụ occupancy phải loại room deleted, còn revenue chỉ tính subscription đã Active.
- Khoảng thời gian nửa mở `[from, to)` giúp tránh đếm trùng dữ liệu ở ranh giới khi người dùng đổi period hoặc ghép nhiều khoảng liên tiếp.
- Frontend gửi ngày theo timezone địa phương nhưng backend nên chuẩn hóa về UTC trước khi lọc để kết quả nhất quán với cách lưu dữ liệu của hệ thống.
- Không nên tải toàn bộ bảng rồi tổng hợp trong memory. `CountAsync`, `SumAsync`, `GroupBy`, projection và `AsNoTracking` giảm dữ liệu truyền và chi phí tracking.
- Biểu đồ cần lấp các kỳ không có dữ liệu bằng 0. Nếu chỉ trả những group có bản ghi, trục thời gian sẽ thiếu period và dễ gây hiểu sai.
- Owner dashboard và admin dashboard có mục tiêu khác nhau. Tách service/controller giúp tránh làm contract cũ phình to hoặc vô tình thay đổi hành vi của chủ trọ.
- Audit activity đáng tin cậy hơn chuỗi sự kiện giả ở frontend vì có actor, action, entity và timestamp được lưu từ backend.
- Index phải đi cùng pattern truy vấn thực tế: thời gian của audit, status/date của subscription và listing status/date.

## Cách kiểm chứng kết quả AI

- Đọc lại controller để xác nhận `[Authorize(Roles = "Administrator")]`, validation granularity, date range và activity limit.
- Rà service để xác nhận query read-only có `AsNoTracking` và không `ToList` toàn bảng trước khi tính KPI.
- Đối chiếu công thức occupancy và subscription revenue với đặc tả.
- Kiểm tra dữ liệu chuỗi thời gian có period rỗng và DTO mặc định không tạo NaN hoặc null không mong muốn.
- Đối chiếu migration/model snapshot để xác nhận chỉ thêm index mới và không chỉnh migration cũ.
- Chạy build toàn backend, 14 test tự động, frontend production build và ESLint riêng các file dashboard.
- Kiểm tra Git log có bốn commit đúng convention và file đặc tả chưa tracked không bị stage.

## Hạn chế và bước tiếp theo

- Chưa chạy migration và so sánh kết quả aggregate với một SQL Server có dữ liệu mẫu lớn trong phiên này.
- Test hiện tập trung vào authorization metadata, date-range validation và empty defaults; nên bổ sung integration test cho từng KPI và endpoint bằng database test.
- Chưa đo execution plan/thời gian phản hồi trước và sau index; cần benchmark với dữ liệu có quy mô gần production.
- Revenue hiện dựa vào trạng thái `Active` và `CreatedAt` vì entity chưa có trường thời điểm xác nhận riêng; khi bổ sung payment confirmation timestamp nên chuyển filter doanh thu sang thời điểm xác nhận.
- Listing status theo kỳ hiện dựa vào `Room.CreatedAt`; nếu nghiệp vụ cần phân tích số lần moderation trong kỳ thì nên dùng audit/event hoặc lịch sử trạng thái riêng.
- Full-repo ESLint còn technical debt lớn ngoài phạm vi; cần task riêng để xử lý.
- `Microsoft.OpenApi 2.4.1` có cảnh báo bảo mật mức cao và cần được nâng cấp sau khi kiểm tra tương thích.

## Cải tiến cá nhân

Với dashboard, cần lập “data dictionary” nhỏ cho từng widget ngay từ đầu: nguồn bảng, trạng thái được tính, timestamp dùng để lọc, công thức và hành vi khi dữ liệu rỗng. Cách này giúp backend, frontend và test cùng hiểu một định nghĩa, tránh trường hợp biểu đồ đẹp nhưng số liệu không nhất quán với nghiệp vụ.
