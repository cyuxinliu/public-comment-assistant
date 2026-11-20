# Public Comment Research Prototype

We’re building a permit research page for local environmental advocates. For the first demo, a user opens a real Beaumont-area air permit, sees what’s proposed and whether they can still comment, asks a question, and copies a verified excerpt and citation for their notes or public comment.

The prototype starts with a short permit list and one complete case. We’ll load the source documents ourselves.

## Build components

1. Permit data and sources. Prepare one complete case with an official notice, a technical document, a facility-history record, and a source that captures a real concern or argument. Use the shared record format below.
2. Permit list and detail page. Build the screens where users select a permit and see the facility, location, proposal summary, comment status, and official notice. Add a short “What people are saying” section that names who took each position and links to the source.
3. Question box and search. Let users choose “This permit,” “Facility history,” or “Both,” then ask a question in plain language. Search the selected documents and return a short answer with supporting evidence. Ask for clarification when the question is ambiguous.
4. Answer card and citations. Show the answer, exact excerpt, source title, page or section, and link to the original. Add a “Copy excerpt and citation” button.

## Shared permit record format

- `id` — Stable identifier the app uses to open the right permit page.
- `permitNumber` — Official permit number shown on agency documents.
- `facilityName` — Name of the facility.
- `location` — Object with `city` and `county`.
- `proposalSummary` — One or two plain-language sentences explaining what the applicant is requesting.
- `publicComment` — Object with `status` (`open`, `closed`, or `unverified`), `deadline` (the verified deadline or `null`), and `noticeSourceId` (the ID of the official notice).
- `sources` — Array of documents attached to the case. Each source has `id`, `title`, `url`, `scope` (`permit` or `facility_history`), and `passages`. Each passage has `text` and `locator`, such as `p. 4` or `Emissions Summary`.
- `viewpoints` — Array of attributed positions or concerns. Each entry has `speaker`, `summary`, and `sourceId`.

For the build handoff, use one filled-in permit record across all four components. Each citation in an answer should identify the `sourceId` and supporting passage so the answer card can display the original title, link, and locator from the shared record.

## Shared rules

- Use the official notice or another official agency record to verify comment status and deadlines. If the deadline can’t be verified, display “Deadline unverified.”
- Ground answers in the loaded documents. When the records don’t answer a question, explain what’s missing.
- Label proposed emissions limits and reported emissions separately.
- Clearly label any prewritten answer used in the demo as a sample.
- Keep facility-name search, alerts, and comment drafting for later versions.

## Check-in demo

An advocate opens a permit, checks whether they can comment, and asks, “Would this renewal let the refinery emit more nitrogen oxides?” They read the answer, open the source to verify the passage, and copy the excerpt and citation.
