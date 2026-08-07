# Compliance Rules — Admin UI

Admin surface for the compliance rule engine, at **`/admin/compliance`**.

The backend already existed and was **not modified** by this work. Everything here
is frontend consuming `/api/v2/compliance`.

## Status

| | |
|---|---|
| Branch | `compliance` |
| Type-check | passing (`npm run type-check`) |
| Unit tests | 75 passing (`npx vitest run src/components/compliance`) |
| Production build | passing (`npm run build`) |
| **Manual E2E** | **never run — see "Before shipping"** |
| **Integration proof** | **never run — see "Before shipping"** |

## Backend contract (do not modify)

`backend/src/routes/compliance.ts`, mounted at `/api/v2/compliance`
(`server.ts:149`, behind `conditionalCsrf`).

```
GET    /rulesets            → {success, rulesets:[{…, rule_count}]}   ordered by priority asc
POST   /rulesets            {name(≤200), description?, is_active?, priority?}
GET    /rulesets/:id        → {success, ruleset:{…, rules:[…]}}
PUT    /rulesets/:id        partial: name/description/is_active/priority
DELETE /rulesets/:id        cascades to rules
POST   /rulesets/:id/rules  {condition, action, description}
PUT    /rules/:id           {condition?, action?, description?}
DELETE /rules/:id
POST   /evaluate            {context} → {matched_rules, matches[], resolved_action}   dry-run
```

**Auth is decisive.** `authenticateComplianceRequest` accepts only an `X-API-Key`
header **or** a reviewer JWT cookie with `role === 'admin'`. Platform-admin
cookies (audience `idswyft-admin`) and developer-portal JWTs are rejected
deliberately — see the comment at `compliance.ts:15-46`. That is why:

- the page guard branches **401 → `/admin/login`**, **403 → `/admin/verifications`**
- the "Compliance" nav button in `VerificationManagement.tsx` renders only for
  `userRole === 'admin'`
- the role badge on the page is hardcoded to `Org Admin` (nothing else can reach it)

## DSL

Source of truth: `backend/src/services/complianceEngine.ts`. The types in
`types.ts` are **hand-mirrored**, not imported — `shared/` publishes `dist/` and
its barrel pulls in `sharp` + `onnxruntime-node`, which must never reach the
browser bundle. If `complianceEngine.ts` changes, update `types.ts` to match.

- Leaf: `{field, op, value}` · Combinators: `{all:[…]}`, `{any:[…]}`, `{not:{…}}`
- Ops: `eq neq in not_in gt gte lt lte exists contains`
- Fields: `country, document_type, user_age, verification_mode, risk_score, aml_risk_level, metadata.*`
- Actions: `set_mode` (`full|document_only|identity|age_only`), `require_address`,
  `require_liveness`, `require_aml`, `set_flag`, `force_manual_review` — at least one
- Merge across matched rules: most restrictive `set_mode` wins
  (`age_only < document_only < identity < full`), booleans are sticky-true,
  `set_flag` accumulates deduplicated

## File map

| File | Responsibility |
|---|---|
| `types.ts` | DSL + API types, `FIELD_DEFS` catalog, `findFieldDef` |
| `validation.ts` | Mirror of backend `validateCondition`/`validateAction`, semantic warnings, `normalizeAction` |
| `conditionShape.ts` | `toBuilderModel` / `fromBuilderModel` / `coerceValue` — DSL ↔ builder rows |
| `summarize.ts` | `describeCondition` / `describeAction` / `describeMergedAction` for table cells |
| `api.ts` | The 9 endpoint wrappers + `ComplianceApiError` |
| `useComplianceRulesets.ts` | All server state: list, detail, every mutation |
| `RulesetList.tsx` | Left pane |
| `RulesetFormModal.tsx` | Create/edit ruleset metadata |
| `RulesTable.tsx` | Right pane |
| `RuleEditorModal.tsx` | Draft owner, Builder/JSON tabs |
| `ConditionBuilder.tsx` | Visual rows |
| `ConditionJsonEditor.tsx` | Raw JSON escape hatch |
| `ActionEditor.tsx` | The 6 action keys |
| `EvaluatePanel.tsx` | Dry-run modal |
| `../../pages/ComplianceRules.tsx` | Page: guards, chrome, layout, toast, modal orchestration |

## Builder ↔ JSON sync (the one subtle bit)

`condition` (the parsed object) is the **single source of truth**. `jsonText` is a
view that only diverges while the JSON tab holds unparseable text.

**No `useEffect` participates in the sync.** Two event handlers each write both
states once, synchronously, in one event — React batches them, and there is no
render-phase or effect-phase write to re-trigger the other direction.

`builderModel` is `useMemo`-derived from `condition`, so there is nothing to sync
back. `ConditionBuilder`'s keystroke buffer (`rawValues`, needed so `"1."` and
`"DE, "` survive coercion) is rebuilt by **remounting** — `key={builderEpoch}`,
incremented only on a JSON→Builder tab switch — rather than by syncing props into
state.

`toBuilderModel` returns `null` for shapes the builder can't express (nested
combinators, `not`, multiple combinator keys); the Builder tab then shows a
"too complex — edit as JSON" notice.

