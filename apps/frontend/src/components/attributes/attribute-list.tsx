import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AddAttributePopover } from './add-attribute-popover'
import { AttributeField } from './attribute-field'
import { type Attribute, ROLE_ORDER, type Role } from './types'

interface AttributeListProps {
  title?: string
  attributes: Attribute[]
  userRole: Role
  onChange: (key: string, value: Attribute['value']) => void
  onDelete?: (key: string) => void
  onAdd?: (attribute: Attribute) => void
  createRole?: Role
  deleteRole?: Role
  layout?: 'stack' | 'grid'
  flat?: boolean
}

export function AttributeList({
  title = 'Attributes',
  attributes,
  userRole,
  onChange,
  onDelete,
  onAdd,
  createRole = 'LEADER',
  deleteRole = 'LEADER',
  layout = 'stack',
  flat = false
}: AttributeListProps) {
  const canCreate = !!onAdd && ROLE_ORDER[userRole] >= ROLE_ORDER[createRole]

  const header = (
    <div className='flex items-center justify-between px-5 py-3'>
      <p className='text-sm font-medium tracking-wide text-muted-foreground uppercase'>{title}</p>
      {canCreate && onAdd && <AddAttributePopover onAdd={onAdd} />}
    </div>
  )

  const body = (
    <div className='px-2 py-2'>
      {attributes.length === 0 ? (
        <p className='py-8 text-center text-sm text-muted-foreground'>No attributes defined.</p>
      ) : layout === 'grid' ? (
        <div className='grid grid-cols-1 xl:grid-cols-2'>
          {attributes.map(attr => (
            <AttributeField
              key={attr.key}
              attribute={attr}
              userRole={userRole}
              onChange={onChange}
              onDelete={onDelete}
              deleteRole={deleteRole}
              compact
            />
          ))}
        </div>
      ) : (
        attributes.map(attr => (
          <AttributeField
            key={attr.key}
            attribute={attr}
            userRole={userRole}
            onChange={onChange}
            onDelete={onDelete}
            deleteRole={deleteRole}
          />
        ))
      )}
    </div>
  )

  if (flat) {
    return (
      <>
        {header}
        {body}
      </>
    )
  }

  return (
    <Card className='border bg-card'>
      <CardContent className='p-0'>
        {header}
        <Separator />
        {body}
      </CardContent>
    </Card>
  )
}
