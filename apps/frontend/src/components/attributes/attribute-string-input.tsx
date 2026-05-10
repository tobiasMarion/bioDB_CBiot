import { Input } from '@/components/ui/input'
import { useEffect, useRef } from 'react'

interface AttributeStringInputProps {
  value: string
  onChange: (value: string) => void
  onCommit: () => void
  onCancel: () => void
  placeholder?: string
}

export function AttributeStringInput({
  value,
  onChange,
  onCommit,
  onCancel,
  placeholder = 'Enter value…'
}: AttributeStringInputProps) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])

  return (
    <Input
      ref={ref}
      value={value}
      placeholder={placeholder}
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
