import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import type { Attribute, AttributeType } from './types'

interface InitialValueInputProps {
  type: AttributeType
  value: Attribute['value']
  onChange: (v: Attribute['value']) => void
}

export function InitialValueInput({ type, value, onChange }: InitialValueInputProps) {
  if (type === 'boolean') {
    return (
      <div className='flex h-8 items-center gap-2'>
        <Switch checked={!!value} onCheckedChange={onChange} id='pop-initial-bool' />
        <label
          htmlFor='pop-initial-bool'
          className='cursor-pointer select-none text-xs text-muted-foreground'
        >
          {value ? 'True' : 'False'}
        </label>
      </div>
    )
  }
  if (type === 'number') {
    return (
      <Input
        type='number'
        step='any'
        value={(value as number) ?? 0}
        onChange={e => onChange(Number.parseFloat(e.target.value) || 0)}
        className='h-8 font-mono text-sm'
      />
    )
  }
  if (type === 'date') {
    return (
      <Input
        type='date'
        value={(value as string) ?? ''}
        onChange={e => onChange(e.target.value || null)}
        className='h-8 text-sm'
      />
    )
  }
  return (
    <Input
      type='text'
      value={(value as string) ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder='Optional initial value'
      className='h-8 text-sm'
    />
  )
}
