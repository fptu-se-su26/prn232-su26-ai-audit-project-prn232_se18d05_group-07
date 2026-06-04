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
| Ngày hoàn thành reflection | 04/06/2026 |

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
Trong đợt cập nhật #4: Sửa lỗi UX/UI và Tích hợp API thực tế cho Owner Pages, em đã tiếp tục phối hợp chặt chẽ cùng AI Antigravity. Giai đoạn này bắt đầu bằng việc phân tích toàn diện tất cả các giao diện Owner đã xây dựng ở #3 để lập danh sách vấn đề cần giải quyết. Cụ thể: (1) Xóa banner "Chế độ Demo" và kết nối API thực cho Dashboard; (2) Sửa lỗi nghiệp vụ quan trọng: phòng mới không còn tự động đăng tin, chỉ đăng khi chủ nhà bấm Đăng tin thủ công; (3) Fix lỗi bộ lọc Loại hình bị reset về Phòng trọ sau mỗi lần fetch; (4) Fix dropdown 3 chấm bị dật dật do event conflict và z-index; (5) Xây dựng hệ thống Toast thông báo chuyên nghiệp thay thế window.alert(); (6) Sửa hai dropdown Chọn tòa nhà/Chọn phòng bị disabled do lỗi isEditMode; (7) Xóa toàn bộ mock listings và mock properties, thay bằng API thực tế. Nhóm đã kiểm thử tích hợp với backend .NET API thực và xác nhận toàn bộ owner flows hoạt động đúng.
```

Gợi ý:

- Em/nhóm đã dùng AI ở giai đoạn nào? (Phase 04: Debug và API Integration cho Owner pages)
- Dùng AI để hỗ trợ việc gì? (Phân tích nguyên nhân lỗi, viết code fix, xây dựng Toast system, tích hợp API)
- Công cụ AI nào được sử dụng nhiều nhất? (Antigravity)
- AI có giúp cải thiện chất lượng bài làm không? (Có, đặc biệt trong việc xác định nhanh nguyên nhân các lỗi phức tạp như isEditMode và z-index conflict)
- Có phần nào AI gợi ý nhưng em/nhóm không sử dụng không? (Có, AI đề xuất dùng thư viện react-hot-toast, em tự xây Toast component nội bộ)

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
Antigravity có khả năng đọc và phân tích toàn bộ codebase (nhiều file, nhiều component liên quan) để xác định nguyên nhân lỗi phức tạp trải dài qua nhiều file — điều này cực kỳ quan trọng khi debug các lỗi như isEditMode hay z-index conflict. Ngoài ra, Antigravity có thể chạy lệnh kiểm tra build và test tích hợp trực tiếp, giúp xác minh kết quả nhanh chóng.
```

---

## 5. AI đã hỗ trợ em/nhóm ở điểm nào?

Đánh dấu các nội dung phù hợp.

- [x] Hiểu yêu cầu đề bài
- [x] Phân tích bài toán
- [x] Tìm ý tưởng giải pháp
- [ ] Thiết kế database
- [ ] Thiết kế giao diện
- [ ] Thiết kế kiến trúc hệ thống
- [x] Viết code mẫu
- [x] Debug lỗi
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
AI hỗ trợ phân tích sâu toàn bộ codebase Owner pages để xác định 8 vấn đề cụ thể cần giải quyết. Đặc biệt, AI rất hiệu quả trong việc debug các lỗi phức tạp: (1) Xác định chính xác nguồn gốc của lỗi isEditMode bị set sai trong ListingCreate.tsx qua phân tích luồng state; (2) Tìm ra vòng lặp event conflict trong dropdown 3 chấm; (3) Phát hiện nguyên nhân filter state bị reset do gộp chung với data state. AI cũng viết toàn bộ logic tích hợp API cho Dashboard, ListingList, ListingCreate và xây dựng hệ thống Toast notification.
```

---

## 6. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
AI đề xuất sử dụng thư viện react-hot-toast cho hệ thống Toast notification vì nó có sẵn, đẹp và nhiều tính năng. Tuy nhiên em quyết định tự xây dựng Toast component nội bộ vì ba lý do: (1) Tránh phụ thuộc thư viện không cần thiết, giảm bundle size; (2) Toàn quyền kiểm soát styling để đảm bảo nhất quán với thương hiệu RoomHub (màu cam #F97316 đặc trưng, font Outfit, border-radius chuẩn dự án); (3) Dễ dàng thêm các tính năng tùy chỉnh sau này (progress bar, action button trong toast, v.v.) mà không bị hạn chế bởi API của thư viện.

Ngoài ra, AI ban đầu đề xuất sử dụng position:absolute cho dropdown 3 chấm, nhưng em nhận ra giải pháp đúng là position:fixed với getBoundingClientRect() để thoát khỏi overflow:hidden của table container — đây là pattern chuẩn cho dropdown trong table mà em tự nghiên cứu thêm.
```

