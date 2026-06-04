# AI Audit Log

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
| Ngày bắt đầu | 04/06/2026 |
| Ngày hoàn thành | 04/06/2026 |

---

## 2. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng trong quá trình thực hiện bài tập/project.

- [ ] ChatGPT
- [ ] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [x] Antigravity
- [ ] Perplexity
- [ ] Microsoft Copilot
- [ ] Công cụ khác: ....................................

---

## 3. Mục tiêu sử dụng AI

Mô tả ngắn gọn sinh viên/nhóm đã sử dụng AI để hỗ trợ những công việc nào.

- Phân tích toàn bộ giao diện Owner hiện có, xác định và loại bỏ tất cả dữ liệu mock/seed cố định (hardcoded) trên trang Dashboard (`Dashboard.tsx`), thay thế bằng dữ liệu thật từ API backend.
- Cập nhật trang Tin cho thuê (`ListingList.tsx`): sửa logic đăng tin — phòng chỉ hiển thị trên sàn khi chủ nhà bấm **Đăng tin** thủ công, không tự động đăng khi tạo phòng mới.
- Sửa lỗi bộ lọc Loại hình (`propertyType`) trong `ListingList.tsx` bị reset về "Phòng trọ" mỗi khi re-render.
- Sửa lỗi giao diện tooltip/dropdown 3 chấm bị dật dật (z-index conflict, menu bị che khuất) trong bảng tin đăng.
- Thay thế hộp thoại `window.alert()` / `window.confirm()` bằng hệ thống Toast thông báo chuyên nghiệp (thành công, lỗi, xác nhận) trên toàn bộ Owner pages.
- Sửa lỗi hai dropdown **Chọn tòa nhà / tài sản** và **Chọn số phòng trống** trong `ListingCreate.tsx` bị disabled/ẩn đi không thể chọn.
- Loại bỏ toàn bộ danh sách tin đăng cố định (mock listings) trong `ListingList.tsx`, đảm bảo chỉ hiển thị dữ liệu thực từ API.
- Sửa mục **Tài sản liên kết** trong `ListingCreate.tsx` để lấy đúng danh sách tài sản của chủ nhà đang đăng nhập từ API, thay vì dùng mock data.
- Kết nối API thực tế (`/api/owner/dashboard`, `/api/owner/listings`, `/api/owner/properties`) với authentication JWT Bearer Token.

### Mô tả mục tiêu sử dụng AI

```text
Sử dụng trợ lý AI Antigravity để phân tích sâu toàn bộ codebase Frontend Owner đã xây dựng trong #3, xác định các vấn đề tồn đọng: dữ liệu mock cứng nhắc, logic nghiệp vụ sai (tự động đăng tin khi tạo phòng), các bug giao diện (bộ lọc reset, dropdown z-index, hai dropdowns bị disabled). AI hỗ trợ viết lại các component với dữ liệu API thực tế, chuẩn hóa hệ thống thông báo Toast, sửa các lỗi UX/UI và đảm bảo toàn bộ luồng nghiệp vụ đăng tin cho thuê hoạt động chính xác.
```

## 4. Nhật ký sử dụng AI chi tiết

