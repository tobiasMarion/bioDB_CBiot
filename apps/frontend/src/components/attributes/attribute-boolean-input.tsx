import { Switch } from '@/components/ui/switch'

interface AttributeBooleanInputProps {
  value: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}

export function AttributeBooleanInput({
  value,
  onChange,
  disabled = false
}: AttributeBooleanInputProps) {
  return (
    <div className='flex h-8 items-center'>
      <Switch checked={!!value} onCheckedChange={onChange} disabled={disabled} />
    </div>
  )
}
