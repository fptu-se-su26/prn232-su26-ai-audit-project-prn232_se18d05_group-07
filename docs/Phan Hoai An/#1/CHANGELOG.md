# Changelog

## 1. Quy định ghi Changelog

File này dùng để ghi lại các thay đổi quan trọng trong quá trình thực hiện bài tập, lab, assignment hoặc project.

Nguyên tắc ghi changelog:

- Chỉ ghi những gì đã hoàn thành thật sự.
- Không ghi kế hoạch nếu chưa thực hiện.
- Mỗi thay đổi nên có ngày, nội dung, người thực hiện và minh chứng.
- Nếu có AI hỗ trợ, cần ghi rõ AI đã hỗ trợ phần nào.
- Nếu có commit GitHub, cần ghi link commit.
- Nếu có lỗi đã sửa, cần ghi rõ lỗi, nguyên nhân và cách xử lý.

---

## 2. Thông tin project

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
| Repository URL | https://github.com/fptu-se-su26/prn232-su26-ai-audit-project-prn232_se18d05_group-07 |
| Ngày bắt đầu | 28/05/2026 |
| Ngày hoàn thành | 28/05/2026 |

---

## 3. Tổng quan các phiên bản/giai đoạn

| Phiên bản/Giai đoạn | Thời gian | Nội dung chính | Trạng thái |
|---|---|---|---|
| Phase 01 | 28/05/2026 | Khởi tạo cấu trúc dự án phẳng (Backend & Frontend) | Completed |
| Phase 02 |  | Phân tích yêu cầu | Not Started |
| Phase 03 |  | Thiết kế hệ thống | Not Started |
| Phase 04 |  | Implementation | Not Started |
| Phase 05 |  | Testing & Debug | Not Started |
| Phase 06 |  | Hoàn thiện báo cáo và demo | Not Started |

---

# [Phase 01] Khởi tạo project

## Ngày thực hiện

```text
28/05/2026
```

## Đã hoàn thành

- [x] Tạo repository
- [x] Tạo cấu trúc thư mục project
- [x] Tạo file README.md
- [x] Tạo thư mục `docs/`
- [x] Tạo file `AI_AUDIT_LOG.md`
- [x] Tạo file `PROMPTS.md`
- [x] Tạo file `REFLECTION.md`
- [x] Tạo file `CHANGELOG.md`
- [x] Khởi tạo source code ban đầu
- [x] Cài đặt thư viện/công cụ cần thiết
- [x] Cấu hình môi trường chạy project

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Khởi tạo solution `RoomHub.sln` và 4 dự án con theo Clean Architecture tại root | Phan Hoài An | `RoomHub.Backend/` | Commit Git |
| 2 | Cài đặt các gói NuGet cốt lõi cho các lớp Backend (`MediatR`, `EFCore.SqlServer`...) | Phan Hoài An | `RoomHub.Backend/*.csproj` | Commit Git |
| 3 | Tạo toàn bộ hệ thống thư mục con (`Entities`, `Repositories`, `Controllers`...) và tệp `.gitkeep` | Phan Hoài An | `RoomHub.Backend/` | Commit Git |
| 4 | Loại bỏ các file rác boilerplate (`Class1.cs`) | Phan Hoài An | `RoomHub.Backend/` | Commit Git |
| 5 | Khởi tạo dự án Frontend React TS bằng Vite, cài `axios`, `react-router-dom`, `lucide-react` | Phan Hoài An | `RoomHub.Frontend/` | Commit Git |
| 6 | Tạo cấu trúc thư mục con Frontend (`components`, `pages`, `services`...) và tệp `.gitkeep` | Phan Hoài An | `RoomHub.Frontend/` | Commit Git |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI trợ lý Antigravity hỗ trợ thiết kế sơ đồ phân lớp Clean Architecture dạng phẳng đặt trực tiếp tại thư mục gốc của repository. Đồng thời, AI tự động thực thi các dòng lệnh CLI để tạo toàn bộ solution, projects, thiết lập reference, cài đặt nuget/npm và tạo hàng loạt thư mục con đồng bộ.
```

## Commit/Screenshot minh chứng

```text
N/A
```

## Ghi chú

```text
Cấu trúc phẳng (Flat Root Structure) này giúp dự án rất thông thoáng, dễ làm việc độc lập và quản lý code/tài liệu của từng cá nhân hiệu quả hơn.
```

---

# [Phase 02] Phân tích yêu cầu

## Ngày thực hiện

```text
N/A
```

## Đã hoàn thành

- [ ] Xác định problem statement
- [ ] Xác định user roles
- [ ] Viết user stories
- [ ] Viết use cases
- [ ] Xác định functional requirements
- [ ] Xác định non-functional requirements
- [ ] Xác định business rules
- [ ] Xác định acceptance criteria
- [ ] Review yêu cầu với giảng viên/nhóm
- [ ] Chỉnh sửa yêu cầu sau feedback

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 |  |  |  |  |

## AI có hỗ trợ không?

- [ ] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
Chưa thực hiện
```

## Commit/Screenshot minh chứng

```text
Chưa thực hiện
```

## Ghi chú

```text
Chưa thực hiện
```

---

# [Phase 03] Thiết kế hệ thống

## Ngày thực hiện

```text
N/A
```

## Đã hoàn thành

- [ ] Thiết kế kiến trúc tổng quan
- [ ] Thiết kế database/ERD
- [ ] Thiết kế API
- [ ] Thiết kế giao diện/wireframe
- [ ] Thiết kế flow xử lý
- [ ] Thiết kế class diagram
- [ ] Thiết kế sequence diagram
- [ ] Thiết kế security/authorization flow
- [ ] Review thiết kế
- [ ] Chỉnh sửa thiết kế sau feedback

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 |  |  |  |  |