---

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 04/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Xóa dữ liệu mock cố định trên Dashboard và kết nối API thực tế |
| Phần việc liên quan | Frontend / Owner Dashboard / API Integration |
| Mức độ sử dụng | Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
bạn hãy phân tích thật kĩ lại dự án và thực hiện từng bước cập nhật, đầu tiên là trang http://localhost:5173/browse#/owner/dashboard bạn hãy giúp tôi xóa đi các dữ liệu mock được fix sẵn thực hiện xóa đi Chế độ Demo: Bạn đang xem trạng thái Tài khoản đã có dữ liệu mẫu. đảm bảo hiển thị dữ liệu thật thôi, hãy phân tích và thực hiện cập nhật
```

#### 4.2. Kết quả AI gợi ý

AI đã phân tích `Dashboard.tsx`, xác định toàn bộ các block hardcoded mock data (banner "Chế độ Demo", mảng stats cứng, danh sách tài sản mẫu). AI cập nhật component để gọi API thực tế `/api/owner/dashboard` với Bearer Token, hiển thị skeleton loading state, xử lý error state, và render dữ liệu động thực tế từ server.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Sử dụng toàn bộ logic gọi API và cấu trúc state management mới trong `Dashboard.tsx`, loại bỏ toàn bộ banner demo và mảng dữ liệu mock cứng.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

- Tự kiểm tra và xác nhận cấu trúc response API từ backend `ListingService.cs` và `DashboardController.cs` để đảm bảo mapping đúng các field.
- Bổ sung thêm fallback UI "Chưa có dữ liệu" khi API trả về mảng rỗng.

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | [DE180303] fix: remove mock data and connect real API on owner dashboard |
| File liên quan | RoomHub.Frontend/src/pages/owner/Dashboard.tsx |
| Kết quả chạy/test | Dashboard hiển thị đúng số liệu thực của tài khoản đăng nhập, không còn banner Chế độ Demo |

#### 4.6. Nhận xét cá nhân/nhóm

Việc loại bỏ mock data và kết nối API thực giúp hệ thống phản ánh đúng tình trạng thực tế của từng chủ nhà, tăng tính tin cậy và chuyên nghiệp của sản phẩm.

---

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 04/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Sửa logic đăng tin: phòng chỉ hiển thị khi chủ nhà bấm Đăng tin thủ công |
| Phần việc liên quan | Frontend / ListingList / Business Logic Fix |
| Mức độ sử dụng | Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
tiếp theo hãy đi sâu vào cập nhật chỉnh sửa trang Tin cho thuê http://localhost:5173/browse#/owner/listings, đang có những vấn đề cụ thể như sau, vấn đề đầu tiên là hiện tại sau khi thực hiện thêm tài sản và các phòng mới thì hiện tại trang tin cho thuê đang tự động đăng tin tất cả các phòng vừa tạo mới luôn hãy cập nhật lại tôi muốn khi nào người chủ nhà thực hiện đăng tin cụ thể cho các phòng thì phòng đó mới được đăng tin lên thôi...
```

#### 4.2. Kết quả AI gợi ý

AI phân tích backend `ListingService.cs` và xác định vấn đề: khi tạo phòng mới, hệ thống tự động tạo listing record với trạng thái `Active`. AI đề xuất: (1) Thay đổi logic backend để listing mới tạo có trạng thái `Draft` thay vì `Active`; (2) Cập nhật `ListingList.tsx` để chỉ hiển thị listing khi chủ nhà bấm nút **Đăng tin** — khi đó gọi API `PUT /api/listings/{id}/publish` để chuyển trạng thái từ `Draft` sang `Pending`/`Active`.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Sử dụng toàn bộ logic phân tách trạng thái listing, cập nhật `ListingList.tsx` với nút Đăng tin riêng biệt và flow gọi API publish.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

- Kiểm tra `ListingsController.cs` để xác nhận endpoint publish tồn tại, bổ sung endpoint nếu thiếu.
- Tự thiết kế thêm badge trạng thái `Nháp` màu xám để phân biệt rõ với các trạng thái khác.

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | [DE180303] fix: listing only goes live when owner manually publishes it |
| File liên quan | RoomHub.Frontend/src/pages/owner/ListingList.tsx |
| Kết quả chạy/test | Tạo phòng mới → không tự động hiện trên trang Tin cho thuê; bấm Đăng tin → phòng mới chuyển sang trạng thái chờ duyệt |

#### 4.6. Nhận xét cá nhân/nhóm

Đây là lỗi nghiệp vụ quan trọng ảnh hưởng trực tiếp đến trải nghiệm chủ nhà. Việc sửa đúng flow giúp chủ nhà kiểm soát hoàn toàn việc đăng tin của mình.

---

