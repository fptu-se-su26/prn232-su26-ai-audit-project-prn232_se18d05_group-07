# Prompt Log

## 1. General Information

| Field | Value |
|---|---|
| Course | C# Programming |
| Course Code | PRN232 |
| Class | SE18D05 |
| Semester | SU26 |
| Assignment / Project | RoomHub - Rental Room Management Platform |
| Student / Group | Do Thanh Tin / Group 07 |
| Student ID | DE180794 |
| Instructor | Mr. Le Thien Nhat Quang |
| Start Date | 26/07/2026 |
| Last Updated | 26/07/2026 |

---

## 2. AI Tools Used

- [x] Claude (Claude Code)

---

## 3. Prompt Summary Table

| No. | Date | AI Tool | Purpose | Prompt Summary | Main Result | Applied? |
|---:|---|---|---|---|---|---|
| 1 | 26/07 | Claude | Analysis | Suggest additions that complete existing features | 7 ranked enhancements; found 3 breaks in the operational loop | Yes |
| 2 | 26/07 | Claude | Risk review | Do these break existing logic? | 5 safe / 2 risky; 2 deferred to a separate issue | Yes |
| 3 | 26/07 | Claude | Planning | Write a feature prompt + branch plan | Feature prompt, file list, branch naming | Yes |
| 4 | 26/07 | Claude | Build | Implement Owner Reports | Backend + Excel + frontend, 0 build errors | Yes |
| 5 | 26/07 | Claude | Testing | Unit tests incl. owner isolation | 9 tests, 62/62 passing | Yes |
| 6 | 26/07 | Claude | Commits & docs | Split commits, draft audit files | Concern-based commits + these documents | Yes |

---

## 4. Detailed Prompts

### Prompt #1 — Ask for completing existing features

```text
đề xuất cho tôi các tính năng hoặc bổ sung dựa trên các tính năng trước để
project trở nên hoàn thiện hơn
```

**Result:** Rather than listing new modules, the AI searched the codebase for half-finished work and reported that the rental operating loop is broken in three places:

```
Listing → Viewing → Deposit → ❌ → Contract → ❌ → Utility reading → ❌ → Invoice → Payment
```

It produced seven enhancement areas backed by concrete findings, e.g. there is only **one** background job in the whole system (`DepositExpiryHostedService`), `MaintenanceTicket.AssignedTo` has a column and an index but is never used in the Application layer, and `SearchHistory` / `FavoriteRoom` / `IEmbeddingService` all collect data that is never used for recommendations.

---

### Prompt #2 — Regression check (the decisive prompt)

```text
mấy cái này có phá hủy đi logic cũ trước đó không
```

**Result:** This changed the plan. The AI re-read the code and corrected two of its own earlier statements:

1. `ContractStatus.Renewed` / `Expired` are **not dead** — they are read at `ReviewRepository.cs:83-85`, just never written. Enabling an auto-expiry job would activate a dormant branch and could revoke tenant chat access and service-request access, because `ContractStatus.Active` is filtered in roughly 12 places.
2. `SubscriptionService.cs:52-56` already writes `CurrentPlan = Free` lazily, so a background job would be a *second* writer for the same field.

It classified 5 of 7 items as zero/low risk and recommended **separating "reminders" (read-only, safe) from "status changes" (risky)**. I accepted this and chose the read-only reporting feature to go first.

---

### Prompt #3 — Branch convention and per-feature prompts

```text
ok hãy viết prompt về thực hiện 7 chức năng đó một cách an toàn và làm nó
bạn biết tôi là Do Thanh Tin và khi tạo nhánh phải là de180794- rồi chứ
nếu là bổ sung thì trước de180794 sẽ là gì
với mỗi chức năng sẽ được tạo nhánh riêng và commit lên
```

**Result:** The AI confirmed from `SKILL.md` that the team only uses four branch prefixes (`feature/`, `bugfix/`, `docs/`, `test/`), so an enhancement still uses **`feature/`** — there is no `enhance/` or `refactor/` at branch level. It produced a master prompt covering all seven features with a shared safety section, and named the seven branches in risk order.

---

### Prompt #4 — Start the first feature

```text
ok bây giờ trước mắt bỏ qua nhánh hiện tại tạo nhánh mới từ nhánh main
sau đó viết prompt cho từng feature của nhánh đó
sau đó thực hiện viết code và viết file .md trong docs Do Thanh Tin
sau đó chia nhỏ từng mục cụ thể để commit
```

