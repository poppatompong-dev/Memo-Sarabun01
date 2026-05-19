<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Project-Specific Rules for AI Agents

## Stack & Versions (do not guess)
- **Next.js 16.2.6** App Router — `params` is always a `Promise<{…}>`, must `await params`
- **React 19** — Server Components cannot have event handlers; only `'use client'` components can
- **Tailwind CSS v4** — uses `@import "tailwindcss"` (not `@tailwind base/components/utilities`); font weights MUST use named utilities (`font-bold`, `font-semibold`, `font-medium`) — numeric classes (`font-700`) do not exist
- **TypeScript strict** — `npx tsc --noEmit` must pass before considering any change complete

## Component Boundaries
- **Server Components** (default): `app/page.tsx`, `app/layout.tsx`, `app/preview/[id]/page.tsx`, `components/AppNav.tsx`, `components/MemoSheet.tsx` — no `useState`, no event handlers, no `'use client'`
- **Client Components** (explicit `'use client'`): `components/MemoForm.tsx`, `components/NewMemoEditor.tsx`, `components/ClaudeStatus.tsx`, `app/history/page.tsx`, `app/preview/[id]/PrintActions.tsx`
- `MemoForm` is a **controlled component** — it does NOT own `form` or `recipients` state; those come from `NewMemoEditor` as props
- `NewMemoEditor` owns `form: FormState` and `recipients: string[]`; it passes them to `MemoForm` and reads them to build `MemoSheetData` for `MemoSheet`

## CSS Rules
- **`app/globals.css`** — design system only: CSS vars, utility classes for the app UI (`.input`, `.btn-primary`, `.section-card`, `.tooltip-box`, `.step-badge`, `.action-card`, `.app-nav`, `.animate-fade-in`, `.animate-spin`)
- **`app/preview/[id]/print.css`** — A4 document styles only: `.memo-page`, `.memo-header-row`, `.memo-garuda`, `.memo-meta-row`, `.meta-value-dotted`, `.memo-recipient`, `.body-line`, `.memo-page-preview` + `@media print` lock; this file is imported by `components/MemoSheet.tsx`
- **All spacings in print.css use CSS variables** declared in `:root` (e.g., `--memo-pad-top`, `--memo-line-indent`, `--memo-section-gap`). The `SpacingPanel` component overrides these via `document.documentElement.style.setProperty` and persists overrides in `localStorage`. When adding new spacing, declare a variable first.
- Never import `print.css` from anywhere else — only `MemoSheet.tsx`
- Never put A4/document styles in `globals.css`; never put UI app styles in `print.css`

## Data Files
- `data/departments.json` — กอง/สำนัก + กลุ่มงาน, each division has `{ name: string, subCode: string }` (Thai numeral). Do NOT use index for subCode — always use `divObj.subCode`
- `data/recipients.json` — flat `string[]`; used by `MemoForm` as `recipientOptions`
- `data/signatories.json` — seed only (first-run); live data lives in SQLite `signatories` table. Do NOT read this file at runtime after first seed
- `data/closings.json` — seed only; live data lives in SQLite `closings` table. Do NOT read at runtime

## Database (SQLite via better-sqlite3)
- DB file: `database/memos.db` (auto-created, gitignored)
- All DB functions synchronous — no async/await needed
- `recipient` column stores newline-separated string (`\n`) when multiple recipients; always split by `\n` when displaying
- `doc_date` stores ISO `YYYY-MM-DD`; convert to Thai display via `toThaiDate()` from `@/lib/thai-date`
- Signatories table is seeded from `data/signatories.json` if empty on first getDb() call

## MemoSheet Template Rules
The A4 preview must match the Thai government standard 100%:
- **Font**: TH Sarabun New 16pt (`font-family: 'TH Sarabun New', 'TH SarabunIT9', 'Sarabun', serif`)
- **Title**: "บันทึกข้อความ" — 29pt bold, centered in grid (garuda left, title center, blank right)
- **Garuda**: `<img class="memo-garuda" src="/garuda.png">` — 24mm wide, top-left of header row
- **Meta rows**: each value uses `.meta-value-dotted` (`border-bottom: 1px dotted #000`) filling remaining width
- **"ที่" + "วันที่"** on same row — "ที่" value uses `meta-half` (flex 0 0 38%), "วันที่" value fills rest
- **Margins**: 25mm top, 25mm right, 20mm bottom, 30mm left (ระเบียบสารบรรณ)
- **First-line indent**: `text-indent: 36pt` for `.body-line` and `.memo-closing`
- **เรียน multi-line**: use `.memo-recipient` (flex) + `.memo-recipient-list`; all lines align with first recipient
- **Preview scale**: `.memo-page-preview` uses `transform: scale(0.66)` — disabled in `@media print`

## AI Integration (Claude CLI)
- `lib/claude.ts` calls `spawn('claude', ['-p', '--output-format', 'json'])` — prompt goes to stdin, JSON result from stdout
- Response shape: `{ result: string, is_error: bool, usage: {input_tokens, output_tokens}, modelUsage: Record<string,…> }`
- Always extract text from `cliData.result`, then regex-match `/{[\s\S]*}/` to get the JSON payload
- Timeout: 120s for draft/polish, 30s for status check
- Never call Claude directly from API routes — always go through `lib/claude.ts` functions

## Document Numbering Format
- Pattern: `{deptCode}.{subCode}/(๑)/` e.g. `นว ๕๒๐๐๗.๔/(๑)/`
- `deptCode` comes from `departments.json[n].code`
- `subCode` comes from the selected division's `subCode` field (Thai numeral)
- The number after the final `/` is entered manually by clerical staff — do not auto-generate

## Numerals & Dates
- All numbers shown in the memo document MUST be Thai numerals (๐-๙). Use `toThaiDigits(n)` from `lib/thai-date.ts`
- Document number suffix is converted on input via `setDocSuffix()` in `MemoForm.tsx`
- AI system prompts (in `lib/claude.ts`) explicitly instruct the model to use Thai numerals — do NOT relax this constraint
- Dates use `toThaiDate(isoString)` → "๗ พฤษภาคม ๒๕๖๙"

## Patterns to Avoid
- Do NOT add event handlers to Server Components
- Do NOT import `signatories.json` / `closings.json` at runtime in any component (use the `/api/*` endpoints)
- Do NOT use `text-sm` for Thai text — minimum `text-base` (16px) for readability
- Do NOT use numeric Tailwind font-weight classes (`font-700` etc.)
- Do NOT use `<img>` outside of `MemoSheet.tsx` — use `next/image` elsewhere
- Do NOT add `transform: scale()` logic inside `@media print` — use the existing `.memo-page-preview` override in `print.css`
- Do NOT hardcode spacing values in `print.css` — declare a CSS variable in `:root` and reference it
