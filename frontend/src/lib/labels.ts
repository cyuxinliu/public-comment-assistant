import type { DocumentType, SourceScope, SpeakerRole } from '../types'

export const scopeLabel: Record<SourceScope, string> = {
  permit: 'This permit',
  facility_history: 'Facility history',
}

export const documentTypeLabel: Record<DocumentType, string> = {
  official_notice: 'Official notice',
  application: 'Application',
  technical_review: 'Technical review',
  facility_record: 'Facility record',
  public_comment: 'Public comment',
  other: 'Document',
}

export const speakerRoleLabel: Record<SpeakerRole, string> = {
  applicant: 'Applicant',
  agency: 'Agency',
  community: 'Community',
  other: 'Other',
}
