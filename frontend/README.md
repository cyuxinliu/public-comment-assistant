# Frontend — Permit pages (Component 2) & Evidence review (Component 4)

React + TypeScript + Vite + Tailwind CSS.

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run lint
```

## Mock mode vs. real backend

With `VITE_API_BASE_URL` unset and `VITE_USE_MOCKS` false (the defaults), the app
loads the real PAL50 record directly from `../data/permits/`. No backend is needed.
The list, detail page, original source links and citation cards share that JSON.
The NOx example returns a labeled **Sample answer**, with exact excerpts looked up
by source and passage IDs. Other questions explain that general search is not yet
connected. Facility-history-only scope cannot answer the renewal comparison.

Set `VITE_USE_MOCKS=true` to opt into the existing fictional development fixtures
and demo controls. To use a real backend, set `VITE_API_BASE_URL` to its origin and
leave `VITE_USE_MOCKS=false`. Endpoints are in `../docs/api-contract.md`.

## Layout

| Path | What |
|---|---|
| `src/types/` | `Permit`, `Facility`, `Document`, `Viewpoint`, `AIAnswer`, `Citation` |
| `src/api/` | Service layer — the only place that talks to the backend; switches mock ↔ HTTP |
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
5. Confirm the answer says the existing NOx cap does not increase and is labeled Sample.
6. Open the original technical review, check p. 1, then copy an excerpt and citation.
7. Choose **Facility history** to see the scope limitation.

For static hosting, build with `npm run build`, publish `dist`, and configure SPA
routes to fall back to `index.html`. The shared JSON is bundled into the build;
no separate data server or API environment variable is required for this preview.
