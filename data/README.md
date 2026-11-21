# Verified permit data

`permits/exxonmobil-beaumont-pal50-renewal.json` is the Component 1 handoff. It follows
AGENTS.md and the optional source metadata and passage IDs in `docs/api-contract.md`.
The frontend imports this record directly in its default local mode. Fictional
fixtures remain available only through the explicit VITE_USE_MOCKS=true option.
The optional publicComment.statusSourceId links the final action separately from
the original public notice.

## Verification as of November 20, 2026

- Case: PAL50 renewal, TCEQ project 396197, ExxonMobil Oil Corporation, ExxonMobil
  Beaumont Refinery, 1795 Burt Street, Beaumont, Jefferson County.
- The notice package (PDF pp. 1 and 4), technical review (p. 1), and final action
  (p. 1) agree on permit, applicant, facility and project. The agency cover pages
  identify RN102450756 and CN600920748. The history report identifies that same RN
  and customer on PDF p. 2 and discusses PAL50 on PDF pp. 3–4. Do not substitute the
  nearby Beaumont Chemical Plant, RN100542844.
- PAL50 is sufficiently documented, so no alternate permit was needed. The official
  notice is the agency-issued publication package, whose actual notice is marked
  “Example A” on PDF pp. 4–5; it is not a completed newspaper affidavit. The technical
  review records publication in Beaumont Enterprise and El Perico on February 5,
  2026 (pp. 1–2). Its text layer contains “DRAFT”; the source date in the JSON is the
  agency catalog's March 31, 2026 record date, not a separately signed review date.
- `status: closed` is an inference from the agency's final issuance on March 31,
  2026 (`src-final-action/f1`), rather than from the notice's issuance date. It applies
  to this renewal project, not future applications at the refinery.
- `deadline: null`: no explicit calendar closing date was verified. The notice gives
  a 30-day publication-relative window (PDF p. 4); its instructions also allow weekend,
  holiday and public-meeting extensions (PDF p. 11). Do not use December 19, 2025
  (notice issuance), March 31, 2026 (decision), or March 31, 2036 (permit expiration)
  as the comment deadline. Display **Deadline unverified**.
- The May 2017 press release identifies the earlier ExxonMobil refinery expansion
  dispute in Charlton-Pollard, Beaumont (PDF p. 1). It supplies a directly attributed
  community position (p. 2), not a PAL50 renewal objection. It does not give a permit
  number or RN; the link is facility-level context, based on the refinery identity
  and location. No claim is made that the earlier dispute involved PAL50.
- Source passages are short verbatim excerpts; line wrapping/spacing is normalized.
  Numeric cell excerpts retain their column, pollutant, units and emissions category
  in the locator. Historical reported emissions are 12-month rolling figures, not
  individual-month totals or permit limits. A finding of no violations in the 2020
  report review does not establish a clean overall enforcement history.
- All five original PDFs were downloaded for inspection. Relevant notice, technical,
  history and community pages were rendered to verify text, attribution and locators.
  Source files are not vendored; each source's `url` opens its original document.

## Source checklist

| Source ID | Original URL | Check |
| --- | --- | --- |
| `src-notice` | https://records.tceq.texas.gov/cs/idcplg?IdcService=TCEQ_EXTERNAL_SEARCH_GET_FILE&dID=9371443&Rendition=Web&searchType=External | PDF pp. 4–5: official notice; p. 1: RN/project identity; p. 11: deadline-extension instructions |
| `src-technical` | https://records.tceq.texas.gov/cs/idcplg?IdcService=TCEQ_EXTERNAL_SEARCH_GET_FILE&dID=9581589&Rendition=Web&searchType=External | p. 1: Project Overview and Emission Summary; pp. 1–2: publication history |
| `src-history` | https://records.tceq.texas.gov/cs/idcplg?IdcService=TCEQ_EXTERNAL_SEARCH_GET_FILE&dID=4978647&Rendition=Web&searchType=External | Report p. 2 (PDF p. 3): investigation finding; report p. 3 (PDF p. 4): reported rolling emissions |
| `src-community` | https://law.yale.edu/sites/default/files/area/clinic/document/beaumont_press_release_final.pdf | PDF p. 1: refinery dispute context; p. 2: Reverend Roy Malveaux quotations |
| `src-final-action` | https://records.tceq.texas.gov/cs/idcplg?IdcService=TCEQ_EXTERNAL_SEARCH_GET_FILE&dID=9614261&Rendition=Web&searchType=External | p. 1: renewal decision and facility/RN/project identity |