### Lần sử dụng AI số 3

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 04/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Sửa lỗi bộ lọc Loại hình bị reset và chuẩn hóa Filter Panel |
| Phần việc liên quan | Frontend / ListingList / Filter Bug Fix |
| Mức độ sử dụng | Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
...tiếp theo ở mục Bộ lọc & Tìm kiếm tin đăng thì hiện tại phần lọc theo Loại hình đang bị lỗi hiện tại khi tạo một căn hộ hay studio mới thì tới trang tin cho thuê này luôn bị đổi về thành loại hình phòng trọ hết, hãy thực hiện cập nhật lại Bộ lọc & Tìm kiếm tin đăng đảm bảo chuẩn tối ưu chuyên nghiệp hơn...
```

#### 4.2. Kết quả AI gợi ý

AI phát hiện lỗi: giá trị filter `propertyType` được khởi tạo mặc định là `'room'` (Phòng trọ) thay vì `'all'`. Mỗi lần component re-render do API response trả về, state bị reset về giá trị mặc định này. AI sửa: (1) Khởi tạo `propertyType` = `'all'`; (2) Tách filter state ra khỏi luồng API fetch để không bị overwrite; (3) Chuẩn hóa UI filter với các pill buttons rõ ràng cho từng loại hình (Tất cả, Phòng trọ, Studio, Căn hộ mini, Căn hộ).

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Sử dụng toàn bộ bản sửa lỗi filter state và cập nhật UI pill buttons mới của `ListingList.tsx`.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

- Kiểm tra kỹ việc giá trị filter có được giữ nguyên qua các lần fetch data tiếp theo không.
- Bổ sung hiệu ứng transition mượt mà khi chuyển đổi filter.

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | [DE180303] fix: property type filter no longer resets on re-render in listing list |
| File liên quan | RoomHub.Frontend/src/pages/owner/ListingList.tsx |
| Kết quả chạy/test | Chọn filter Căn hộ → dữ liệu lọc đúng → chờ fetch → filter vẫn giữ nguyên Căn hộ |

#### 4.6. Nhận xét cá nhân/nhóm

Lỗi reset filter là lỗi UX cực kỳ khó chịu với người dùng. Giải pháp tách filter state khỏi API state là pattern đúng đắn cần áp dụng nhất quán toàn dự án.

---

### Lần sử dụng AI số 4

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 04/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Sửa lỗi giao diện dropdown 3 chấm bị dật dật và không thể bấm |
| Phần việc liên quan | Frontend / ListingList / UI Bug Fix / Z-index |
| Mức độ sử dụng | Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
hiện tại khi di chuyển chuột đến dấu 3 chấm ở mỗi tin thì đang bị lỗi giao diện dật dật không bấm vào đó được...
```

#### 4.2. Kết quả AI gợi ý

AI xác định nguyên nhân: nút 3 chấm và menu dropdown có cơ chế `onMouseLeave` kích hoạt đóng menu ngay khi chuột di chuyển vào phần menu, tạo vòng lặp show/hide liên tục. Đồng thời `z-index` của dropdown không đủ cao để hiển thị trên table rows. AI sửa bằng cách: (1) Dùng `onClick` thay vì `onMouseEnter/Leave` để toggle menu; (2) Thêm click-outside handler đóng menu; (3) Tăng `z-index` dropdown lên `z-50` và thêm `position: fixed` để thoát khỏi table overflow hidden.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Sử dụng toàn bộ bản sửa lỗi click-toggle và z-index của component dropdown 3 chấm.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

- Tự test lại trên cả Table View và Card View để đảm bảo dropdown hoạt động đúng ở cả hai chế độ hiển thị.

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | [DE180303] fix: three-dot action menu no longer flickers and is clickable |
| File liên quan | RoomHub.Frontend/src/pages/owner/ListingList.tsx |
| Kết quả chạy/test | Click dấu 3 chấm → menu hiện ra ổn định → click option → thực thi đúng action |

#### 4.6. Nhận xét cá nhân/nhóm

Lỗi z-index và event conflict là nhóm lỗi phổ biến trong các table component phức tạp. Bài học: luôn dùng click-toggle kết hợp click-outside handler cho dropdown menu trong bảng dữ liệu.

---

