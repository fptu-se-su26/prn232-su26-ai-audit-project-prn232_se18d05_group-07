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
| Ngày hoàn thành reflection | 30/05/2026 |

---

## 2. Mục đích Reflection

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
Trong đợt cập nhật #3: Xây dựng Giao diện Vận hành & Quản lý tài sản của Chủ nhà (Owner Layout, PropertyList, PropertyDetail, PropertyCreate, UnitDetail, ListingCreate, ListingList và các Modals tác vụ nghiệp vụ), em đã phối hợp chặt chẽ cùng AI Antigravity. Giai đoạn này bắt đầu bằng việc nhờ AI thiết lập layout chung Dashboard cho chủ trọ (thanh Sidebar cam bóng bẩy và Topbar cập nhật tiêu đề động) và cấu hình bộ định tuyến Hash Router độc lập chống xung đột. Tiếp theo, AI hỗ trợ viết mã nguồn React cho PropertyList.tsx (stats dư nợ/lấp đầy, lọc quận Đà Nẵng) và PropertyDetail.tsx vẽ sơ đồ tầng phòng trọ trống theo lưới tầng có Drawer trượt xem nhanh thông tin hợp đồng. Sau đó, AI lập trình tính năng Live Room Grid Generator trong PropertyCreate.tsx tự sinh bản vẽ phòng trọ trống thời gian thực dựa trên cấu hình Stepper 5 bước. AI cũng viết trang chi tiết phòng UnitDetail.tsx và 3 Modals tác vụ nghiệp vụ (Add Tenant, End Tenancy, Change Status) kèm validation sức chứa tối đa và liên kết sâu hai chiều thông suốt. Tiếp theo, AI hỗ trợ xây dựng trang Đăng tin mới ListingCreate.tsx gồm 6 bước Stepper, Live Public Preview Card cập nhật thời gian thực và validation bắt buộc. Cuối cùng, AI lập trình trang quản lý danh sách tin cho thuê ListingList.tsx hỗ trợ lọc tìm kiếm thông minh, View Toggle (Table/Card), thanh Bulk Actions và 5 modals xác nhận tác vụ nghiệp vụ. Nhóm đã chạy tsc và đóng gói build thành công 100% không phát sinh lỗi.
```

Gợi ý:

- Em/nhóm đã dùng AI ở giai đoạn nào? (Phase 03: Xây dựng giao diện Vận hành của Chủ nhà)
- Dùng AI để hỗ trợ việc gì? (Cấu hình layout Dashboard, viết mã React, lập trình thuật toán tự sinh lưới phòng Grid và validation cấn cọc/sức chứa)
- Công cụ AI nào được sử dụng nhiều nhất? (Antigravity)
- AI có giúp cải thiện chất lượng bài làm không? (Có, bóc tách cấu trúc SaaS 2 cột cực kỳ sang trọng và thuật toán vẽ lưới tầng hoạt động hoàn hảo)
- Có phần nào AI gợi ý nhưng em/nhóm không sử dụng không? (Có, phần validation số lượng người ở mặc định chỉ hiển thị alert đơn giản, em tự cải tiến thành block cảnh báo đỏ nhấp nháy bắt mắt)

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
Antigravity hiểu rất sâu cấu trúc flat folders của dự án và tự chạy các lệnh build kiểm duyệt một cách tối ưu. Ngoài ra, khả năng viết mã React sạch sẽ, không dư thừa cảnh báo (unused warning) giúp dự án đóng gói trơn tru cực kỳ nhanh chóng.
```

---

## 5. AI đã hỗ trợ em/nhóm ở điểm nào?

Đánh dấu các nội dung phù hợp.

- [x] Hiểu yêu cầu đề bài
- [x] Phân tích bài toán
- [x] Tìm ý tưởng giải pháp
- [ ] Thiết kế database
- [x] Thiết kế giao diện
- [ ] Thiết kế kiến trúc hệ thống
- [x] Viết code mẫu
- [ ] Debug lỗi
- [ ] Viết test case
- [ ] Review code
- [x] Tối ưu code
- [ ] Kiểm tra bảo mật
- [x] Viết báo cáo
- [ ] Làm slide thuyết trình
- [x] Tìm hiểu công nghệ mới
- [ ] Khác: ....................................