## Sample demo answer (prewritten; not a search implementation)

Question: **Would this renewal let the refinery emit more nitrogen oxides?**

Scope: `permit`.

Expected answer: **It does not raise the existing NOx cap. The technical review lists
both the existing and proposed NOx limits as 2,088.19 tons per year. This compares
permitted limits; it does not establish that actual emissions cannot rise within
the cap. TCEQ issued the renewal on March 31, 2026.**

Check `src-technical/t1`, p. 1, Project Overview:

> No increase to existing emission caps or allowable emissions are proposed in this permit renewal.

For the numeric comparison, check `src-technical/t2` and `t3` against the proposed
and existing columns of the NOx row in the p. 1 Emission Summary. Both cells read
`2088.19`. Use `emissionsKind: proposed_limit` for a citation to the proposed cell;
use `reported` if citing historical emissions from `src-history/h2`.

For the demo citation card, return `sourceId: src-technical`, `passageId: t1`, and
the exact passage text and locator from the JSON. Any stored prewritten answer must
have `isSample: true`. The source URL, title and locator come from this same record.

## Validation

Validated with Python 3's JSON parser and assertions for required fields, field
types, allowed status/scope/document-type values, ISO dates, HTTPS URLs, unique
source and passage IDs, and all notice/viewpoint references. All 13 passage texts
were also compared against the downloaded source PDFs with whitespace normalized.
The frontend integration is checked separately with its API and UI tests. General
document retrieval is not implemented.

## Additional summary-only cases

Verified November 20, 2026. The default list includes three additional notice-backed
records. They use `caseCompleteness: summary`; PAL50 uses `complete`. “Verified”
means the recorded facts and excerpts were checked, not that the current comment
period is known or that the complete research bundle has been collected.

| JSON file | Proposal | Official source and locator |
| --- | --- | --- |
| `permits/g3-chickadee-beaumont-124670-renewal.json` | G-3 Chickadee Purchaser chemical-plant air permit renewal, 11357 Interstate Highway 10 | [TCEQ NORI 124670](https://www.tceq.texas.gov/downloads/permitting/air/bilingual/pending-permit-notices/124670-nori-english.pdf/%40%40download/file/124670-nori-english.pdf), p. 1 APPLICATION; p. 2 notice issuance January 27, 2026 |
| `permits/hoimyung-beaumont-182843-new.json` | Hoimyung Texas new dispersant production facility, 8745 Industrial Parkway | [TCEQ NORI 182843](https://www.tceq.texas.gov/downloads/permitting/air/bilingual/pending-permit-notices/182843-nori-english.pdf/%40%40download/file/182843-nori-english.pdf), p. 1 APPLICATION; p. 2 notice issuance February 10, 2026 |
| `permits/arkema-beaumont-o1636-renewal.json` | Arkema Beaumont Plant federal operating permit renewal, 2810 Gulf States Road | [TCEQ notice package O1636](https://records.tceq.texas.gov/cs/idcplg?IdcService=TCEQ_EXTERNAL_SEARCH_GET_FILE&Rendition=Web&dID=10244687&searchType=External), PDF p. 10 Application and Draft Permit; p. 1 cover letter November 3, 2026 |

For each record, the permit number, applicant, proposal, street address, city and
county were checked within the same official notice. The first two facility labels
are descriptive names derived from the applicant and facility type; the notices do
not supply separate formal facility names. Arkema's package also identifies
RN100216373 and application 39499. Its JSON source date is the package cover date.

All three have `status: unverified`, `deadline: null`. The notices describe public
participation but do not establish a verified calendar deadline or current open/
closed status as of this check. Publication-relative hearing-request periods are
not treated as calendar comment deadlines. A pending-application listing or an old
notice alone is not proof that comments remain open. Summary text describes the
application rather than claiming it has been granted. These records are not live
status tracking and do not include later agency actions. In particular, permit
182843 also has a later preliminary-decision notice in TCEQ records; its status and
publication dates would need further verification before any open/closed claim.

These agency notice forms are marked “Example A” or supplied in an official
publication package; they are not proof-of-publication affidavits. No technical
review, facility history, or independent viewpoint has been loaded for these cases.
The UI labels them “Summary only” and does not offer PAL50's sample answer on them.

Validation: all four JSON records parsed, permit IDs were unique, all source
references resolved, and all nine new passage excerpts matched downloaded official
PDF text after whitespace normalization. Relevant pages were rendered and inspected.
