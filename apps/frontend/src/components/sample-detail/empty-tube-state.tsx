export function EmptyTubeState() {
  return (
    <div className='flex min-h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 py-12 text-center'>
      <p className='text-sm font-medium text-muted-foreground'>No tube selected</p>
      <p className='text-xs text-muted-foreground/50'>
        Select a tube to view its location and attributes
      </p>
    </div>
  )
}