## AI có hỗ trợ không?

- [ ] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
Chưa thực hiện
```

## Commit/Screenshot minh chứng

```text
Chưa thực hiện
```

## Ghi chú

```text
Chưa thực hiện
```

---

# [Phase 04] Implementation

## Ngày thực hiện

```text
N/A
```

## Đã hoàn thành

- [ ] Tạo project structure
- [ ] Cài đặt database connection
- [ ] Xây dựng backend
- [ ] Xây dựng frontend
- [ ] Xây dựng authentication/authorization
- [ ] Xử lý CRUD
- [ ] Xử lý validation
- [ ] Tích hợp API
- [ ] Xử lý upload/download file
- [ ] Xử lý lỗi
- [ ] Tối ưu giao diện
- [ ] Cập nhật README hướng dẫn chạy

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 |  |  |  |  |

## AI có hỗ trợ không?

- [ ] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
Chưa thực hiện
```

## Commit/Screenshot minh chứng

```text
Chưa thực hiện
```

## Ghi chú

```text
Chưa thực hiện
```

---

# [Phase 05] Testing & Debug

## Ngày thực hiện

```text
N/A
```

## Đã hoàn thành

- [ ] Viết test case
- [ ] Chạy test chức năng chính
- [ ] Kiểm tra output
- [ ] Kiểm tra validation
- [ ] Kiểm tra lỗi giao diện
- [ ] Kiểm tra lỗi database
- [ ] Kiểm tra phân quyền
- [ ] Kiểm tra bảo mật cơ bản
- [ ] Fix bug
- [ ] Chạy lại sau khi fix bug
- [ ] Ghi nhận kết quả test

## Danh sách lỗi đã xử lý

| STT | Lỗi phát hiện | Nguyên nhân | Cách xử lý | Trạng thái |
|---:|---|---|---|---|
| 1 |  |  |  | Open / Fixed / Pending |

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 |  |  |  |  |

## AI có hỗ trợ không?

- [ ] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
Chưa thực hiện
```

## Commit/Screenshot minh chứng

```text
Chưa thực hiện
```

## Ghi chú

```text
Chưa thực hiện
```

---

# [Phase 06] Hoàn thiện báo cáo và demo

## Ngày thực hiện

```text
N/A
```

## Đã hoàn thành

- [ ] Hoàn thiện source code
- [ ] Hoàn thiện README.md
- [ ] Hoàn thiện report
- [ ] Hoàn thiện slide
- [ ] Hoàn thiện video demo
- [ ] Kiểm tra lại `AI_AUDIT_LOG.md`
- [ ] Kiểm tra lại `PROMPTS.md`
- [ ] Hoàn thiện `REFLECTION.md`
- [ ] Kiểm tra lại `CHANGELOG.md`
- [ ] Đóng gói bài nộp

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 |  |  |  |  |

## AI có hỗ trợ không?

- [ ] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
Chưa thực hiện
```

## Commit/Screenshot minh chứng

```text
Chưa thực hiện
```

## Ghi chú

```text
Chưa thực hiện
```

---

## 4. Tổng kết thay đổi cuối project

### 4.1. Các chức năng đã hoàn thành

| STT | Chức năng | Trạng thái | Minh chứng | Ghi chú |
|---|---|---|---|---|
| 1 | Khởi tạo cấu trúc Backend Clean Architecture phẳng | Completed | dotnet build thành công | Sẵn sàng lập trình |
| 2 | Khởi tạo cấu trúc Frontend React TS Vite phẳng | Completed | npm run build thành công | Sẵn sàng lập trình |

---

### 4.2. Các chức năng chưa hoàn thành

| STT | Chức năng | Lý do chưa hoàn thành | Hướng cải thiện |
|---|---|---|---|
| 1 | Nghiệp vụ RoomHub (Login, Register, Rooms...) | Thuộc về các phase sau | Sẽ thực hiện ở các phase phát triển nghiệp vụ |

---

### 4.3. Tổng hợp AI hỗ trợ trong project

| Hạng mục | AI có hỗ trợ không? | Mức độ hỗ trợ | Ghi chú |
|---|---|---|---|
| Requirement | Có | Trung bình | Tham khảo ý nghĩa tài liệu |
| Design | Có | Nhiều | Thiết kế sơ đồ folder |
| Database | Không | N/A | Sẽ làm sau |
| Coding | Có | Nhiều | Thực thi CLI tự động và setup boilerplate |
| Debug | Không | N/A | Không có lỗi phát sinh |
| Testing | Có | Ít | Phối hợp chạy dotnet build / npm run build |
| Report | Có | Trung bình | Hỗ trợ điền tài liệu học thuật đợt 1 |
| Presentation | Không | N/A | Chưa thực hiện |

---

### 4.4. Bài học rút ra

```text
Khởi tạo cấu trúc chuẩn và sạch sẽ ngay từ đầu giúp loại bỏ rất nhiều rủi ro về dependency conflict sau này. Đồng thời, cấu trúc thư mục phẳng ở thư mục gốc giúp các thành viên nhóm làm việc độc lập hiệu quả, giảm thiểu conflict git.
```

---

### 4.5. Hướng cải thiện tiếp theo

```text
Thiết kế ERD cơ sở dữ liệu chi tiết cho dự án RoomHub và lập trình thực thể Entity trong RoomHub.Domain.
```

---

## 5. Cam kết cập nhật Changelog

Sinh viên/nhóm cam kết rằng nội dung changelog phản ánh đúng các thay đổi đã thực hiện trong quá trình làm bài tập/project.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phan Hoài An | 28/05/2026 |
