/**
 * Shared data model. Mirrors the "Shared permit record format" in AGENTS.md.
 * Fields marked "extension" are optional additions proposed in docs/api-contract.md;
 * the UI works when they are absent.
 */

export type CommentStatus = 'open' | 'closed' | 'unverified'

/** Which document set a source belongs to. */
export type SourceScope = 'permit' | 'facility_history'

/** What the user asks the AI to search. */
export type SearchScope = SourceScope | 'both'

/** Whether a record is real, verified data or a development placeholder. */
export type DataStatus = 'mock' | 'verified'

export interface Location {
  city: string
  county: string
}

export interface Facility {
  name: string
  location: Location
}

export interface Passage {
  /** extension: stable id so citations can point at an exact passage */
  id?: string
  text: string
  /** e.g. "p. 4" or "Emissions Summary" */
  locator: string
}

export type DocumentType =
  | 'official_notice'
  | 'application'
  | 'technical_review'
  | 'facility_record'
  | 'public_comment'
  | 'other'

/** A source document attached to a permit case ("sources" in AGENTS.md). */
export interface Document {
  id: string
  title: string
  url: string
  scope: SourceScope
  passages: Passage[]
  /** extension */
  documentType?: DocumentType
  /** extension: agency, applicant, or organization that published it */
  publisher?: string
  /** extension: ISO date (YYYY-MM-DD) */
  date?: string
}

export type SpeakerRole = 'applicant' | 'agency' | 'community' | 'other'

export interface Viewpoint {
  speaker: string
  summary: string
  sourceId: string
  /** extension */
  speakerRole?: SpeakerRole
}

export interface PublicComment {
  status: CommentStatus
  /** ISO date (YYYY-MM-DD) taken from the official notice, or null if unverified */
  deadline: string | null
  /** id of the official notice in `sources`, or null if no notice is loaded */
  noticeSourceId: string | null
  /** Optional official decision supporting current status separately from the notice. */
  statusSourceId?: string
}

export interface Permit {
  id: string
  permitNumber: string
  facilityName: string
  location: Location
  proposalSummary: string
  publicComment: PublicComment
  sources: Document[]
  viewpoints: Viewpoint[]
  /** extension: e.g. "Air quality permit renewal" */
  permitType?: string
  /** extension: "mock" records are labeled throughout the UI */
  dataStatus?: DataStatus
}

/** Shape returned by the permit list endpoint. */
export type PermitSummary = Pick<
  Permit,
  | 'id'
  | 'permitNumber'
  | 'facilityName'
  | 'location'
  | 'proposalSummary'
  | 'publicComment'
  | 'permitType'
  | 'dataStatus'
>

/** Distinguishes proposed limits from reported emissions (AGENTS.md shared rule). */
export type EmissionsKind = 'proposed_limit' | 'reported'

export interface Citation {
  sourceId: string
  /** id of the supporting passage in the source, when passages have ids */
  passageId?: string
  /** exact quoted text from the passage */
  excerpt: string
  locator: string
  emissionsKind?: EmissionsKind
}

export type AnswerStatus =
  /** answer is supported by the cited evidence */
  | 'answered'
  /** some evidence found, but not enough to fully answer */
  | 'insufficient_evidence'
  /** nothing relevant found in the selected documents */
  | 'no_evidence'
  /** question is ambiguous; see clarifyingQuestion */
  | 'needs_clarification'

export interface AskRequest {
  permitId: string
  question: string
  scope: SearchScope
}

export interface AIAnswer {
  status: AnswerStatus
  question: string
  scope: SearchScope
  /** plain-language answer; may be empty for no_evidence / needs_clarification */
  answer: string
  citations: Citation[]
  /** what the loaded records don't cover */
  missingInfo?: string
  clarifyingQuestion?: string
  /** rephrasings the user can click */
  suggestedQuestions?: string[]
  /** true for prewritten demo answers; must be labeled "Sample" */
  isSample?: boolean
}