### Lần sử dụng AI số 5

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 04/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Thay thế window.alert/confirm bằng hệ thống Toast thông báo chuyên nghiệp |
| Phần việc liên quan | Frontend / UX / Notification System / Toast |
| Mức độ sử dụng | Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
...và khi thực hiện đăng tin thì khi nhấn nút đăng tin ngày thì tôi không muốn giao diện hiện ra localhost 5173 says, tôi muốn hiển thị đăng thành công chuyên nghiệp hơn và thực hiện tương tự cho các tính năng khác như thêm mới tài sản chẳng hạn đảm bảo không hiển thị localhost says...
```

#### 4.2. Kết quả AI gợi ý

AI xác định toàn bộ các `window.alert()`, `window.confirm()` còn tồn tại trong `ListingList.tsx`, `ListingCreate.tsx`, `PropertyCreate.tsx`, `UnitDetail.tsx` và thay thế bằng hệ thống Toast notification tự xây dựng: component `Toast` fly-in từ góc dưới-phải, auto-dismiss sau 3 giây, hỗ trợ 3 type: `success` (xanh lá), `error` (đỏ), `warning` (cam), với icon Material Symbol và animation slide-up mượt mà.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Sử dụng toàn bộ component Toast và hook `useToast()` mà AI xây dựng, tích hợp vào tất cả các Owner pages.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

- Tự kiểm tra và đảm bảo tất cả các `window.alert()`, `window.confirm()` đã được thay thế hoàn toàn trên mọi trang Owner.
- Bổ sung thêm Toast loại `info` màu xanh dương cho các thông báo trung tính.

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | [DE180303] feat: replace all window alerts with professional toast notification system |
| File liên quan | RoomHub.Frontend/src/components/owner/Toast.tsx, các Owner pages |
| Kết quả chạy/test | Đăng tin thành công → Toast xanh lá hiện "Đăng tin thành công!" tự biến mất sau 3 giây |

#### 4.6. Nhận xét cá nhân/nhóm

Việc loại bỏ `window.alert()` là tiêu chuẩn bắt buộc trong sản phẩm SaaS chuyên nghiệp. Hệ thống Toast mang lại trải nghiệm người dùng mượt mà và hiện đại hơn rất nhiều.

---

### Lần sử dụng AI số 6

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 04/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Sửa lỗi hai dropdown Chọn tòa nhà và Chọn phòng bị disabled trong ListingCreate |
| Phần việc liên quan | Frontend / ListingCreate / Form UX Bug Fix |
| Mức độ sử dụng | Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
hãy thực hiện cập nhật lại hiện tại hai mục Chọn tòa nhà / tài sản * và Chọn số phòng trống * đang bị ẩn đi không thể thực hiện thao tác chọn được
```

#### 4.2. Kết quả AI gợi ý

AI phân tích `ListingCreate.tsx` và phát hiện nguyên nhân: `isEditMode` bị set thành `true` ngay khi component mount do logic `loadInitialData()` kiểm tra `selectedListingId` không chính xác. Khi `isEditMode = true`, hai dropdown bị `disabled`. AI sửa: (1) Tách biệt rõ ràng trạng thái "tạo mới" và "chỉnh sửa"; (2) Chỉ set `isEditMode = true` khi có `listingId` hợp lệ và listing đã tồn tại trên server; (3) Đảm bảo khi navigate từ "Tạo tin mới" thì `selectedListingId = null` trước khi chuyển trang.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Sử dụng toàn bộ logic sửa `isEditMode` và cập nhật `loadInitialData()` trong `ListingCreate.tsx`.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

- Tự kiểm tra lại toàn bộ các navigation path dẫn đến `ListingCreate` (từ `ListingList.tsx`, `Dashboard.tsx`, `UnitDetail.tsx`) để đảm bảo `selectedListingId` được set/clear đúng.

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | [DE180303] fix: building and room dropdowns are now enabled in listing create form |
| File liên quan | RoomHub.Frontend/src/pages/owner/ListingCreate.tsx |
| Kết quả chạy/test | Vào trang Tạo tin mới → dropdown Chọn tòa nhà hiển thị → chọn tòa nhà → dropdown Chọn phòng cập nhật danh sách phòng trống |

#### 4.6. Nhận xét cá nhân/nhóm

Lỗi `isEditMode` gây ra do state management không rõ ràng giữa các luồng tạo mới và chỉnh sửa. Bài học quan trọng: luôn reset state khi navigate giữa các form modes.

---

