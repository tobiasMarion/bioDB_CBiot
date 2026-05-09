import { Card, CardContent } from '@/components/ui/card'

export function StatCard({
  label,
  value,
  subtext
}: {
  label: string
  value: string
  subtext: string
}) {
  return (
    <Card className='relative overflow-hidden border bg-linear-to-br from-slate-50 via-white to-cyan-50/40 dark:bg-none dark:bg-background'>
      <div className='absolute inset-0 z-0 bg-[radial-gradient(circle_at_80%_50%,rgba(34,211,238,0.15),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_50%,rgba(34,211,238,0.06),transparent_50%)]' />
      <CardContent className='relative z-20 p-4'>
        <div className='space-y-2'>
          <p className='text-sm font-medium tracking-wide text-muted-foreground uppercase'>
            {label}
          </p>
          <div className='space-y-1'>
            <span className='text-3xl font-semibold tracking-tight'>{value}</span>
            <p className='text-sm text-muted-foreground'>{subtext}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
