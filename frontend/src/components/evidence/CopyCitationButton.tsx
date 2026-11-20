import { useEffect, useState } from 'react'
import { copyText } from '../../lib/citation'
import { CheckIcon, CopyIcon } from '../ui/Icons'
import { btnSecondary } from '../ui/buttonStyles'

export function CopyCitationButton({ text, label = 'Copy excerpt and citation' }: { text: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')

  useEffect(() => {
    if (state === 'idle') return
    const t = setTimeout(() => setState('idle'), 2500)
    return () => clearTimeout(t)
  }, [state])

  return (
    <button
      type="button"
      className={`${btnSecondary} ${state === 'copied' ? 'text-emerald-800 ring-emerald-400' : ''}`}
      onClick={() => copyText(text).then(() => setState('copied'), () => setState('failed'))}
    >
      {state === 'copied' ? <CheckIcon /> : <CopyIcon />}
      {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed — select text manually' : label}
      <span className="sr-only" aria-live="polite">{state === 'copied' ? 'Excerpt and citation copied to clipboard' : ''}</span>
    </button>
  )
}
