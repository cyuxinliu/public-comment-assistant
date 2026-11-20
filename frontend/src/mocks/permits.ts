/**
 * MOCK DATA — development placeholders only.
 *
 * Every facility, permit number, date, emission figure, and viewpoint in this file is
 * fictional. None of it describes a real facility or a real agency decision. Component 1
 * (permit data & sources) will supply verified records through the API.
 */
import type { Permit } from '../types'

const CASE_ID = 'mock-refinery-renewal'
const doc = (permitId: string, sourceId: string) => `/documents/${permitId}/${sourceId}`

export const mockPermits: Permit[] = [
  {
    id: CASE_ID,
    dataStatus: 'mock',
    permitNumber: 'MOCK-0001',
    permitType: 'Air quality permit renewal and amendment',
    facilityName: 'Placeholder Refinery (sample facility)',
    location: { city: 'Beaumont', county: 'Jefferson' },
    proposalSummary:
      'The operator is asking to renew its air permit and to raise the allowed nitrogen oxides (NOx) limit for two process heaters. This is placeholder text for the demo.',
    publicComment: {
      status: 'open',
      deadline: '2026-12-18',
      noticeSourceId: 'src-notice',
    },
    sources: [
      {
        id: 'src-notice',
        title: 'Notice of Application and Preliminary Decision (mock)',
        url: doc(CASE_ID, 'src-notice'),
        scope: 'permit',
        documentType: 'official_notice',
        publisher: 'Permitting agency (mock)',
        date: '2026-11-02',
        passages: [
          {
            id: 'n1',
            locator: 'Section 1 — Application',
            text: 'The applicant has applied for renewal of air quality permit MOCK-0001 for the Placeholder Refinery in Beaumont, Jefferson County. The application also requests an increase in the maximum allowable emission rate for nitrogen oxides (NOx) from Heaters H-1 and H-2.',
          },
          {
            id: 'n2',
            locator: 'Section 3 — Preliminary Decision',
            text: 'The executive director has made a preliminary decision that the application meets applicable requirements. This decision is not final and may change after public comments are considered.',
          },
          {
            id: 'n3',
            locator: 'Section 4 — Public Comment',
            text: 'Written public comments may be submitted until December 18, 2026. Comments must reference permit number MOCK-0001.',
          },
          {
            id: 'n4',
            locator: 'Section 5 — Public Meeting',
            text: 'A public meeting has not been scheduled. A meeting may be held if requested by a member of the public or a local legislator.',
          },
        ],
      },
      {
        id: 'src-technical',
        title: 'Draft Permit Technical Review (mock)',
        url: doc(CASE_ID, 'src-technical'),
        scope: 'permit',
        documentType: 'technical_review',
        publisher: 'Permitting agency (mock)',
        date: '2026-10-20',
        passages: [
          {
            id: 't1',
            locator: 'p. 6, Table 2',
            text: 'Heaters H-1 and H-2, combined: NOx 142.0 tons per year (proposed maximum allowable). Currently authorized: 118.5 tons per year.',
          },
          {
            id: 't2',
            locator: 'p. 7, Section 3.2',
            text: 'The increase in authorized NOx is associated with a proposed increase in heater firing rate. The applicant states that low-NOx burners will be installed on Heater H-2.',
          },
          {
            id: 't3',
            locator: 'p. 9, Section 5',
            text: 'Emission limits in this review are maximum allowable rates. They are not measurements of actual emissions.',
          },
        ],
      },
      {
        id: 'src-application',
        title: 'Permit Application Summary (mock)',
        url: doc(CASE_ID, 'src-application'),
        scope: 'permit',
        documentType: 'application',
        publisher: 'Placeholder Refinery (applicant, mock)',
        date: '2026-08-14',
        passages: [
          {
            id: 'a1',
            locator: 'p. 2, Project Description',
            text: 'The project will allow the refinery to increase heater capacity to support existing operations. The applicant expects new low-NOx burners on Heater H-2 to offset part of the increase.',
          },
        ],
      },
      {
        id: 'src-community',
        title: 'Community Comment Letter (mock)',
        url: doc(CASE_ID, 'src-community'),
        scope: 'permit',
        documentType: 'public_comment',
        publisher: 'Example Neighborhood Coalition (mock organization)',
        date: '2026-11-10',
        passages: [
          {
            id: 'c1',
            locator: 'p. 1',
            text: 'We are concerned that higher allowable NOx limits could worsen ozone levels in neighborhoods next to the facility. We ask the agency to hold a public meeting in Beaumont before making a final decision.',
          },
        ],
      },
      {
        id: 'src-history',
        title: 'Facility Emissions Inventory Summary, 2023–2025 (mock)',
        url: doc(CASE_ID, 'src-history'),
        scope: 'facility_history',
        documentType: 'facility_record',
        publisher: 'Permitting agency (mock)',
        date: '2026-06-30',
        passages: [
          {
            id: 'h1',
            locator: 'Emissions Summary, row 3',
            text: 'Reported NOx emissions, Heaters H-1 and H-2 combined: 2023 — 96.4 tons; 2024 — 101.9 tons; 2025 — 99.7 tons.',
          },
          {
            id: 'h2',
            locator: 'Compliance Notes',
            text: 'Sample record: one reportable emissions event logged in 2024 involving Heater H-1. Placeholder text; no real compliance history is represented.',
          },
        ],
      },
    ],
    viewpoints: [
      {
        speaker: 'Placeholder Refinery (applicant, mock)',
        speakerRole: 'applicant',
        summary:
          'Says the added heater capacity supports existing operations and that new low-NOx burners will offset part of the increase.',
        sourceId: 'src-application',
      },
      {
        speaker: 'Permitting agency (mock)',
        speakerRole: 'agency',
        summary:
          'Made a preliminary decision that the application meets requirements; the decision is not final until comments are considered.',
        sourceId: 'src-notice',
      },
      {
        speaker: 'Example Neighborhood Coalition (mock organization)',
        speakerRole: 'community',
        summary:
          'Concerned that higher NOx limits could worsen local ozone; asks for a public meeting in Beaumont.',
        sourceId: 'src-community',
      },
    ],
  },
  {
    id: 'mock-chemical-plant-amendment',
    dataStatus: 'mock',
    permitNumber: 'MOCK-0002',
    permitType: 'Air quality permit amendment',
    facilityName: 'Placeholder Chemical Plant (sample facility)',
    location: { city: 'Nederland', county: 'Jefferson' },
    proposalSummary:
      'The operator asked to add a new storage tank and update the permit to cover its emissions. Placeholder text — this case is not fully loaded.',
    publicComment: {
      status: 'closed',
      deadline: '2026-09-30',
      noticeSourceId: 'src-notice-2',
    },
    sources: [
      {
        id: 'src-notice-2',
        title: 'Notice of Application (mock)',
        url: doc('mock-chemical-plant-amendment', 'src-notice-2'),
        scope: 'permit',
        documentType: 'official_notice',
        publisher: 'Permitting agency (mock)',
        date: '2026-08-28',
        passages: [
          {
            id: 'n1',
            locator: 'Section 4 — Public Comment',
            text: 'Written public comments may be submitted until September 30, 2026.',
          },
        ],
      },
    ],
    viewpoints: [],
  },
  {
    id: 'mock-terminal-new-permit',
    dataStatus: 'mock',
    permitNumber: 'MOCK-0003',
    permitType: 'New air quality permit',
    facilityName: 'Placeholder Marine Terminal (sample facility)',
    location: { city: 'Orange', county: 'Orange' },
    proposalSummary:
      'An application for a new permit covering loading operations. No official notice has been loaded, so the comment period cannot be verified. Placeholder text.',
    publicComment: {
      status: 'unverified',
      deadline: null,
      noticeSourceId: null,
    },
    sources: [],
    viewpoints: [],
  },
]
