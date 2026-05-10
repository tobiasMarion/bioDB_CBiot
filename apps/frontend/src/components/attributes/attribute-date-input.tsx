import { Input } from '@/components/ui/input'
import { useEffect, useRef } from 'react'

interface AttributeDateInputProps {
  value: string
  onChange: (value: string) => void
  onCommit: () => void
  onCancel: () => void
}

export function AttributeDateInput({
  value,
  onChange,
  onCommit,
  onCancel
}: AttributeDateInputProps) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  return (
    <Input
      ref={ref}
      type='date'
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      onBlur={onCommit}
      onKeyDown={e => {
        if (e.key === 'Enter') onCommit()
        if (e.key === 'Escape') onCancel()
      }}
      className='h-8 text-sm'
    />
  )
}
