# AI Learning Reflection - Đợt cập nhật #7

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
| Ngày hoàn thành reflection | 10/06/2026 |

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

```text
Trong đợt cập nhật #7, AI trợ lý Antigravity đã hỗ trợ tích cực trong việc khắc phục lỗi điều hướng "Về trang chủ" từ Dashboard và tích hợp Custom Modal Confirm xóa thông báo (cả Owner và Tenant). AI giúp em phân tích bản chất của việc lưu hash trên URL gây chồng lấn giao diện và đề xuất cách làm sạch hash, đồng thời thiết kế và hiện thực các Modal tùy chỉnh bằng React State và Tailwind CSS thay thế cho window.confirm mặc định.
```

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
Antigravity có khả năng đọc hiểu mã nguồn hiện tại của toàn bộ dự án, hỗ trợ sửa đổi trực tiếp các file Frontend đồng bộ và chính xác mà không làm hỏng cấu trúc định dạng hoặc gây lỗi TypeScript typecheck.
```

---

## 5. AI đã hỗ trợ em/nhóm ở điểm nào?

Đánh dấu các nội dung phù hợp.

- [x] Hiểu yêu cầu đề bài
- [x] Phân tích bài toán
- [x] Tìm ý tưởng giải pháp
- [ ] Thiết kế database
- [x] Thiết kế giao diện
- [x] Thiết kế kiến trúc hệ thống
- [x] Viết code mẫu
- [ ] Debug lỗi
- [ ] Viết test case
- [ ] Review code
- [x] Tối ưu code
- [ ] Kiểm tra bảo mật
- [x] Viết báo cáo
- [ ] Làm slide thuyết trình
- [ ] Tìm hiểu công nghệ mới
- [ ] Khác: ....................................

### Mô tả chi tiết

```text
AI đã hỗ trợ đắc lực trong việc phân tích các thành phần kiến trúc Routing của hệ thống (đồng bộ giữa Hash và React Router Path). AI đã trực tiếp thiết kế các Custom Modal Confirm có hiệu ứng CSS tốt (fade-in, scale-up) để tăng tính chuyên nghiệp của UI. Đồng thời, AI hỗ trợ việc dọn dẹp hash URL tại nhiều vị trí Layouts và Navbar để kiểm soát tốt hành vi điều hướng.
```

---

## 6. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
Em đã áp dụng đầy đủ các gợi ý của AI vì các đề xuất đều cực kỳ hợp lý, giải quyết đúng mục tiêu nghiệp vụ và sửa lỗi triệt để mà không gây dư thừa mã nguồn.
```

---

## 7. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

```text
Quy trình kiểm chứng được thực hiện như sau:
1. Compile Check: Chạy build dự án frontend (`npm run build`) thành công 100% không phát sinh bất kỳ lỗi compile hay cảnh báo kiểu dữ liệu nào.
2. E2E Testing: 
   - Đăng nhập Owner và Tenant: Thực hiện xóa thông báo, giao diện hiển thị Custom Modal Confirm đúng chuẩn, bấm Xóa bỏ thì thông báo biến mất và badge trên chuông Navbar tự giảm số lượng. Không hiển thị cảnh báo mặc định của browser.
   - Nhấn "Từ chối" ở lời mời nhận phòng của Tenant, modal cảnh báo màu cam hiển thị chính xác.
   - Từ các trang con của dashboard, nhấn nút "Về trang chủ" ở Avatar dropdown, URL lập tức chuyển về "/" sạch hash, màn hình hiển thị đúng trang chủ thay vì trang Tìm chỗ ở như trước. Bấm vào Logo thương hiệu ở Navbar cũng trả về đúng trang chủ và URL sạch sẽ.
```

---

## 8. Nếu không có AI, phần nào sẽ khó khăn nhất?

