---
name: commit-audit-log
description: >
  Quy trình chuẩn của nhóm SE18D05-07 cho mỗi task PRN232: tạo Issue → nhánh →
  commit đúng convention → PR, KÈM cách dùng AI để soạn 4 file audit
  (AI_AUDIT_LOG, PROMPTS, CHANGELOG, REFLECTION) một cách trung thực.
  Dùng khi bắt đầu hoặc kết thúc một task/Issue được giao.
---

# Skill — Commit chuẩn nhóm & soạn AI Audit Log

> Tài liệu này để **gửi cho các thành viên trong nhóm** dùng chung. Có thể đọc trực tiếp,
> hoặc copy thư mục `commit-audit-log/` vào `.claude/skills/` để Claude Code gọi như một skill.

---

## 0. Thông tin nhóm

| Mục | Giá trị |
|---|---|
| Repo | `fptu-se-su26/prn232-su26-ai-audit-project-prn232_se18d05_group-07` |
| Nhánh chính | `main` (chỉ merge qua Pull Request, KHÔNG push thẳng) |
| MSSV cá nhân | Dạng `DExxxxxx` — thay vào mọi chỗ ghi `<MSSV>` bên dưới |

---

## 1. Quy trình Git của nhóm (làm theo đúng thứ tự)

### Bước 1 — Tạo Issue trước khi làm
Mỗi task **phải có 1 Issue** trên GitHub (đúng yêu cầu của nhóm để giảng viên dễ soi).

```bash
gh issue create \
  --title "[Task] <mô tả ngắn task>" \
  --body "## Mục tiêu
<mô tả>

## Phạm vi
- ...

Người thực hiện: <Họ tên> (<MSSV>)"
```
> Ghi lại **số Issue** trả về (ví dụ `#16`) để tham chiếu trong commit/PR.

### Bước 2 — Cập nhật main & tạo nhánh riêng
```bash
git checkout main
git pull
git checkout -b feature/<mssv-thường>-<mô-tả-gạch-nối>
# ví dụ: feature/de180336-complete-missing-ui
```

### Bước 3 — Code, rồi commit theo convention
- **Mẫu commit:** `[<MSSV>] <type>: <mô tả>`
- **type** theo conventional commits: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`.
- Tách commit theo mối quan tâm (code riêng, tài liệu riêng).
- **Thêm dòng `Refs #<issue>`** ở cuối để liên kết Issue.

```bash
git add <đúng file của bạn>        # tránh add nhầm bin/obj, node_modules
git commit -m "[<MSSV>] feat: <mô tả>" -m "- gạch đầu dòng chi tiết
- ...

Refs #<issue>"
```

> ⚠️ **Quy ước nhóm:** KHÔNG thêm dòng `Co-Authored-By:` (kể cả co-author AI) vào commit.
> Việc dùng AI được khai báo **minh bạch trong các file audit** (mục 2) — đó là kênh
> khai báo chính thức, nên git history giữ sạch.

### Bước 4 — Push & mở Pull Request
```bash
git push -u origin feature/<mssv-thường>-<mô-tả-gạch-nối>

gh pr create --base main \
  --head feature/<mssv-thường>-<mô-tả-gạch-nối> \
  --title "[<MSSV>] <type>: <mô tả>" \
  --body "Closes #<issue>

## Nội dung
...

## Kiểm thử
- ...

Người thực hiện: <Họ tên> (<MSSV>)"
```
- `Closes #<issue>` để PR tự đóng Issue khi merge.
- Chờ review → merge trên GitHub. **Không tự merge** nếu nhóm yêu cầu review.

### Checklist Git
- [ ] Đã tạo Issue
- [ ] Nhánh đúng `feature/<mssv>-...`
- [ ] Commit có prefix `[<MSSV>]` + `Refs #<issue>`
- [ ] KHÔNG có `Co-Authored-By`
- [ ] KHÔNG commit `bin/`, `obj/`, `node_modules/`
- [ ] PR có `Closes #<issue>`

---

## 2. Dùng AI để soạn 4 file Audit (TRUNG THỰC)

Mỗi task có 4 file trong `docs/<Họ tên>/#<issue>/`:
`AI_AUDIT_LOG.md`, `PROMPTS.md`, `CHANGELOG.md`, `REFLECTION.md`.

### Nguyên tắc vàng (đọc kỹ — đây là môn *AI audit*)
1. **Ghi đúng sự thật:** AI thực sự đã hỗ trợ gì, bạn tự làm gì, có tham khảo nguồn nào.
2. **Không bịa quy trình:** chỉ ghi việc đã thực sự xảy ra và đã hoàn thành.
3. **Tự review & ký:** đọc lại, hiểu được mọi phần, sửa cho đúng giọng của mình rồi mới ký.
4. **Ghi rõ nguồn tham khảo** (nếu có dùng code/ý tưởng của người khác) — minh bạch là an toàn.
5. AI chỉ **soạn nháp**; trách nhiệm cuối cùng là của bạn.

### Quy trình đề xuất
1. Làm task trước (code/tài liệu).
2. Đưa cho AI bối cảnh thật: prompt bạn đã dùng, việc đã làm, file đã đổi, lỗi gặp phải.
3. Yêu cầu AI **soạn nháp** 4 file theo template sẵn có trong thư mục.
4. **Bạn đọc lại, chỉnh sửa, xác minh** (chạy thử, đối chiếu đề) rồi ký tên.

### Prompt mẫu để nhờ AI soạn nháp

```
Bạn giúp tôi soạn NHÁP 4 file audit cho task PRN232 (Issue #<số>), điền vào
đúng template có sẵn trong docs/<Họ tên>/#<số>/.

THÔNG TIN THẬT (bạn chỉ được dùng đúng những gì tôi cung cấp, không bịa):
- Sinh viên: <Họ tên> — <MSSV>
- Công cụ AI đã dùng: <ví dụ Claude / ChatGPT...>
- Việc đã làm: <liệt kê thật>
- Các prompt tôi đã dùng: <dán hoặc tóm tắt thật>
- File đã thêm/sửa: <liệt kê>
- Lỗi gặp phải & cách xử lý: <thật>
- Nguồn tham khảo (nếu có): <ghi rõ, hoặc "không">
- Phần tôi tự làm không dùng AI: <thật>

YÊU CẦU:
- Điền cả 4 file: AI_AUDIT_LOG, PROMPTS, CHANGELOG, REFLECTION.
- Văn phong gọn, chuyên nghiệp; prompt trình bày theo cấu trúc
  Vai trò – Bối cảnh – Yêu cầu – Ràng buộc – Đầu ra.
- Tuyệt đối KHÔNG bịa số liệu/sự kiện. Chỗ nào tôi chưa cung cấp thì để trống
  và đánh dấu [CẦN ĐIỀN].
- Giữ nguyên phần "Cam kết" và để tôi tự ký.
```

### Checklist Audit trước khi commit
- [ ] 4 file đã điền, không còn `[CẦN ĐIỀN]`
- [ ] MSSV/họ tên đúng
- [ ] Nội dung phản ánh đúng việc thật, mình giải thích lại được
- [ ] Đã ghi nguồn tham khảo (nếu có)
- [ ] Đã ký tên ở mục Cam kết
- [ ] Commit tài liệu: `[<MSSV>] docs: add task #<số> AI audit files`

---

## 3. Tóm tắt 1 dòng

> Issue → nhánh `feature/<mssv>-...` → code → `[<MSSV>] feat: ...` (Refs #x, không co-author)
> → dùng AI **soạn nháp** audit → tự review & ký → `[<MSSV>] docs: ...` → push → PR (Closes #x).
