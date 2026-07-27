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
| Start Date | 27/07/2026 |
| Last Updated | 27/07/2026 |

---

## 2. AI Tools Used

- [x] Claude (Claude Code)

---

## 3. Prompt Summary Table

| No. | Date | AI Tool | Purpose | Prompt Summary | Main Result | Applied? |
|---:|---|---|---|---|---|---|
| 1 | 27/07 | Claude | Build | Continue with the contract-lifecycle branch | QuestPDF, reminder job, 3 endpoints | Yes |
| 2 | 27/07 | Claude | Design | Keep the job read-only | Constraint stated in 3 places + regression test | Yes |
| 3 | 27/07 | Claude | Testing | Prove Status is never written | 11 tests; **found a real milestone bug** | Yes |
| 4 | 27/07 | Claude | Commits & docs | Split commits, draft audit files | Concern-based commits + these documents | Yes |

---

## 4. Detailed Prompts

### Prompt #1 — Start the feature

```text
Làm tiếp Feature ③ (feature/de180794-contract-lifecycle
```

**Result:** The AI created the branch from an updated `main`, then investigated before coding: it read `DepositExpiryHostedService` for the background-job pattern, traced how `Contract.SignaturePath` is produced (`TenantRoomController` uploads a PNG and stores the returned URL), and checked whether the two target pages carry a `ContractId` (they do not).

---

### Prompt #2 — The feature prompt used for implementation

```text
# PROMPT — Feature ③: Hoàn thiện vòng đời hợp đồng (PDF + nhắc hạn)

## BỐI CẢNH
- Nhánh: feature/de180794-contract-lifecycle (từ main @ e8417a8)
- Đỗ Thanh Tín — DE180794 — Issue #67

Đã có: tạo / ký (SignaturePad) / chấp nhận / từ chối / thanh lý hợp đồng.
Thiếu: không xuất được PDF (hóa đơn có Excel, hợp đồng không có gì);
không ai nhắc hợp đồng sắp hết hạn.

## YÊU CẦU
1. Xuất PDF hợp đồng — thông tin hai bên, phòng, thời hạn, tiền thuê/cọc,
   chi phí dịch vụ, điều khoản, KÈM ẢNH CHỮ KÝ.
2. Nhắc sắp hết hạn ở mốc 30 / 15 / 7 ngày, gửi cho CẢ HAI BÊN.
3. Chống gửi trùng.

## RÀNG BUỘC QUAN TRỌNG NHẤT
⚠️ TUYỆT ĐỐI KHÔNG ghi Contract.Status — không Expired, không Renewed.

Lý do: ContractStatus.Renewed/Expired tuy chưa bao giờ được GHI nhưng vẫn ĐANG
ĐƯỢC ĐỌC ở ReviewRepository.cs:83-85 (xét quyền đánh giá). Ngoài ra
ContractStatus.Active bị lọc ở khoảng 12 nơi: ChatAccessRepository (quyền chat),
ServiceRequestRepository (quyền gửi yêu cầu dịch vụ), PropertyService,
ViewingWorkflowService, ContractRepository. Ghi Expired sẽ đánh thức code đang
ngủ và có thể tước quyền chat / gửi yêu cầu / đánh giá của người thuê.

Việc tự động đổi trạng thái tách sang Issue riêng.

## RÀNG BUỘC KHÁC
- Job chạy 1 lần/ngày, theo mẫu DepositExpiryHostedService sẵn có.
- Không sửa service/repository cũ nếu tránh được.
- Migration chỉ được TẠO BẢNG MỚI, không đụng bảng cũ.
- Không commit bin/, obj/, node_modules/.

## KIỂM THỬ (bắt buộc)
1. ⚠️ SAU KHI JOB CHẠY, Contract.Status PHẢI KHÔNG ĐỔI — test chống hồi quy
2. Đúng mốc: còn 7 ngày → mốc 7, còn 9 ngày → mốc 15, còn 22 ngày → mốc 30
3. Chạy 2 lần không gửi trùng
4. Hợp đồng ngoài cửa sổ 30 ngày / không Active / đã xoá → bỏ qua
5. Thông báo tới cả chủ trọ và người thuê
6. Hợp đồng không có tài khoản người thuê → chỉ báo chủ trọ

## ĐẦU RA
Build sạch, test pass. Commit tách theo mối quan tâm,
[DE180794] <type>: <mô tả> + Refs #67, KHÔNG Co-Authored-By.
```

**Result:** Implemented as specified. The read-only constraint is restated in the interface XML doc, the service class comment and the hosted service comment, so it survives future edits.

---

## 5. What the Tests Caught

The first test run was **5 failed / 79 passed**, from a real bug in the generated code:

```csharp
private static readonly int[] Milestones = { 30, 15, 7 };
var milestone = Milestones.FirstOrDefault(m => daysLeft <= m);
```

For a contract 7 days from expiry, `7 <= 30` matches first, so **every** contract was recorded as a 30-day reminder. Worse, the unique log row then blocked the 15-day and 7-day reminders from ever firing — so tenants would have received exactly one reminder, at the wrong milestone.

**Fix:** order the array ascending (`{ 7, 15, 30 }`) so the tightest milestone reached is selected. A comment now explains why the order matters.

This is why milestone selection was tested as a `[Theory]` over six different day-counts rather than a single happy-path case.

**Final:** 84 passed / 0 failed.

---

## 6. Constraints Solved Without Modifying Existing Files

| Constraint found | How it was handled |
|---|---|
| `IContractRepository` methods are all owner-scoped, unusable for a global expiry scan | Put `ContractReminderService` in Infrastructure with direct `ApplicationDbContext` access, following the existing `ViewingWorkflowService` precedent |
| `TenantRoomDto` carries no `ContractId`, so neither page can call `/contracts/{id}/pdf` | Added two resolver endpoints (`my-active/pdf`, `by-room/{roomId}/pdf`) instead of changing the DTO and its mapping |
| `SignaturePath` is a URL, so embedding it needs a network call that can fail | 5-second timeout; on failure the PDF still generates with "(Đã ký điện tử)" text instead of the image |
| Test project had no `DbContext` infrastructure | Added `Microsoft.EntityFrameworkCore.InMemory` (test project only) |

---

## 7. Notes on Verification

- The generated migration `AddContractReminderLog` **creates one table and alters nothing** — I read it to confirm.
- `git diff` on pre-existing files shows additions only.
- The API was running and locking DLLs, so builds were directed to a temporary output folder rather than terminating it.
