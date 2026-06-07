import type { AuditAction } from '@/lib/api/get-audit-logs'

interface ChangesDisplayProps {
  action: AuditAction
  changes: Record<string, unknown>
}

// Detecta se um valor é um diff { from, to } gerado por auditUpdate
function isDiff(value: unknown): value is { from: unknown; to: unknown } {
  return typeof value === 'object' && value !== null && 'from' in value && 'to' in value
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function DiffTable({ entries }: { entries: [string, unknown][] }) {
  return (
    <div className='min-w-0 overflow-x-auto'>
      <table className='text-sm font-mono border-separate border-spacing-x-4'>
        <thead>
          <tr className='text-xs text-muted-foreground'>
            <th className='text-left font-normal pb-1'>Field</th>
            <th className='text-left font-normal pb-1'>Before</th>
            <th className='text-left font-normal pb-1'>After</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key} className='align-baseline'>
              <td className='text-muted-foreground whitespace-nowrap pr-2'>{key}</td>
              {isDiff(value) ? (
                <>
                  <td className='text-destructive line-through break-all'>
                    {formatValue(value.from)}
                  </td>
                  <td className='text-green-600 dark:text-green-400 break-all'>
                    {formatValue(value.to)}
                  </td>
                </>
              ) : (
                <td colSpan={2} className='break-all'>
                  {formatValue(value)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// MOVE registra um snapshot plano com pares fromX/toX (ex.: fromBoxId/toBoxId).
// Agrupa esses pares num único diff { campo: { from, to } } reaproveitável pela DiffTable.
function pairFromTo(
  entries: [string, unknown][]
): [string, { from: unknown; to: unknown }][] | null {
  const fields = new Map<string, { from: unknown; to: unknown }>()

  for (const [key, value] of entries) {
    const fromMatch = key.match(/^from(.+)/)
    const toMatch = key.match(/^to(.+)/)

    if (!fromMatch && !toMatch) return null

    const suffix = (fromMatch ?? toMatch)?.[1] ?? ''
    const field = suffix.charAt(0).toLowerCase() + suffix.slice(1)
    const entry = fields.get(field) ?? { from: undefined, to: undefined }

    if (fromMatch) entry.from = value
    else entry.to = value

    fields.set(field, entry)
  }

  return Array.from(fields.entries())
}

export function ChangesDisplay({ action, changes }: ChangesDisplayProps) {
  const entries = Object.entries(changes)

  if (entries.length === 0) {
    return <p className='text-sm text-muted-foreground'>No changes recorded.</p>
  }

  // Diffs no formato { campo: { from, to } } — UPDATE, HANDLE e similares
  if (entries.some(([, value]) => isDiff(value))) {
    return <DiffTable entries={entries} />
  }

  // MOVE: snapshot plano com pares fromX/toX — reagrupa em Antes/Depois
  if (action === 'MOVE') {
    const paired = pairFromTo(entries)
    if (paired) {
      return <DiffTable entries={paired} />
    }
  }

  // CREATE / ARCHIVE / SHARE / outros: snapshot simples de key-value
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