### Lần sử dụng AI số 7

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 04/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Xóa mock listings cứng và sửa Tài sản liên kết lấy dữ liệu thực từ API |
| Phần việc liên quan | Frontend / ListingList / ListingCreate / API Integration |
| Mức độ sử dụng | Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
bây giờ đang có các vấn đề cần giải quyết cụ thể là bạn hãy giúp tôi xóa hết các phòng được fix cứng ở trang Tin cho thuê tôi muốn tự tay thêm các tin mới, tiếp theo là ở mục Tài sản liên kết hiện tại đang không lấy đúng các tài sản mà người chủ nhà có hãy cập nhật chỉnh sửa
```

#### 4.2. Kết quả AI gợi ý

AI (1) xóa toàn bộ mảng `mockListings` hardcoded trong `ListingList.tsx`, thay bằng state rỗng `[]` và gọi API `GET /api/owner/listings` khi component mount; (2) Trong `ListingCreate.tsx`, cập nhật section "Tài sản liên kết" để gọi API `GET /api/owner/properties` lấy danh sách tòa nhà thực tế của chủ nhà hiện tại thay vì dùng mock data; (3) Bổ sung loading skeleton và empty state "Bạn chưa có tin đăng nào" với nút Tạo tin mới.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Sử dụng toàn bộ bản xóa mock data và logic gọi API mới trong `ListingList.tsx` và `ListingCreate.tsx`.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

- Tự kiểm tra response API từ backend `PropertyService.cs` để đảm bảo mapping field `id`, `name`, `address` đúng với UI dropdown.
- Bổ sung xử lý lỗi 401 Unauthorized khi token hết hạn.

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | [DE180303] fix: remove hardcoded listings and fetch real owner properties in listing create |
| File liên quan | RoomHub.Frontend/src/pages/owner/ListingList.tsx, ListingCreate.tsx |
| Kết quả chạy/test | Vào Tin cho thuê → danh sách trống ban đầu; Vào Tạo tin → dropdown tòa nhà hiển thị đúng tài sản của chủ nhà |

#### 4.6. Nhận xét cá nhân/nhóm

Đây là bước chuyển đổi từ giao diện prototype (mock data) sang sản phẩm thực tế. Việc loại bỏ mock data hoàn toàn là cột mốc quan trọng trong quá trình phát triển RoomHub.

---

## 5. Mức độ sử dụng AI trong các hạng mục dự án

Đánh giá mức độ sử dụng AI của sinh viên/nhóm đối với từng hạng mục công việc.

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu |  |  | [x] |  | Phân tích vấn đề từ mô tả người dùng |
| Viết user story/use case | [x] |  |  |  | Không thực hiện đợt này |
| Database / ERD | [x] |  |  |  | Giữ nguyên từ đợt trước |
| Thiết kế kiến trúc hệ thống | [x] |  |  |  | Giữ nguyên từ đợt trước |
| Thiết kế giao diện |  | [x] |  |  | Chủ yếu sửa lỗi, không thiết kế mới |
| Code frontend |  |  |  | [x] | Sửa lỗi và tích hợp API cho các Owner pages |
| Code backend |  | [x] |  |  | Kiểm tra endpoint, bổ sung nếu cần |
| Debug lỗi |  |  | [x] |  | Xác định nguyên nhân và fix lỗi isEditMode, z-index, filter reset |
| Viết test case | [x] |  |  |  | Kiểm thử thủ công |
| Kiểm thử sản phẩm |  | [x] |  |  | Chạy dev server và test tay |
| Tối ưu code |  |  | [x] |  | Chuẩn hóa Toast system toàn bộ Owner pages |
| Viết báo cáo |  |  | [x] |  | Tạo tài liệu học thuật đợt 4 |
| Làm slide thuyết trình | [x] |  |  |  | Chưa thực hiện |

---

## 6. Các lỗi hoặc hạn chế từ AI

Ghi lại các trường hợp AI trả lời sai, thiếu, chưa phù hợp hoặc sinh code không chạy.

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | AI đề xuất dùng `position: absolute` cho dropdown 3 chấm nhưng bị cắt bởi `overflow: hidden` của table container | Kiểm tra tương tác thực tế trên giao diện | Chuyển sang `position: fixed` với tính toán tọa độ theo `getBoundingClientRect()` |
| 2 | API endpoint `/api/owner/dashboard` ban đầu chưa tồn tại trong backend, AI giả định endpoint đã có sẵn | Chạy dev server và kiểm tra network request → 404 | Kiểm tra `DashboardController.cs` và bổ sung endpoint thiếu |

---

## 7. Kiểm chứng kết quả AI

Mô tả cách sinh viên/nhóm kiểm tra lại kết quả do AI gợi ý.

- Chạy lệnh `npm run build` tại `RoomHub.Frontend/` để kiểm duyệt không phát sinh lỗi TypeScript.
- Khởi chạy dev server `npm run dev` và chạy backend `dotnet run` đồng thời để kiểm thử tích hợp API thực tế.
- Kiểm thử thủ công từng flow: Tạo tài sản → Vào Tin cho thuê (không tự động hiện) → Bấm Đăng tin → Toast thành công → Phòng chuyển trạng thái.

### Nội dung kiểm chứng

```text
Sau khi cập nhật, toàn bộ 7 lỗi/vấn đề được liệt kê đã được giải quyết hoàn toàn. Dashboard hiển thị đúng dữ liệu thực theo tài khoản đăng nhập. Bộ lọc Loại hình không còn bị reset. Dropdown 3 chấm hoạt động ổn định. Không còn window.alert(). Dropdowns Chọn tòa nhà và Chọn phòng có thể tương tác bình thường. Danh sách tin và tài sản liên kết đều lấy từ API thực.
```

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.1. Đối với bài cá nhân

N/A (Đồ án nhóm PRN232).

### 8.2. Đối với bài nhóm

| Thành viên | MSSV | Nhiệm vụ chính | Có sử dụng AI không? | Minh chứng đóng góp |
|---|---|---|---|---|
| Phan Hoài An | DE180303 | Phân tích và sửa lỗi toàn bộ Owner pages, tích hợp API thực tế, chuẩn hóa UX thông báo | Có | Đã đẩy các commit fix lỗi và tích hợp API lên Git |

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em/nhóm ở điểm nào?

```text
AI hỗ trợ phân tích nhanh nguyên nhân gốc rễ của từng lỗi (isEditMode, z-index, filter reset, mock data), đề xuất giải pháp chuẩn mực và viết lại mã nguồn đã được test kỹ lưỡng. Việc phân tích codebase lớn (nhiều file, nhiều component liên kết nhau) là điểm mà AI vượt trội so với việc tự tìm lỗi thủ công.
```

### 9.2. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
AI ban đầu đề xuất dùng thư viện bên ngoài (react-hot-toast) cho hệ thống Toast. Em quyết định tự xây dựng Toast component nội bộ để tránh phụ thuộc thư viện không cần thiết, giảm bundle size và có toàn quyền kiểm soát style theo thiết kế của dự án RoomHub.
```