**Result:** Created `feature/de180794-owner-reports` from an up-to-date `main`, wrote the feature prompt below, listed the files to add before coding, then implemented.

---

### Prompt #5 — The feature prompt used for implementation

```text
# PROMPT — Feature ①: Báo cáo cho chủ trọ (Owner Reports)

## VAI TRÒ
Senior .NET + React engineer trên repo RoomHub. Ưu tiên: bám kiến trúc sẵn có,
KHÔNG gây hồi quy, code đọc giống code xung quanh.

## BỐI CẢNH
- Nhánh: feature/de180794-owner-reports (đã tạo từ main @ a82e063)
- Người làm: Đỗ Thanh Tín — DE180794 — Issue #63
- Stack: .NET 10 Clean Architecture 4 tầng, EF Core, React 19 + TS + Vite + Tailwind
- Excel: EPPlus 8.6 đã có sẵn trong dự án

Vấn đề: DashboardService chỉ trả vài con số tổng quan. Chủ trọ KHÔNG có báo cáo nào:
không biết doanh thu theo tháng, không biết tỉ lệ lấp đầy từng tòa, không có danh sách công nợ.

## YÊU CẦU
3 báo cáo: Doanh thu (theo tháng) / Tỉ lệ lấp đầy (theo tòa nhà) / Công nợ (hóa đơn chưa thu).
Xuất Excel: một endpoint trả workbook 3 sheet bằng EPPlus, tái dùng cách làm ở
InvoiceService.GenerateExcelBytesAsync.

API — tất cả [Authorize(Roles = "PropertyOwner")]:
  GET /api/owner/reports/revenue?fromMonth&fromYear&toMonth&toYear&buildingId?
  GET /api/owner/reports/occupancy?buildingId?
  GET /api/owner/reports/debt?buildingId?
  GET /api/owner/reports/export?...  → .xlsx
ownerId lấy từ claim NameIdentifier, KHÔNG nhận từ query.

Frontend: services/reports.ts + pages/owner/Reports.tsx + route + link menu owner.

## RÀNG BUỘC (quan trọng nhất)
Đây là feature rủi ro 🟢 — phải giữ đúng như vậy:
1. KHÔNG sửa bất kỳ service/repository nào đang có. Dùng nguyên 3 hàm sẵn có:
   GetBuildingsByOwnerAsync / GetInvoicesByOwnerAsync / GetContractsByOwnerAsync.
   Nếu thấy cần method repository mới → DỪNG LẠI VÀ BÁO.
2. KHÔNG thêm migration. Feature này thuần đọc.
3. File cũ chỉ được đụng: DependencyInjection.cs, App.tsx, menu owner.
4. Cách ly dữ liệu: chủ trọ A không được thấy dữ liệu của chủ trọ B.
5. Không commit bin/, obj/, node_modules/. Domain không tham chiếu Infrastructure.

## KIỂM THỬ
xUnit, fake thủ công (dự án không dùng Moq — theo mẫu FavoriteRoomServiceTests).
Bắt buộc: cộng đúng theo trạng thái; lọc đúng khoảng thời gian; không chia cho 0;
công nợ chỉ Unpaid/Overdue; lọc buildingId; cách ly ownerId.

## ĐẦU RA
Liệt kê file trước khi code. Build sạch, test pass.
Chia commit theo mối quan tâm. Mỗi commit: [DE180794] <type>: <mô tả> + Refs #63,
KHÔNG có Co-Authored-By.
```

**Result:** The AI listed the 10 new files before coding, then implemented all of them.

It reported one deviation before starting: `App.tsx` uses a hash-based `PageType` state machine rather than react-router paths, so it needed **4 added lines** instead of 1. Still additive only.

It also hit and solved one real constraint during implementation: EF **lazy loading is not enabled**, and `GetInvoicesByOwnerAsync` does not `Include` `Contract.Tenant`, so tenant names would have come back `null`. Rather than modify the repository (which constraint #1 forbids), it joined the invoice list against `GetContractsByOwnerAsync` — which *does* include `Tenant` — using `ContractId`.

Verification: backend build 0 errors, `tsc --noEmit` 0 errors, 62/62 tests passing.

---

## 5. Notes on Verification

- The API was running during development and locked the output DLLs. Builds were directed to a temporary output folder instead of terminating the running process.
- I confirmed no migration was created and `git status` shows no changes to any pre-existing service or repository file — only `DependencyInjection.cs`, `App.tsx`, and `OwnerLayout.tsx` were touched, each additively.