### Mô tả chi tiết

```text
AI hỗ trợ thiết kế giao diện SaaS Dashboard 2 cột cực kỳ sang trọng, tự động hóa việc tính toán Live Grid sơ đồ phòng trọ theo tầng ở cột phải PropertyCreate.tsx thời gian thực dựa trên cấu hình Stepper ở cột trái. AI viết mã nguồn React chi tiết cho trang danh sách tài sản, lưới Grid, drawer xem nhanh, trang chi tiết phòng vận hành UnitDetail.tsx. Đồng thời, AI thiết kế trang ListingCreate.tsx với Stepper 6 bước và thiết lập Live Public Card Preview cập nhật thời gian thực, logic auto-fill khi liên kết phòng trọ trống có sẵn và validation cấm số âm. AI cũng lập trình toàn bộ trang danh sách quản lý tin trọ ListingList.tsx hỗ trợ lọc nâng cao, View Mode (Table/Card), thanh Bulk Actions và 5 Modals tác vụ nghiệp vụ (Hide, Delete, Resubmit, Mark Rented, Rejection Reason). AI cũng hỗ trợ viết logic validation sức chứa tối đa trong Add Tenant Modal, cấn trừ tiền cọc bàn giao trong End Tenancy và tích hợp sâu liên kết hai chiều toàn giao diện.
```

---