```text
Phần khó khăn nhất là phân tích nguyên nhân tại sao nút "Về trang chủ" lại hiển thị trang "Tìm chỗ ở" mặc dù đã đổicurrentPage về "home". Phải mất nhiều thời gian để nhận ra rằng do browser path ban đầu vẫn là `/browse` và ứng dụng đang sử dụng cơ chế hash-routing để hiển thị Dashboard song song với React Router path. AI đã phân tích bản chất này rất nhanh và đưa ra giải pháp toàn diện.
```

---

## 9. Sau bài tập/project này, em/nhóm học được gì về môn học?

```text
Em học được:
1. Cách xây dựng và quản lý các component Modal Confirm động trong React bằng state (ví dụ dùng targetId thay vì boolean open/close thông thường giúp xác định chính xác phần tử cần thao tác).
2. Bản chất của Router trong Single Page Application (SPA), sự phối hợp giữa Browser Path và Hash URL, cách đồng bộ chúng để tránh lỗi đè giao diện hoặc lỗi reload trang.
3. Cách tối ưu hóa trải nghiệm người dùng (UX) thông qua việc loại bỏ các hộp thoại browser mặc định và làm sạch URL.
```

---

## 10. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

```text
Sử dụng AI có trách nhiệm là luôn kiểm duyệt hành vi điều hướng của ứng dụng. Khi AI đề xuất code điều hướng hoặc xóa hash, em cần đảm bảo việc dọn dẹp hash không làm hỏng trải nghiệm quay lại (Back/Forward) của người dùng hoặc làm mất các token xác thực quan trọng lưu trên URL (nếu có).
```

---

## 11. Tự đánh giá mức độ hoàn thành & Điểm tự đánh giá

| Tiêu chí | Điểm tự đánh giá 1-5 | Ghi chú |
|---|:---:|---|
| Ghi nhận việc dùng AI trung thực | 5 | Ghi nhận chi tiết 2 prompt thực tế |
| Prompt có mục tiêu rõ ràng | 5 | Xác định rõ lỗi điều hướng và yêu cầu Custom Modal |
| Kiểm chứng kết quả AI | 5 | Build thành công và kiểm tra trực quan trên browser |
| Tự chỉnh sửa/cải tiến | 5 | Áp dụng Custom Modal cho cả hành động từ chối nhận phòng |
| Hiểu nội dung đã nộp | 5 | Nắm rõ cơ chế làm sạch hash và render component |
| Reflection có chiều sâu | 5 | Rút ra bài học sâu sắc về Single Page Application routing |
| Sử dụng AI có trách nhiệm | 5 | Đảm bảo tính nhất quán của giao diện và URL |

---

## 12. Câu hỏi tự vấn cuối bài

### 12.1. Nếu giảng viên hỏi về phần AI đã hỗ trợ, em/nhóm có giải thích lại được không?

```text
Hoàn toàn giải thích được. Em nắm rõ cách hoạt động của React state để bật/tắt Custom Modal, cách gọi API DELETE của axios, và cách dùng navigate() của react-router-dom cùng window.location.hash để quản lý URL.
```

### 12.2. Nếu không có AI, em/nhóm có thể tự làm lại phần quan trọng nhất không?

```text
Chắc chắn tự làm lại được vì đây là các kiến thức thiết kế component cơ bản và điều hướng phổ biến trong React.
```

### 12.3. Phần nào trong bài thể hiện rõ nhất năng lực thật sự của em/nhóm?

```text
Khả năng thiết kế Custom Modal Confirm đồng bộ, đẹp mắt và tối ưu hóa trải nghiệm người dùng (UX) khi thao tác với các hành động nguy hiểm (xóa/từ chối).
```

### 12.4. Em/nhóm muốn cải thiện kỹ năng nào sau bài này?

```text
Cải thiện kỹ năng quản lý Router sâu và thiết lập các Route Guard (bảo vệ đường dẫn) nâng cao trong các ứng dụng React SPA quy mô lớn.
```

---

## 13. Cam kết Reflection

Em/nhóm cam kết nội dung phản ánh trung thực quá trình học tập.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phan Hoài An | 10/06/2026 |
