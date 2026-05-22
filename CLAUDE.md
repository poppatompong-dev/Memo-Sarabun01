@AGENTS.md

---

# Living Development Reference — Memo Sarabun (เทศบาลนครนครสวรรค์)

## Current Architecture Snapshot

### Database
- Driver: **`@libsql/client`** (async, Turso-compatible) — replaced `better-sqlite3` (sync)
- DB file: `file:database/memos.db` (default) — override with `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`
- **All `lib/db.ts` functions are `async`** — every caller must `await` them (API routes already updated)
- Tables: `memos`, `signatories`, `closings`, `recipients`
- `recipients` table added: `id INTEGER PK`, `name TEXT UNIQUE NOT NULL`

### Components Added
| Component | Type | Purpose |
|-----------|------|---------|
| `components/AIProgressModal.tsx` | Client | AI progress modal with time-based stages + result/changes/references display |
| `components/SpacingPanel.tsx` | Client | Live CSS variable override panel (persists to localStorage) |

### API Routes Added
| Route | Methods | Notes |
|-------|---------|-------|
| `app/api/recipients/route.ts` | GET, POST | List / create saved recipients |
| `app/api/recipients/[id]/route.ts` | PUT, DELETE | Edit / delete saved recipient |
| `app/api/polish-subject/route.ts` | POST | AI subject polish via `lib/claude.ts:polishSubject()` |

### `lib/claude.ts` Exports
- `draftMemoContent(subject, context, dept?, div?, recipient?)` → `DraftResult`
- `polishMemoContent(subject, bg, facts, consid)` → `DraftResult`
- `polishSubject(subject)` → `{ subject, changes?, references?, _meta? }`
- `testConnection()` → `boolean`
- Response shape: `{ result: string, is_error: bool, usage: {...}, modelUsage: {...} }`
- All functions spawn `claude -p --output-format json`, timeout 120s (30s for status check)

### `components/MemoForm.tsx` State Summary
```
form: FormState          ← owned by NewMemoEditor, passed as props
recipients: string[]     ← owned by NewMemoEditor
aiModal: AIModalState    ← AI progress modal state
sigList / sigEditor      ← signatory CRUD
closingList / closingEditor ← closing CRUD
savedRecipients / recipientEditor / recipientInputModes ← recipient CRUD + free-text input
polishLoading/Done, subjectPolishLoading/Done, aiLoading
customDept               ← toggle between dropdown and free-text for department
collapsed                ← section collapse state (header/ai/content/sign)
```

### Key CSS Variables in `print.css`
All spacings are CSS variables so `SpacingPanel` can override them live.
Notable: `--memo-row-line-height`, `--memo-dotted-pad-bot`, `--memo-recipient-list-line: 1.15`

---

## Pending / Known Issues

- TypeScript strict: run `npx tsc --noEmit` before any PR
- No unit tests — TypeScript + manual browser verification is current QA strategy
- `SpacingPanel` overrides are localStorage-only; no server persistence
- Claude CLI must be installed and authenticated on the host (`claude -p --output-format json`)

---

## Dev Commands
```powershell
npx next dev          # dev server (port 3000)
npx tsc --noEmit      # type check
Remove-Item -Recurse -Force .next  # clear build cache if CSS/route issues appear
```
