import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

import { Button } from '../ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '../ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

type Researcher = {
  id: string
  name: string
  email: string
}

interface CreateGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const researchers: Researcher[] = [
  {
    id: '1',
    name: 'Arthur Padilha',
    email: 'arthur@ufrgs.br'
  },
  {
    id: '2',
    name: 'Johann Hardts',
    email: 'johann@ufrgs.br'
  },
  {
    id: '3',
    name: 'Vítor Feijó',
    email: 'vitor@ufrgs.br'
  },
  {
    id: '4',
    name: 'Marcelo Walter',
    email: 'marcelo.walter@ufrgs.br'
  }
]

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const [step, setStep] = useState<1 | 2>(1)

  const [groupName, setGroupName] = useState('')
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null)

  const [isCreating, setIsCreating] = useState(false)
  const [isInviting, setIsInviting] = useState(false)

  const [leaderPopoverOpen, setLeaderPopoverOpen] = useState(false)
  const [selectedLeaderId, setSelectedLeaderId] = useState('')

  const selectedLeader = useMemo(
    () => researchers.find(item => item.id === selectedLeaderId) ?? null,
    [selectedLeaderId]
  )

  useEffect(() => {
    if (open) {
      setStep(1)
      setGroupName('')
      setCreatedGroupId(null)
      setIsCreating(false)
      setIsInviting(false)
      setSelectedLeaderId('')
      setLeaderPopoverOpen(false)
    }
  }, [open])

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault()

    setIsCreating(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 800))

      setCreatedGroupId('mock-group-id-123')
      setStep(2)
    } catch (error) {
      console.error(error)
    } finally {
      setIsCreating(false)
    }
  }

  async function handleInviteLeader(e: React.FormEvent) {
    e.preventDefault()

    if (!createdGroupId || !selectedLeaderId) return

    setIsInviting(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      onOpenChange(false)
    } catch (error) {
      console.error(error)
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-115'>
        {step === 1 ? (
          <form onSubmit={handleCreateGroup}>
            <DialogHeader>
              <DialogTitle>Criar grupo</DialogTitle>

              <DialogDescription>Dê um nome ao novo grupo de pesquisa do bioDB.</DialogDescription>
            </DialogHeader>

            <div className='py-4'>
              <div className='grid gap-2'>
                <Label htmlFor='group-name'>Nome do Grupo</Label>

                <Input
                  id='group-name'
                  placeholder='Ex: Laboratório de Genômica'
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  disabled={isCreating}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isCreating}
              >
                Cancelar
              </Button>

              <Button type='submit' disabled={!groupName.trim() || isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Criando...
                  </>
                ) : (
                  'Continuar'
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleInviteLeader}>
            <DialogHeader>
              <DialogTitle>Atribuir Liderança</DialogTitle>

              <DialogDescription>
                Selecione o pesquisador responsável pelo grupo <strong>{groupName}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className='py-4'>
              <div className='grid gap-2'>
                <Label>Pesquisador (Líder)</Label>

                <Popover open={leaderPopoverOpen} onOpenChange={setLeaderPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type='button'
                      variant='outline'
                      aria-expanded={leaderPopoverOpen}
                      className='w-full justify-between font-normal'
                      disabled={isInviting}
                    >
                      {selectedLeader ? selectedLeader.name : 'Selecionar pesquisador...'}

                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className='w-(--radix-popover-trigger-width) p-0' align='start'>
                    <Command>
                      <CommandInput placeholder='Buscar pesquisador...' />

                      <CommandList>
                        <CommandEmpty>Nenhum pesquisador encontrado.</CommandEmpty>

                        <CommandGroup>
                          {researchers.map(researcher => (
                            <CommandItem
                              key={researcher.id}
                              value={`${researcher.name} ${researcher.email}`}
                              onSelect={() => {
                                setSelectedLeaderId(researcher.id)
                                setLeaderPopoverOpen(false)
                              }}
                              className='cursor-pointer'
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selectedLeaderId === researcher.id ? 'opacity-100' : 'opacity-0'
                                )}
                              />

                              <div className='flex flex-col'>
                                <span>{researcher.name}</span>

                                <span className='text-xs text-muted-foreground'>
                                  {researcher.email}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='ghost'
                onClick={() => onOpenChange(false)}
                disabled={isInviting}
              >
                Pular por enquanto
              </Button>

              <Button type='submit' disabled={!selectedLeaderId || isInviting}>
                {isInviting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Enviando...
                  </>
                ) : (
                  'Confirmar'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