---

## 7. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

```text
Phase 04 áp dụng quy trình kiểm thử nghiêm ngặt hơn các phase trước:

1. Kiểm thử đơn vị (Unit Testing thủ công): Kiểm tra từng component riêng lẻ (Toast auto-dismiss, Filter pill selection, Dropdown toggle).

2. Kiểm thử tích hợp (Integration Testing): Chạy đồng thời Frontend dev server (npm run dev) và Backend .NET API (dotnet run), sử dụng browser DevTools Network tab để xác nhận API requests được gửi đúng endpoint với đúng Bearer Token và nhận response hợp lệ.

3. Kiểm thử theo user story: Thực hiện toàn bộ luồng thực tế của Chủ nhà: Đăng nhập → Xem Dashboard (dữ liệu thực) → Tạo tài sản mới → Vào Tin cho thuê (không thấy phòng tự động) → Bấm Đăng tin → Toast "Đăng tin thành công!" → Phòng chuyển sang Chờ duyệt.

4. Regression testing: Đảm bảo các tính năng cũ từ Phase 03 không bị ảnh hưởng bởi các thay đổi Phase 04.
```

---

## 8. Nếu không có AI, phần nào sẽ khó khăn nhất?

```text
Khó khăn nhất là xác định nguyên nhân gốc rễ của lỗi isEditMode trong ListingCreate.tsx. Lỗi này không biểu hiện rõ ràng (không có error message, không có console.error) — chỉ biểu hiện qua hành vi UI: hai dropdown bị disabled bí ẩn. Để tự tìm ra lỗi này, cần đọc toàn bộ 1000+ dòng code của ListingCreate.tsx, trace luồng state qua 10+ useEffect và handler functions, rồi so sánh với cách App.tsx truyền selectedListingId. Quá trình này có thể mất nhiều giờ nếu không có AI phân tích toàn bộ codebase trong vài phút.

Thứ hai là xây dựng hệ thống Toast notification từ đầu. Mặc dù có thể dùng thư viện nhưng việc tự xây dựng đòi hỏi hiểu sâu về React portals, CSS animation keyframes, và quản lý timeout/cleanup trong useEffect.
```

---

## 9. Sau bài tập/project này, em/nhóm học được gì về môn học?

```text
Em học được 3 nguyên tắc quan trọng:

1. "Không bao giờ dùng window.alert() trong SaaS product" — đây là tiêu chuẩn tối thiểu của professional web development. Toast notification là pattern chuẩn ngành.

2. "Tách filter state khỏi data state" — khi filter state và server data state bị gộp chung, mọi API response đều có nguy cơ reset filter về mặc định. Pattern đúng: filter là client state (useState), data là server state (từ API), hai thứ hoàn toàn độc lập.

3. "Test integration sớm, không đợi cuối" — 7/8 lỗi trong Phase 04 đều có thể phát hiện sớm hơn nếu test với API thực ngay từ đầu Phase 03 thay vì để đến Phase 04 mới kết nối.
```

---

## 10. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

