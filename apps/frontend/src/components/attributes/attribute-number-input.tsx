import { useEffect, useRef } from 'react'

interface AttributeNumberInputProps {
  value: number
  onChange: (value: number) => void
  onCommit: () => void
  onCancel: () => void
  step?: number
}

export function AttributeNumberInput({
  value,
  onChange,
  onCommit,
  onCancel,
  step = 1
}: AttributeNumberInputProps) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])

  const adjust = (delta: number) => {
    const next = Number.parseFloat(((value ?? 0) + delta).toFixed(10))
    onChange(next)
    ref.current?.focus()
  }

  return (
    <div className='flex h-8 items-stretch overflow-hidden rounded-md border border-input bg-background text-sm ring-offset-background focus-within:ring-1 focus-within:ring-ring'>
      <input
        ref={ref}
        type='number'
        step={step}
        value={value ?? ''}
        onChange={e => onChange(Number.parseFloat(e.target.value))}
        onBlur={onCommit}
        onKeyDown={e => {
          if (e.key === 'Enter') onCommit()
          if (e.key === 'Escape') onCancel()
        }}
        className='w-full min-w-0 flex-1 bg-transparent px-3 font-mono outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
      />
      <div className='flex flex-col border-l border-input'>
        <button
          type='button'
          tabIndex={-1}
          onMouseDown={e => {
            e.preventDefault()
            adjust(step)
          }}
          className='flex flex-1 items-center justify-center px-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
          aria-label='Increase'
        >
          <span className='text-xs leading-none'>+</span>
        </button>
        <div className='h-px bg-input' />
        <button
          type='button'
          tabIndex={-1}
          onMouseDown={e => {
            e.preventDefault()
            adjust(-step)
          }}
          className='flex flex-1 items-center justify-center px-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
          aria-label='Decrease'
        >
          <span className='text-xs leading-none'>-</span>
        </button>
      </div>
    </div>
  )
}
