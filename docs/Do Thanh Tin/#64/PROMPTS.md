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
| 1 | 26/07 | Claude | Build | Continue with the recommendations branch | Investigated embeddings, proposed 2 deviations | Yes |
| 2 | 26/07 | Claude | Design | Scoring model & API shape | Two 100-point scoring functions + `Reason` field | Yes |
| 3 | 26/07 | Claude | Build | Backend + reusable frontend row | Service, controller, `RecommendationRow` on 3 pages | Yes |
| 4 | 26/07 | Claude | Testing | Offline unit tests | 9 tests, 71/71 passing | Yes |
| 5 | 26/07 | Claude | Commits & docs | Split commits, draft audit files | Concern-based commits + these documents | Yes |

---

## 4. Detailed Prompts

### Prompt #1 — Start the feature

```text
tiếp tục với feature/de180794-personalized-recommendations
```

**Result:** Before writing any code the AI read `RoomAssistantService.GetRoomEmbeddingsAsync` and reported two findings that changed the approved plan (see section 5). It then produced the feature prompt below and implemented against it.

---

### Prompt #2 — The feature prompt used for implementation

```text
# PROMPT — Feature ②: Gợi ý cá nhân hoá (Personalized Recommendations)

## BỐI CẢNH
- Nhánh: feature/de180794-personalized-recommendations (từ main @ 85524a4)
- Đỗ Thanh Tín — DE180794 — Issue #64

Vấn đề: SearchHistory, FavoriteRoom thu thập dữ liệu từ lâu nhưng CHƯA TỪNG được
dùng để gợi ý gì. Trang chủ và trang chi tiết phòng không có bất kỳ gợi ý nào.

## YÊU CẦU
1. "Gợi ý cho bạn" — dựng khẩu vị từ phòng đã lưu (trọng số 3) + phòng đã xem
   (trọng số 1) → suy ra quận ưa thích, khoảng giá, loại phòng. Loại phòng đã lưu / vừa xem.
2. "Phòng tương tự" — cho một phòng bất kỳ, tìm phòng giống nhất.
3. Chưa đăng nhập hoặc chưa có lịch sử → trả tin nổi bật, KHÔNG lỗi, KHÔNG rỗng.
4. Mỗi gợi ý kèm LÝ DO hiển thị được ("Cùng khu vực Hải Châu", "Giá tương đương").

### API
GET /api/recommendations/for-you?take=6            [AllowAnonymous]
GET /api/recommendations/similar/{roomId}?take=6   [AllowAnonymous]

### Frontend
services/recommendations.ts, components/RecommendationRow.tsx,
gắn vào Home.tsx, cuối RoomDetail.tsx, tenant/Dashboard.tsx

## HAI ĐIỀU CHỈNH SO VỚI MASTER PROMPT (có lý do)
1. KHÔNG dùng embedding — dùng chấm điểm tất định.
   Embedding không lưu trong DB, chỉ cache RAM 6 giờ rồi gọi Gemini theo batch khi
   thiếu → đốt quota mỗi lần cache nguội. Mà "phòng tương tự" là bài toán trên dữ
   liệu CÓ CẤU TRÚC, không phải văn bản tự do. Chấm điểm tất định cho kết quả tốt
   tương đương, tốn 0 token, test được offline, giải thích được trước hội đồng.
2. KHÔNG dùng IMemoryCache.
   Cache tồn tại để chắn API embedding. Không còn embedding thì không còn lý do cache.

## RÀNG BUỘC
1. KHÔNG sửa service/repository nào đang có. Lấy ứng viên qua SearchPublicListingsAsync.
   Lưu ý PageSize bị clamp tối đa 50 → gọi theo từng quận ưa thích, tối đa 4 lượt.
2. KHÔNG migration.
3. MapToSummary trong PublicListingService là private → KHÔNG tái dùng được.
   Làm DTO riêng RecommendedRoomDto (kèm Reason) thay vì sửa file cũ.
4. File cũ chỉ đụng: DependencyInjection.cs, Home.tsx, RoomDetail.tsx,
   tenant/Dashboard.tsx — chỉ thêm, không sửa logic sẵn có.
5. Không lộ phòng chưa duyệt / đã ẩn / đã xoá.

## KIỂM THỬ
xUnit, fake thủ công. Bắt buộc:
1. Chưa đăng nhập → trả tin nổi bật, không lỗi
2. Có lịch sử → phòng cùng quận + cùng tầm giá xếp trên
3. Phòng đã lưu / vừa xem bị loại khỏi gợi ý
4. "Phòng tương tự" không bao giờ chứa chính nó
5. Phòng đã lưu có trọng số cao hơn phòng chỉ xem
6. Không có ứng viên → trả danh sách rỗng, không ném lỗi

## ĐẦU RA
Build sạch, test pass. Commit tách theo mối quan tâm,
[DE180794] <type>: <mô tả> + Refs #64, KHÔNG Co-Authored-By.
```

**Result:** Implemented as specified. Backend build 0 errors, `tsc --noEmit` 0 errors, 71/71 tests passing.

---

## 5. Deviations From the Previously Approved Plan

Both were reported to me **before** any code was written, with the evidence that motivated them.

### Deviation 1 — No embeddings

The master prompt said "cosine similarity trên embedding". The AI checked the actual implementation first:

- A repo-wide search for an embedding field in `RoomHub.Domain` and `Persistence` found **nothing** — vectors are not persisted.
- `RoomAssistantService.GetRoomEmbeddingsAsync` keeps them in `IMemoryCache` for 6 hours (`emb:room:{id}:{hash}`) and calls `EmbedBatchAsync` for every miss.

A public "similar rooms" widget would therefore trigger Gemini batch calls on every cold cache. Since "similar rooms" compares **structured attributes** (district, price, type, area, amenities) rather than free text, deterministic scoring gives comparable quality for zero tokens, runs faster, and can be unit-tested without network access.

Embeddings remain in use by the AI search assistant, which is genuinely a free-text problem.

### Deviation 2 — No `IMemoryCache`

The cache in the master prompt existed solely to shield the embedding API. With embeddings gone the justification disappears, and removing it avoids stale suggestions and avoids adding `Microsoft.Extensions.Caching` to `RoomHub.Application` (which currently references only EPPlus and the Domain project).

---

## 6. Constraints Discovered During Implementation

Each was solved without modifying an existing file:

| Constraint found | How it was handled |
|---|---|
| `SearchPublicListingsAsync` clamps `PageSize` to 50 | One query per preferred district (max 3) + one unfiltered query, de-duplicated by room id |
| `PublicListingService.MapToSummary` is `private` | Built a purpose-specific `RecommendedRoomDto` with a `Reason` field instead of widening access |
| `SearchHistoryRepository` does not include `ViewedRoom.Floor.Building` | Viewed rooms contribute price/type/area only; district comes from favourites, which do include the building. Documented in a code comment. |

---

## 7. Notes on Verification

- I confirmed `git diff` shows only additions to the four pre-existing files touched — **13 insertions, 0 deletions** — and no migration was created.
- The API was running during development and locked the output DLLs, so builds were directed to a temporary output folder rather than terminating it.
