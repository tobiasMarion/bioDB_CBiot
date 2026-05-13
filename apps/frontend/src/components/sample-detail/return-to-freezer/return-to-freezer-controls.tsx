import type { FreezerWithBoxes } from '@/lib/api/get-group-freezers'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

interface ReturnToFreezerControlsProps {
  freezers: FreezerWithBoxes[]
  currentFreezer: FreezerWithBoxes | null
  selectedFreezerId: string | null
  selectedBoxId: string | null
  experimentNotes: string
  onFreezerChange: (id: string) => void
  onBoxChange: (id: string) => void
  onNotesChange: (notes: string) => void
}

export function ReturnToFreezerControls({
  freezers,
  currentFreezer,
  selectedFreezerId,
  selectedBoxId,
  experimentNotes,
  onFreezerChange,
  onBoxChange,
  onNotesChange
}: ReturnToFreezerControlsProps) {
  return (
    <div className='flex min-w-0 basis-2/5 flex-col gap-5 border-r px-6 py-5'>
      <div className='space-y-1.5'>
        <p className='text-sm font-medium'>Freezer</p>
        <Select value={selectedFreezerId ?? ''} onValueChange={onFreezerChange}>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Select a freezer…' />
          </SelectTrigger>
          <SelectContent>
            {freezers.map(f => (
              <SelectItem key={f.id} value={f.id}>
                <span className='block'>{f.name}</span>
                <span className='block text-xs text-muted-foreground'>
                  {f.locationDescription}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-1.5'>
        <p className='text-sm font-medium'>Box</p>
        <Select
          value={selectedBoxId ?? ''}
          onValueChange={onBoxChange}
          disabled={!currentFreezer}
        >
          <SelectTrigger className='w-full font-mono text-sm'>
            <SelectValue placeholder='Select a box…' />
          </SelectTrigger>
          <SelectContent>
            {currentFreezer?.boxes.map(b => (
              <SelectItem key={b.id} value={b.id} className='font-mono'>
                {b.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className='flex flex-1 flex-col space-y-1.5'>
        <p className='text-sm font-medium'>
          Experiment Notes{' '}
          <span className='font-normal text-muted-foreground/60'>(optional)</span>
        </p>
        <Textarea
          value={experimentNotes}
          onChange={e => onNotesChange(e.target.value)}
          placeholder='What was this tube used for?'
          className='flex-1 resize-none text-sm'
          style={{ minHeight: '120px' }}
        />
      </div>
    </div>
  )
}
