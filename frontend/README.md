# Frontend — Permit pages (Component 2) & Evidence review (Component 4)

React + TypeScript + Vite + Tailwind CSS.

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run lint
npm test           # unit + UI tests; never calls the API
ANTHROPIC_API_KEY=sk-ant-... npm run eval   # test questions against the live model (your key)
```

`npm run eval` runs the questions in `eval/questions.ts` through the real pipeline and
writes `eval/results/latest.json` (gitignored). The current questions are `rule-check`
cases that test AGENTS.md rules. Add real advocate questions (for example from Terry's
session) with `origin: 'advocate'`, word for word, and write their expectations from
the records afterward.

## Mock mode vs. real backend

With `VITE_API_BASE_URL` unset and `VITE_USE_MOCKS` false (the defaults), the app
loads four real Beaumont records directly from `../data/permits/`. No backend is needed.
PAL50 is the complete case; the three additional cases are labeled Summary only
and provide official notices with unverified current comment status/deadlines.
The list, detail page, original source links and citation cards share that JSON.

**Live answers use the viewer's own Anthropic API key (bring your own key).** The
question box shows a key field. Once a key is entered, questions go from the browser
straight to the Anthropic API (`claude-opus-5-5`) and are billed to that person's
account. The project never holds or pays for a key, and nothing is hosted server-side.
The key is kept in memory, or in `sessionStorage` if the user ticks "Remember until I
close this tab". It is never written to `localStorage` or sent anywhere but Anthropic.
Because the key sits in the browser, use a key with a spend limit, and remove it from
shared demo machines (**Remove key**).

Without a key, the NOx example returns the labeled **Sample answer**, with exact
excerpts looked up by source and passage IDs, as before.

### How an answer is produced (Component 3, `src/answer/`)

1. `retrieve.ts`: keep the sources in the selected scope. The curated record is
   small, so every in-scope passage is sent. Replace this with ranked search when
   full documents are loaded.
2. `prompt.ts`: instructions (answer only from passages, keep limits and reported
   emissions apart, never invent a deadline, attribute viewpoints) plus the
   passages, tagged with `sourceId`, `passageId`, locator and `emissionsKind`.
3. `claude.ts`: one Messages API call with structured output (`schema.ts`). The
   model returns a status, a short answer and passage IDs, not quoted text.
4. `ground.ts`: drop citations that don't resolve to an in-scope passage, copy each
   excerpt, locator and emissions label from the record, and downgrade the status
   when evidence is missing. An answer with no valid citation is never shown.

If a scope has no documents, the pipeline answers without calling the model.

Set `VITE_USE_MOCKS=true` to opt into the existing fictional development fixtures
and demo controls. To use a real backend, set `VITE_API_BASE_URL` to its origin and
leave `VITE_USE_MOCKS=false`. Endpoints are in `../docs/api-contract.md`.

## Layout

| Path | What |
|---|---|
| `src/types/` | `Permit`, `Facility`, `Document`, `Viewpoint`, `AIAnswer`, `Citation` |
| `src/api/` | Service layer — the only place that talks to the backend; switches mock ↔ local ↔ HTTP |
| `src/answer/` | Component 3: retrieval, prompt, browser Claude call with the user's key, grounding |
| `eval/` | Test questions for Component 3 against the live model (`npm run eval`) |
| `src/mocks/` | Mock permit records + mock answer generator (not a RAG pipeline) |
| `src/lib/` | Comment-status rules, citation formatting, copy-to-clipboard |
| `src/components/permit/` | Permit card, comment status, documents, viewpoints, facility history |
| `src/components/evidence/` | `AnswerCard`, `CitationCard`, copy button (Component 4) |
| `src/components/ask/` | Question box with scope selector |
| `src/pages/` | List page, detail page, mock document viewer |

## Demo script (check-in)

1. Open the list, then **ExxonMobil Beaumont Refinery — PAL50**.
2. Confirm closed comment status, the final-action link and **Deadline unverified**.
3. Review the official notice, technical review, history and attributed 2017 concern.
4. Choose **This permit** or **Both**, select the NOx example, then **View sample answer**.
   For a live answer, paste your own API key first; the button changes to **Ask**.
5. Confirm the answer says the existing NOx cap does not increase. Without a key it is
   labeled Sample; with a key it is a live answer whose citations come from the record.
6. Open the original technical review, check p. 1, then copy an excerpt and citation.
7. Choose **Facility history** to see the scope limitation.

For static hosting, build with `npm run build`, publish `dist`, and configure SPA
routes to fall back to `index.html`. The shared JSON is bundled into the build;
no separate data server or API environment variable is required for this preview.
