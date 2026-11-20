import type { CommentStatus } from '../../types'
import { Badge, type BadgeTone } from './Badge'

const config: Record<CommentStatus, { tone: BadgeTone; label: string; dot: string }> = {
  open: { tone: 'green', label: 'Comments open', dot: 'bg-emerald-500' },
  closed: { tone: 'slate', label: 'Comment period closed', dot: 'bg-slate-400' },
  unverified: { tone: 'amber', label: 'Status unverified', dot: 'bg-amber-500' },
}

export function StatusBadge({ status }: { status: CommentStatus }) {
  const c = config[status]
  return (
    <Badge tone={c.tone}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} aria-hidden />
      {c.label}
    </Badge>
  )
}