```text
Bài học quan trọng nhất trong Phase 04: "AI giỏi về Frontend logic nhưng cần sinh viên tự xác minh Backend API."

AI tự tin viết code gọi GET /api/owner/dashboard, GET /api/owner/listings mà không biết những endpoint này có thực sự tồn tại và có đúng cấu trúc response không. Nếu không tự kiểm tra DashboardController.cs và ListingService.cs trước, code AI viết sẽ fail runtime với lỗi 404/500 khó debug.

Nguyên tắc áp dụng sau Phase 04: Luôn xác minh API contract (endpoint URL, HTTP method, request/response schema, auth requirement) trước khi để AI viết code tích hợp. AI là người viết code nhanh, nhưng sinh viên là người đảm bảo code đó tích hợp đúng với hệ thống thực.
```

---

## 11. Tự đánh giá mức độ hoàn thành & Điểm tự đánh giá

Sinh viên tự đánh giá mức độ trung thực và chất lượng sản phẩm.

| Tiêu chí | Điểm tự đánh giá 1-5 | Ghi chú |
|---|:---:|---|
| Ghi nhận việc dùng AI trung thực | 5 | Khai báo chi tiết 7 prompt với context đầy đủ |
| Prompt có mục tiêu rõ ràng | 5 | Mô tả lỗi cụ thể kèm URL và hành vi quan sát được |
| Kiểm chứng kết quả AI | 5 | Kiểm thử tích hợp với backend API thực tế |
| Tự chỉnh sửa/cải tiến | 5 | Tự xây Toast nội bộ, không dùng thư viện AI đề xuất |
| Hiểu nội dung đã nộp | 5 | Có khả năng giải thích nguyên nhân và cách fix từng lỗi |
| Reflection có chiều sâu | 5 | Rút ra 3 nguyên tắc cụ thể từ Phase 04 |
| Sử dụng AI có trách nhiệm | 5 | Phản biện đề xuất thư viện, tự xác minh API contract |

---

## 12. Câu hỏi tự vấn cuối bài

### 12.1. Nếu giảng viên hỏi về phần AI đã hỗ trợ, em/nhóm có giải thích lại được không?

```text
Chắc chắn giải thích được 100%. Em hiểu rõ: (1) Tại sao isEditMode bị set sai (selectedListingId không được clear khi navigate); (2) Tại sao dropdown 3 chấm bị dật (onMouseEnter/Leave event loop); (3) Tại sao filter bị reset (filter state gộp chung với data state); (4) Cơ chế hoạt động của Toast component (React portals, CSS keyframes, setTimeout cleanup); (5) Luồng Draft → Publish của listing management.
```

### 12.2. Nếu không có AI, em/nhóm có thể tự làm lại phần quan trọng nhất không?

```text
Hoàn toàn tự làm lại được. Debug isEditMode sẽ mất vài giờ đọc code thay vì vài phút với AI, nhưng em có đủ kiến thức React TypeScript để tự trace luồng state. Xây dựng Toast component từ đầu cũng là việc em tự làm được với kiến thức CSS animation và React hooks cơ bản.
```

### 12.3. Phần nào trong bài thể hiện rõ nhất năng lực thật sự của em/nhóm?

```text
Quyết định tự xây dựng Toast component nội bộ thay vì dùng thư viện react-hot-toast mà AI đề xuất. Điều này thể hiện khả năng đánh giá trade-off (bundle size vs. development speed), hiểu rõ cách hoạt động của animation CSS và React state lifecycle, và tinh thần chủ động trong việc kiểm soát chất lượng code của dự án. Ngoài ra, việc xác minh API contract với backend trước khi sử dụng code AI viết thể hiện kỹ năng Full Stack và ý thức trách nhiệm với sản phẩm.
```

### 12.4. Em/nhóm muốn cải thiện kỹ năng nào sau bài này?

```text
1. Viết integration test tự động (Playwright hoặc Cypress) để có thể detect regression tự động mà không cần test thủ công.
2. Hiểu sâu hơn về JWT authentication flow để tự implement refresh token mechanism khi access token hết hạn.
3. Học thêm về React Query (TanStack Query) để quản lý server state chuyên nghiệp hơn, tránh tái diễn lỗi gộp filter state với data state.
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
| Phan Hoài An | 04/06/2026 |
