import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { AuditLog } from '@/lib/api/get-audit-logs'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { ChangesDisplay } from './changes-display'

interface AuditRowProps {
  log: AuditLog
  isExpanded: boolean
  onToggle: () => void
}

function changedFieldsCount(log: AuditLog): number {
  return Object.keys(log.changes).length
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'text-green-600 dark:text-green-400 border-green-600/30',
  UPDATE: 'text-blue-600 dark:text-blue-400 border-blue-600/30',
  ARCHIVE: 'text-orange-600 dark:text-orange-400 border-orange-600/30',
  MOVE: 'text-purple-600 dark:text-purple-400 border-purple-600/30',
  HANDLE: 'text-muted-foreground',
  SHARE: 'text-teal-600 dark:text-teal-400 border-teal-600/30'
}

export function AuditRow({ log, isExpanded, onToggle }: AuditRowProps) {
  return (
    <>
      <TableRow className={isExpanded ? 'border-b-0' : undefined}>
        {/* Data */}
        <TableCell className='text-sm text-muted-foreground whitespace-nowrap'>
          {new Date(log.createdAt).toLocaleString('pt-BR')}
        </TableCell>

        {/* Entidade: tipo + ID curto com tooltip */}
        <TableCell>
          <div className='flex flex-col gap-1'>
            <Badge variant='outline'>{log.entityType}</Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <code className='text-xs text-muted-foreground cursor-default'>
                    {log.entityId.slice(0, 8)}
                  </code>
                </TooltipTrigger>
                <TooltipContent>
                  <p className='font-mono text-xs'>{log.entityId}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </TableCell>

        {/* Ação */}
        <TableCell>
          <Badge variant='outline' className={ACTION_COLORS[log.action]}>
            {log.action}
          </Badge>
        </TableCell>

        {/* Usuário */}
        <TableCell className='text-sm'>
          {log.user ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className='cursor-default'>{log.user.name}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{log.user.email}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span className='text-muted-foreground italic'>System</span>
          )}
        </TableCell>

        {/* Botão expand/collapse + contador de campos alterados */}
        <TableCell className='text-center'>
          <Button variant='ghost' size='sm' onClick={onToggle} className='h-7 gap-1 px-2'>
            {changedFieldsCount(log) > 0 && (
              <span className='text-xs text-muted-foreground'>{changedFieldsCount(log)}</span>
            )}
            {isExpanded ? <ChevronDown className='size-4' /> : <ChevronRight className='size-4' />}
          </Button>
        </TableCell>
      </TableRow>

      {/* Linha expandida com changes */}
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={5} className='bg-muted/30 pb-4 pt-2 px-6 whitespace-normal break-all'>
            <ChangesDisplay action={log.action} changes={log.changes} />
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
