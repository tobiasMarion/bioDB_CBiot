import type { Tube } from '@/components/tube/tube-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Scissors } from 'lucide-react'
import { useState } from 'react'

interface FractionateTubeDialogProps {
  tube: Tube
  isPending?: boolean
  onFractionate: (quantity: number) => void
}

export function FractionateTubeDialog({ tube, isPending = false, onFractionate }: FractionateTubeDialogProps) {
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState('1')

  const handleSubmit = () => {
    const qty = Math.floor(Number(quantity))
    if (qty < 1) return
    onFractionate(qty)
    setQuantity('1')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' className='gap-2'>
          <Scissors className='size-3.5' />
          Fractionate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fractionate tube</DialogTitle>
          <DialogDescription>
            Create copies of this tube with the same attributes. The new tubes will be
            unplaced — ready to distribute or store individually.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='rounded-lg bg-muted/50 px-4 py-3 text-sm'>
            <p className='text-muted-foreground'>
              Original tube:{' '}
              <span className='font-medium text-foreground'>
                {tube.box ? `${tube.box.label} · ${tube.box.freezer.name}` : 'Unplaced'}
              </span>
            </p>
            <p className='text-muted-foreground'>
              Attributes:{' '}
              <span className='font-medium text-foreground'>{tube.attributes.length}</span>
            </p>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='quantity'>Number of fractions</Label>
            <Input
              id='quantity'
              type='number'
              min={1}
              max={50}
              step={1}
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
            />
            <p className='text-xs text-muted-foreground'>
              How many new tubes to create from this one. Each will have the same attributes.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!quantity || Number(quantity) < 1 || isPending}>
            Create {quantity && Number(quantity) > 1 ? `${quantity} tubes` : '1 tube'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