## Engine footguns encoded in the UI

These are all cases where a rule **saves successfully but can never match**. The
backend does not catch any of them.

1. **`exists` is asymmetric** — only the literal `true` means "is present"; `false`,
   `"false"`, `0` all read as "absent" (`complianceEngine.ts:89`). The UI forces a
   two-option select.
2. **`in`/`not_in` fail open** — `validateCondition` only requires `value !== undefined`,
   but `evaluateLeaf` requires `Array.isArray`. A string makes `in` always false and
   `not_in` always true. The client requires an array and blocks the save.
3. **Country case** — enforcement passes `issuing_country?.toUpperCase()`
   (`newVerification.ts:854`). A rule with `"de"` matches in the dry-run and never
   fires in production. Values are uppercased on write; lowercase triggers a warning.
4. **Numeric ops need numbers on both sides** — `{field:'country', op:'gt', value:5}`
   saves fine and never matches. Flagged by `conditionWarnings`.
5. **No-op actions** — `validateAction` accepts `{require_address: false}`, but
   `mergeActions` only reacts to `=== true`. And `JSON.stringify` drops `undefined`,
   so `{set_mode: undefined}` posts as `{}` → 400. `normalizeAction` strips
   false/empty/undefined keys and the save gate requires ≥1 meaningful key.
6. **`{all:[…], any:[…]}` silently drops `any`** — `validateCondition:170` checks
   `'all'` first and returns early. The JSON tab warns on >1 combinator key.
7. **`POST /rulesets` returns a partial object** — no `updated_at`, no `rule_count`
   (`compliance.ts:93`). Never append it optimistically; always `refreshList()`.
8. **`/evaluate` match identity is lossy** — it sends `rule_description || rule_id`
   (`compliance.ts:407`), so a dry-run match cannot be linked back to a table row.
   Rendered as an opaque label on purpose; do not build highlight-the-matched-row.
9. **Priority is mostly cosmetic** — `mergeActions` is order-independent except when
   several rules set a non-`head_turn` liveness. Don't write copy implying otherwise.
10. **No rule ordering** — rules come back by `created_at` with no priority column and
    no reorder endpoint. Do not build drag-to-reorder.
11. **`noUnusedLocals` / `noUnusedParameters` are on** — a stray heroicon import fails
    `npm run type-check`.

## Before shipping

Nothing below has been executed yet.

### Manual E2E
Needs the backend running and a reviewer account with `role='admin'`.

```bash
cd backend  && npm run dev    # :3001
cd frontend && npm run dev    # :5173
```

1. Log in at `/admin/login` as an org admin → go to `/admin/compliance`
2. Create ruleset "EU High Risk", priority 10 → confirm it sorts by priority
3. Add a rule in the Builder: `country in [DE, FR]` → `set_mode: full` → save →
   confirm the row summary reads correctly
4. Edit in the JSON tab to `{"not":{"field":"country","op":"eq","value":"DE"}}` → save →
   reopen → the Builder tab must show "too complex"
5. Dry-run with `{country: "DE"}` → expect `matched_rules: 1`, `resolved_action.set_mode: "full"`
6. Toggle the ruleset inactive → re-run the dry-run → expect `matched_rules: 0`
7. Delete the ruleset → the confirm modal must state the correct `rule_count`
8. Auth regression: log in as a plain reviewer → the "Compliance" button must not
   appear; navigating directly to `/admin/compliance` must redirect to `/admin/verifications`
9. Viewport regression: <768px → "Desktop Required" panel

### Integration proof
UI persistence does not prove enforcement. Create a rule
`country eq GT → force_manual_review`, run a sandbox verification with
`issuing_country: 'GT'`, and confirm `compliance_force_manual_review` appears in
the addons of `GET /api/v2/verify/:id/status`.

### Test coverage gap
The 75 unit tests cover pure logic only (`validation`, `conditionShape`,
`summarize`). There are no tests for `api.ts`, `useComplianceRulesets.ts`, or any
component. The project standard is 80% with unit + integration + E2E; this does
not reach it.

## Known backend issues, deliberately out of scope

Not regressions from this work — pre-existing, and each needs its own change.

1. **Dead context fields.** `newVerification.ts:853-858` never populates `user_age`,
   `risk_score`, or `aml_risk_level`, so rules keyed on them never fire in
   production (they do work in `/evaluate`). The UI marks them "dry-run only".
   `user_age` is fixable at that point; the other two do not exist yet at
   initialize and would need a second evaluation point in the pipeline.
2. **`/api/admin/thresholds` is inert.** `organization_threshold_settings` has no
   migration in `supabase/migrations/`, it is keyed on `req.user.id` rather than a
   developer, the pipeline calls the `*Sync` threshold variants that never read
   overrides, and `convertAdminSettingsToThresholds` uses base values that
   contradict the real defaults. Four fixes before a UI would mean anything.
3. **Gate 6 missing from the barrel** — `backend/src/verification/gates/index.ts`
   exports gates 1,2,3,4,5,7; `VerificationSession` imports gate 6 directly.