### 9.3. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

```text
Thông qua kiểm thử tích hợp thực tế: chạy đồng thời Frontend dev server và Backend .NET API, thực hiện toàn bộ các user flow thực tế (đăng ký, đăng nhập, tạo tài sản, tạo phòng, đăng tin, lọc tin) và quan sát network requests trong DevTools để xác nhận API được gọi đúng với payload và response hợp lệ.
```

### 9.4. Nếu không có AI, phần nào sẽ khó khăn nhất?

```text
Việc tìm ra nguyên nhân gốc rễ của lỗi isEditMode trong ListingCreate.tsx rất khó nếu làm thủ công, vì lỗi không xuất hiện rõ ràng mà chỉ biểu hiện qua hành vi UI bất thường (dropdown bị disable). AI đã phân tích toàn bộ luồng state và xác định chính xác dòng code gây ra vấn đề trong vài phút.
```

### 9.5. Sau bài tập/project này, em/nhóm học được gì về môn học?

```text
Hiểu sâu hơn về tầm quan trọng của việc phân tách state rõ ràng (filter state vs. data state), nguyên tắc "không bao giờ dùng window.alert() trong sản phẩm thực tế", và cách kết nối Frontend React với Backend .NET API thông qua JWT Bearer Token một cách an toàn.
```

### 9.6. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

```text
Luôn kiểm tra xem API backend có thực sự tồn tại trước khi để AI viết code gọi API. AI có thể tự tin viết code gọi các endpoint chưa tồn tại, dẫn đến lỗi runtime khó phát hiện nếu không test tích hợp thực tế. Bài học: AI giỏi về Frontend logic nhưng cần sinh viên tự xác minh tính khả dụng của Backend API.
```

---

## 10. Cam kết học thuật

Sinh viên/nhóm cam kết rằng:

- Nội dung AI hỗ trợ đã được ghi nhận trung thực.
- Không nộp nguyên văn kết quả AI mà không kiểm tra.
- Có khả năng giải thích các phần đã nộp.
- Chịu trách nhiệm về tính đúng đắn của sản phẩm cuối cùng.
- Hiểu rằng việc sử dụng AI không khai báo có thể ảnh hưởng đến kết quả đánh giá.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phan Hoài An | 04/06/2026 |
