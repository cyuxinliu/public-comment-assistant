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

With `VITE_API_BASE_URL` unset (the default), the app runs entirely on **clearly labeled mock data**
in `src/mocks/`. Every facility, permit number, date, and viewpoint there is fictional.
A banner and "Mock data" / "Sample answer" badges label it in the UI.

To use the real backend, copy `.env.example` to `.env.local` and set
`VITE_API_BASE_URL=http://localhost:8000`. Endpoints and payloads are in
[`../docs/api-contract.md`](../docs/api-contract.md).

In mock mode, the question box has a **Demo controls** panel that forces each answer state:
loading, error, empty, insufficient evidence, and clarification.

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

1. Open the list, then **Placeholder Refinery**. The status shows open, with the deadline and the notice it was verified from.
2. Read the summary, documents, "What people are saying", and facility history.
3. Ask *"Would this renewal let the refinery emit more nitrogen oxides?"* with **Both** selected.
4. Proposed limits and reported emissions get separate labels. Click **Open original source**: the cited passage is highlighted.
5. Click **Copy excerpt and citation**.
6. Optionally switch the scope to **Facility history** to show the insufficient-evidence state.
