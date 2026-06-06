import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'

interface AuditPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export function AuditPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange
}: AuditPaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  if (totalPages <= 1) return null

  const renderPageNumbers = () => {
    const items: React.ReactNode[] = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink isActive={currentPage === i} onClick={() => onPageChange(i)}>
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink isActive={currentPage === 1} onClick={() => onPageChange(1)}>
            1
          </PaginationLink>
        </PaginationItem>
      )

      if (currentPage > 3) items.push(<PaginationEllipsis key='ellipsis-start' />)

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink isActive={currentPage === i} onClick={() => onPageChange(i)}>
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }

      if (currentPage < totalPages - 2) items.push(<PaginationEllipsis key='ellipsis-end' />)

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return items
  }

  return (
    <div className='flex items-center gap-4'>
      <div className='text-sm text-muted-foreground whitespace-nowrap shrink-0'>
        Showing {startItem}–{endItem} of {totalItems} results
      </div>
      <Pagination className='mx-0 w-auto flex-1 justify-end'>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(currentPage - 1)}
              aria-disabled={currentPage === 1}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : undefined}
            />
          </PaginationItem>
          {renderPageNumbers()}
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(currentPage + 1)}
              aria-disabled={currentPage === totalPages}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : undefined}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