## 6. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
Phần logic validation sức chứa tối đa mặc định của AI chỉ là hiển thị một dòng thông báo alert tĩnh đơn giản và khóa nút bấm lưu. Em tự nhận thấy điều này chưa tối ưu cho trải nghiệm người dùng vận hành, vì vậy em đã tự cải tiến thành một block thông báo màu đỏ nhấp nháy kèm biểu tượng Material Symbol warning rực rỡ nằm ngay dưới ô nhập liệu khi số lượng người lớn hơn 2. Điều này giúp giao diện trở nên vô cùng bắt mắt, thu hút sự chú ý của chủ trọ và tăng chất lượng trải nghiệm UX của hệ thống.
```

---

## 7. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

```text
Thông qua hai bước kiểm thử nghiêm ngặt:
1. Chạy biên dịch đóng gói sản phẩm tĩnh bằng lệnh npm run build tại RoomHub.Frontend/ để đảm bảo 100% không phát sinh lỗi TypeScript (tsc) hay bundler.
2. Chạy dev server bằng lệnh npm run dev và thực hiện kiểm thử thủ công tất cả các tương tác sinh phòng tự động, các kịch bản click xem nhanh trên sơ đồ tầng, và chốt hợp đồng khách thuê trên giao diện để kiểm duyệt sự thay đổi trạng thái của phòng trọ.
```

---

## 8. Nếu không có AI, phần nào sẽ khó khăn nhất?

```text
Thuật toán tự động sinh và vẽ lại sơ đồ tầng phòng trọ trống (Live Room Grid Generator) ở cột phải theo thời gian thực dựa trên thay đổi số tầng và số phòng mỗi tầng ở cột trái trong PropertyCreate.tsx là phần khó khăn nhất. Việc xử lý logic vòng lặp để vẽ từ tầng cao nhất xuống tầng thấp nhất, kết hợp các quy tắc đánh số phòng Standard/Prefix và hiển thị cảnh báo đỏ khi số phòng quá tải (>60 phòng) đòi hỏi tính toán logic React rất cao, nếu làm thủ công sẽ mất nhiều ngày debug.
```

---

## 9. Sau bài tập/project này, em/nhóm học được gì về môn học?

```text
Em đã học được cách tổ chức mã nguồn và quản lý các luồng dữ liệu (React State) trong một hệ thống biểu mẫu Stepper nhiều bước phức tạp. Đồng thời, việc xây dựng các hộp thoại Modal tương tác nghiệp vụ và bộ định tuyến Hash Router hai chiều giúp em hiểu sâu sắc về kiến trúc ứng dụng Single Page App (SPA) bóng bẩy, tăng tốc độ phản hồi tối đa cho trải nghiệm người dùng trọ.
```

---

## 10. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

```text
Phải luôn luôn giữ tinh thần chủ động kiểm chứng và phản biện lại những gì AI đề xuất. AI rất giỏi trong việc sinh khung sườn mã nguồn nhanh chóng, nhưng sinh viên phải là người chịu trách nhiệm cá nhân hóa, tối ưu hóa các validation logic nghiệp vụ thực tế ngoài đời và tinh chỉnh giao diện cho phù hợp nhất với bản sắc riêng của đồ án nhóm, mang lại giá trị vận hành thực tiễn cao cho sản phẩm.
```

---

## 11. Tự đánh giá mức độ hoàn thành & Điểm tự đánh giá

Sinh viên tự đánh giá mức độ trung thực và chất lượng sản phẩm.

| Tiêu chí | Điểm tự đánh giá 1-5 | Ghi chú |
|---|:---:|---|
| Ghi nhận việc dùng AI trung thực | 5 | Khai báo chi tiết 4 lần sử dụng AI |
| Prompt có mục tiêu rõ ràng | 5 | Hỏi bám sát nghiệp vụ vận hành |
| Kiểm chứng kết quả AI | 5 | Đóng gói sản phẩm thành công tĩnh |
| Tự chỉnh sửa/cải tiến | 5 | Cải tiến block validation cảnh báo đỏ cảnh báo sức chứa |
| Hiểu nội dung đã nộp | 5 | Có khả năng giải thích và bảo vệ 100% mã nguồn |
| Reflection có chiều sâu | 5 | Đúc kết sâu sắc về React State và Hash Routing |
| Sử dụng AI có trách nhiệm | 5 | Phản biện logic và tối ưu UX của AI đề xuất |

---

## 12. Câu hỏi tự vấn cuối bài

### 12.1. Nếu giảng viên hỏi về phần AI đã hỗ trợ, em/nhóm có giải thích lại được không?

```text
Chắc chắn giải thích được 100%. Em hiểu rõ cách nạp state lắng nghe sự kiện window hash change, thuật toán Live Room Grid Generator vẽ lại sơ đồ Grid bằng CSS grid-cols, cách quản lý các trường dữ liệu trong biểu mẫu Stepper 5 bước và cơ chế validation sức chứa tối đa trong Add Tenant Modal.
```

### 12.2. Nếu không có AI, em/nhóm có thể tự làm lại phần quan trọng nhất không?

```text
Hoàn toàn tự làm lại được. Thời gian có thể kéo dài hơn do phải tự viết các thuật toán vòng lặp chia tầng sơ đồ phòng trọ, nhưng nền tảng kiến thức React TypeScript và CSS Grid của em hoàn toàn đủ khả năng tự thực thi trọn vẹn.
```

### 12.3. Phần nào trong bài thể hiện rõ nhất năng lực thật sự của em/nhóm?

```text
Tính năng thiết kế liên kết sâu hai chiều tương tác mượt mà giữa Grid sơ đồ phòng trọ, danh sách khách thuê, bảng hoá đơn và trang vận hành chi tiết phòng, giúp toàn bộ hệ thống trở thành một mạch thống nhất cực kỳ logic.
```

### 12.4. Em/nhóm muốn cải thiện kỹ năng nào sau bài này?

```text
Kỹ năng kết nối gọi các API thực tế có bảo mật Token Bearer từ Backend C# .NET và viết các unit test kiểm thử tự động cho giao diện React.
```

---

## 13. Cam kết Reflection

Em/nhóm cam kết rằng nội dung reflection này phản ánh trung thực quá trình sử dụng AI và quá trình học tập trong bài tập/project.

Sinh viên/nhóm hiểu rằng:

- AI là công cụ hỗ trợ học tập, không thay thế hoàn toàn năng lực cá nhân.
- Mọi kết quả AI gợi ý cần được kiểm tra trước khi sử dụng.
- Sinh viên/nhóm chịu trách nhiệm với sản phẩm cuối cùng.
- Sinh viên/nhóm cần giải thích được các phần đã sử dụng từ AI.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phan Hoài An | 30/05/2026 |
