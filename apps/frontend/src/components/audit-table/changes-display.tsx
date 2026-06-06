import type { AuditAction } from '@/lib/api/get-audit-logs'

interface ChangesDisplayProps {
  action: AuditAction
  changes: Record<string, unknown>
}

// Detecta se um valor é um diff { from, to } gerado por auditUpdate
function isDiff(value: unknown): value is { from: unknown; to: unknown } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'from' in value &&
    'to' in value
  )
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function ChangesDisplay({ action, changes }: ChangesDisplayProps) {
  const entries = Object.entries(changes)

  if (entries.length === 0) {
    return <p className='text-sm text-muted-foreground'>No changes recorded.</p>
  }

  // UPDATE: mostra campos com diff from → to
  if (action === 'UPDATE') {
    return (
      <div className='flex flex-col gap-1 min-w-0'>
        {entries.map(([key, value]) => (
          <div key={key} className='flex items-baseline gap-2 text-sm font-mono min-w-0'>
            <span className='text-muted-foreground min-w-32 shrink-0'>{key}</span>
            {isDiff(value) ? (
              <span className='flex flex-wrap items-center gap-1.5 min-w-0 break-all'>
                <span className='text-destructive line-through'>{formatValue(value.from)}</span>
                <span className='text-muted-foreground'>→</span>
                <span className='text-green-600 dark:text-green-400'>{formatValue(value.to)}</span>
              </span>
            ) : (
              <span className='break-all min-w-0'>{formatValue(value)}</span>
            )}
          </div>
        ))}
      </div>
    )
  }

  // CREATE / ARCHIVE / outros: snapshot simples de key-value
  return (
    <div className='flex flex-col gap-1 min-w-0'>
      {entries.map(([key, value]) => (
        <div key={key} className='flex items-baseline gap-2 text-sm font-mono min-w-0'>
          <span className='text-muted-foreground min-w-32 shrink-0'>{key}</span>
          <span className='break-all min-w-0'>{formatValue(value)}</span>
        </div>
      ))}
    </div>
  )
}
