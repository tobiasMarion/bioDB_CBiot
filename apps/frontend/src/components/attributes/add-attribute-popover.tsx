import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { InitialValueInput } from './initial-value-input'
import { type Attribute, type AttributeType, ROLE_LABELS, type Role } from './types'

const TYPE_OPTIONS: { value: AttributeType; label: string }[] = [
  { value: 'string', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Boolean' }
]

const ROLE_OPTIONS: Role[] = ['RESEARCHER', 'MANAGER', 'LEADER']

interface AddAttributePopoverProps {
  onAdd: (attribute: Attribute) => void
}

export function AddAttributePopover({ onAdd }: AddAttributePopoverProps) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [type, setType] = useState<AttributeType>('string')
  const [initialValue, setInitialValue] = useState<Attribute['value']>('')
  const [minRole, setMinRole] = useState<Role>('RESEARCHER')

  const key = label
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')

  const handleTypeChange = (v: AttributeType) => {
    setType(v)
    const defaults: Record<AttributeType, Attribute['value']> = {
      string: '',
      number: 0,
      date: null,
      boolean: false
    }
    setInitialValue(defaults[v])
  }

  const handleAdd = () => {
    if (!label.trim() || !key.trim()) return
    onAdd({ key, label: label.trim(), type, minRole, value: initialValue })
    setLabel('')
    setType('string')
    setInitialValue('')
    setMinRole('RESEARCHER')
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='h-7 w-7 p-0 text-muted-foreground hover:text-foreground'
        >
          <Plus className='size-3.5' />
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-72 p-0' align='end'>
        <div className='border-b px-4 py-3'>
          <p className='text-sm font-semibold tracking-tight'>New attribute</p>
          <p className='mt-0.5 text-xs text-muted-foreground'>
            Define a custom field for this tube
          </p>
        </div>

        <div className='space-y-4 p-4'>
          <div className='space-y-1.5'>
            <Label className='text-xs text-muted-foreground'>Label</Label>
            <Input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder='e.g. Volume (µL)'
              className='h-8 text-sm'
            />
          </div>

          <Separator />

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label className='text-xs text-muted-foreground'>Type</Label>
              <Select value={type} onValueChange={v => handleTypeChange(v as AttributeType)}>
                <SelectTrigger className='h-8 text-xs'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className='text-xs'>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs text-muted-foreground'>Min. role</Label>
              <Select value={minRole} onValueChange={v => setMinRole(v as Role)}>
                <SelectTrigger className='h-8 text-xs'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map(role => (
                    <SelectItem key={role} value={role} className='text-xs'>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label className='text-xs text-muted-foreground'>
              Initial value <span className='text-muted-foreground/50'>(optional)</span>
            </Label>
            <InitialValueInput type={type} value={initialValue} onChange={setInitialValue} />
          </div>
        </div>

        <div className='px-4 pb-4'>
          <Button
            size='sm'
            className='w-full'
            disabled={!label.trim() || !key.trim()}
            onClick={handleAdd}
          >
            Add attribute
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
