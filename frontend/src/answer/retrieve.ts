import type { Document, Permit, SearchScope } from '../types'

/**
 * Pick the documents the model may read for this question.
 *
 * The curated record is small (PAL50 has 13 short passages), so every passage in the
 * selected scope goes to the model. When full documents are loaded later, replace the
 * body with a ranked search (keyword + embeddings, top-k). Callers only depend on this
 * signature, so the rest of the pipeline stays the same.
 */
export function retrieve(permit: Permit, scope: SearchScope): Document[] {
  return permit.sources.filter((s) => s.passages.length > 0 && (scope === 'both' || s.scope === scope))
}
