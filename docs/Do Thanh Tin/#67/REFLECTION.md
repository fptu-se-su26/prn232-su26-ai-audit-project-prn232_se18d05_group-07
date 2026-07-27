# Reflection

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
| Issue | #67 — Contract Lifecycle |
| Date | 27/07/2026 |

---

## 2. What I Set Out to Do

The contract feature was about 60% finished: you could create, sign, accept, reject and terminate a contract, but you could not get a copy of it, and nobody was ever told it was about to expire. Invoices could already export to Excel; contracts had nothing.

The interesting part was not the PDF. It was deciding **what not to build**.

---

## 3. The Constraint Was the Design

`ContractStatus` has `Renewed` and `Expired` values. Adding a job to set them looks like the obvious completion of this feature. An earlier audit had already shown why it is not:

- Those two values are **read** at `ReviewRepository.cs:83-85` to decide who may leave a review, but they are **never written**. Every contract stays `Active` forever, so that branch has never executed.
- `ContractStatus.Active` is filtered in roughly **twelve** places, including `ChatAccessRepository` (chat permission) and `ServiceRequestRepository` (service-request permission).

So a one-line "set status to Expired" would have quietly stripped tenants of their ability to chat with their landlord and to raise service requests, on the day their contract lapsed. That might even be desirable behaviour — but it must be a decision someone makes deliberately, after reading all twelve call sites, not a side effect of adding a reminder.

I split the feature: **reminders now, status changes later.** That gets the user-visible value (nobody wants to be surprised by an expiring contract) at essentially zero regression risk.

The part I am most satisfied with is that the constraint is written into the code in three places — the interface XML doc, the service class comment, and the hosted service comment — plus a test named `SendExpiryReminders_NeverMutatesContractStatus`. A comment can be ignored. A failing test cannot.

---

## 4. The Tests Earned Their Keep

The first test run failed 5 of 84. The bug was in code I had just read and thought was fine:

```csharp
private static readonly int[] Milestones = { 30, 15, 7 };
var milestone = Milestones.FirstOrDefault(m => daysLeft <= m);
```

For a contract seven days out, `7 <= 30` is true, so it matched 30. Every contract was recorded as a 30-day reminder — and since the log row is unique per milestone, the 15-day and 7-day reminders would then **never** fire. Tenants would have received exactly one warning, at the wrong time, and the feature would have looked like it worked.

What makes this worth writing down: a happy-path test would have passed. I only caught it because the milestone selection was tested as a `[Theory]` across six different day-counts, including boundary values. Testing one case would have shipped the bug.

The lesson I take: **for logic that maps a continuous value into buckets, test the boundaries, not an example.**

---

## 5. Working Around Constraints Instead of Relaxing Them

Three times the "don't modify existing files" rule blocked the obvious path, and each time the workaround was legitimate rather than a hack:

| Problem | Easy option | What I did instead |
|---|---|---|
| Every `IContractRepository` method is owner-scoped; none can scan all expiring contracts | Add a method to the interface | Put the service in Infrastructure with direct `DbContext` access — exactly what `ViewingWorkflowService` already does |
| Neither page has a `ContractId` | Add `ContractId` to `TenantRoomDto` and change its mapping | Added two resolver endpoints that look the contract up server-side |
| `SignaturePath` is a URL, so embedding the signature needs a network call | Assume it works | 5-second timeout, and the PDF still generates with "(Đã ký điện tử)" if the fetch fails |

The second one is the one I would defend hardest. `my-active/pdf` and `by-room/{roomId}/pdf` are not workarounds — they match how the callers actually think. A tenant knows "my room", not "contract #482".

---

## 6. What I Would Do Differently

- **Embed a font in the PDF.** I used `Arial`, which exists on my Windows machine. In a Linux container it would fall back to whatever QuestPDF picks, and Vietnamese diacritics could render inconsistently. Shipping a font file with the app removes an environment dependency I currently just hope for.
- **Make the reminder milestones configurable.** 30/15/7 is hard-coded. A landlord with 60-day notice terms cannot change it without a rebuild.
- **Consider timezone.** The job compares against `DateTime.UtcNow.Date`. Vietnam is UTC+7, so a contract ending "today" locally is computed against a UTC day boundary. For a daily reminder this is at most a few hours of drift and harmless, but it is the kind of thing that becomes a bug in a billing context.

---

## 7. Honest Limitations

- The reminder job runs on a 24-hour `PeriodicTimer` started at application launch, so the run time drifts with restarts. There is no fixed clock time.
- If two API instances run, both will execute the job. The unique index makes this safe (the loser's `SaveChanges` throws and is swallowed), but the losing instance reports zero sent, which is slightly misleading in the log.
- The PDF is generated on demand and not stored, so there is no immutable archived copy of what was signed. For a real e-contract you would hash and persist the rendered document.

---

## 8. Self-Assessment

| Aspect | Assessment |
|---|---|
| Understood every line submitted | Yes — including why the milestone array order matters |
| Verified rather than trusted | Yes — I read the migration to confirm it only creates a table, and the tests caught a bug I had not spotted |
| Regression risk | Very low — no status mutation, migration adds one table, 86 added lines and 0 deletions in existing files |
| Honest about AI involvement | Yes — the AI wrote the code and found its own bug through tests I asked it to write; the scope decision was mine |

---

## 9. Commitment

I confirm this reflection accurately describes my own work and reasoning on Issue #67. The decision to build reminders without status changes was mine, made after reviewing the twelve call sites that filter `ContractStatus.Active`, and I verified the constraint holds through both the migration contents and a dedicated regression test.

**Student Name:** Do Thanh Tin
**Student ID:** DE180794
**Date:** 27/07/2026
