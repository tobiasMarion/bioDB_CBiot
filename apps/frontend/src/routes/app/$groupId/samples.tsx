import Scene from '@/components/dna'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/$groupId/samples')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <div className='flex flex-col gap-10 px-5 py-6 lg:px-8'>
        {/* EDITADO: Adicionado um background gradiente sutil no light mode e resetado no dark mode */}
        <Card className='relative overflow-hidden border bg-linear-to-br from-slate-50 via-white to-cyan-50/40 dark:bg-none dark:bg-background'>
          {/* EDITADO: Glow mais forte no light mode (0.15) e contido no dark mode (0.06) */}
          <div className='absolute inset-0 z-0 bg-[radial-gradient(circle_at_80%_50%,rgba(34,211,238,0.15),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_50%,rgba(34,211,238,0.06),transparent_50%)]' />

          {/* EDITADO: Adicionado 'hidden md:block' para esconder o DNA em celulares (telas pequenas) */}
          <div className='absolute inset-y-0 right-0 z-10 hidden w-[80%] pointer-events-none lg:block lg:w-[65%]'>
            <div className='h-full w-full'>
              <Scene />
            </div>
          </div>

          <CardContent className='relative z-20 px-8 py-10 lg:px-10 lg:py-12'>
            <div className='max-w-2xl space-y-4'>
              <div className='space-y-2'>
                <p className='text-sm font-medium tracking-wide text-muted-foreground uppercase'>
                  Molecular Research Laboratory
                </p>

                <h1 className='text-3xl font-semibold tracking-tight lg:text-4xl'>
                  Molecular Sample Group
                </h1>
              </div>

              <p className='max-w-lg text-sm leading-relaxed text-muted-foreground lg:text-base'>
                Organization and monitoring of laboratory samples, analytical workflows and
                experimental pipelines.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* STATS */}
        <section className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className='p-5'>
                <div className='space-y-4'>
                  <Skeleton className='h-4 w-24 rounded-md' />

                  <div className='space-y-2'>
                    <Skeleton className='h-8 w-20 rounded-md' />
                    <Skeleton className='h-3 w-32 rounded-md' />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* TABLE */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0'>
            <div className='space-y-2'>
              <Skeleton className='h-5 w-40 rounded-md' />
              <Skeleton className='h-3 w-64 rounded-md' />
            </div>

            <div className='flex gap-3'>
              <Skeleton className='h-9 w-24 rounded-lg' />
              <Skeleton className='h-9 w-32 rounded-lg' />
            </div>
          </CardHeader>

          <CardContent className='space-y-3'>
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className='grid grid-cols-5 gap-6 rounded-xl border bg-background/40 px-4 py-4'
              >
                {[...Array(5)].map((_, j) => (
                  <Skeleton key={j} className='h-4 w-full rounded-md' />
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
