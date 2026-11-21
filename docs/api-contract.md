# API contract (proposed)

Shared by Component 1 (permit data & sources), Component 3 (AI retrieval & QA), and the
frontend (Components 2 & 4). Types live in `frontend/src/types/index.ts`.

All responses are JSON. The record shape follows the "Shared permit record format" in
`AGENTS.md`; fields marked *(optional)* are additions the UI uses when present.

## `GET /api/permits`

```json
{
  "permits": [
    {
      "id": "string",
      "permitNumber": "string",
      "facilityName": "string",
      "location": { "city": "string", "county": "string" },
      "proposalSummary": "string",
      "publicComment": {
        "status": "open | closed | unverified",
        "deadline": "YYYY-MM-DD | null",
        "noticeSourceId": "string | null",
        "statusSourceId": "string (optional; official final action supporting status)"
      },
      "permitType": "string (optional)",
      "dataStatus": "mock | verified (optional)",
      "caseCompleteness": "summary | complete (optional)"
    }
  ]
}
```

## `GET /api/permits/:id`

The full permit record: the fields above, plus:

```json
{
  "sources": [
    {
      "id": "src-notice",
      "title": "string",
      "url": "https://… (link to the original document)",
      "scope": "permit | facility_history",
      "documentType": "official_notice | application | technical_review | facility_record | public_comment | other (optional)",
      "publisher": "string (optional)",
      "date": "YYYY-MM-DD (optional)",
      "passages": [
        { "id": "n1 (optional, recommended)", "text": "exact text", "locator": "p. 4 | Section 2" }
      ]
    }
  ],
  "viewpoints": [
    { "speaker": "string", "summary": "string", "sourceId": "src-…", "speakerRole": "applicant | agency | community | other (optional)" }
  ]
}
```

Rules:
- `publicComment.status` is `open` or `closed` only when `noticeSourceId` points to an official
  agency record in `sources`. Otherwise use `unverified` with `deadline: null`. The UI shows a
  status with no notice as **unverified**.
- Each `viewpoints[].sourceId` must match a `sources[].id`.
- Optional `publicComment.statusSourceId` must match a source containing the official
  decision supporting current status, when that differs from the original notice.

## `POST /api/permits/:id/ask`

Request:

```json
{ "question": "Would this renewal let the refinery emit more nitrogen oxides?", "scope": "permit | facility_history | both" }
```

Response:

```json
{
  "status": "answered | insufficient_evidence | no_evidence | needs_clarification",
  "question": "echo of the question",
  "scope": "permit | facility_history | both",
  "answer": "plain-language answer (may be empty for no_evidence / needs_clarification)",
  "citations": [
    {
      "sourceId": "src-technical",
      "passageId": "t1",
      "excerpt": "exact quoted text from the passage",
      "locator": "p. 6, Table 2",
      "emissionsKind": "proposed_limit | reported (optional)"
    }
  ],
  "missingInfo": "what the loaded records don't cover (optional)",
  "clarifyingQuestion": "string (when status = needs_clarification)",
  "suggestedQuestions": ["string (optional)"],
  "isSample": "boolean (true for prewritten demo answers)"
}
```

Rules:
- Only cite sources attached to the permit. The UI looks up `title`, `url`, and `publisher` by
  `sourceId`, and warns if the citation points to a source that isn't in the permit.
- `excerpt` should be verbatim passage text. The UI checks it against the loaded passage
  and flags any excerpt that doesn't match.
- Set `emissionsKind` on any citation that states emissions numbers, so proposed limits and
  reported emissions are labeled separately.
- Use `insufficient_evidence` when citations only partly support the answer, and `no_evidence`
  when nothing relevant was found.

## Errors

Non-2xx status with `{ "error": { "message": "human-readable message" } }`. A 404 on
`/api/permits/:id` shows "Permit not found".

## CORS / dev

The frontend reads the backend origin from `VITE_API_BASE_URL`, for example
`http://localhost:8000`. For local development, allow that origin in CORS or use a Vite proxy.
