import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { authService } from '@/lib/auth/service'
import { authStore } from '@/lib/auth/store'
import { cn } from '@/lib/utils'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

type LoginFormProps = React.ComponentProps<'form'> & {
  redirect?: string
}

export function LoginForm({ className, redirect, ...props }: LoginFormProps) {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = String(formData.get('email') || '')
    const password = String(formData.get('password') || '')

    try {
      setLoading(true)

      const { user } = await authService.login(email, password)

      authStore.setUser(user)

      navigate({
        to: redirect || '/app',
        replace: true
      })
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className={cn('flex flex-col gap-6', className)} {...props}>
      <FieldGroup>
        <div className='flex flex-col items-center gap-1 text-center'>
          <h1 className='text-2xl font-bold'>Login to your account</h1>
          <p className='text-sm text-balance text-muted-foreground'>
            Enter your email below to login to your account
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor='email'>Email</FieldLabel>
          <Input id='email' name='email' type='email' placeholder='m@example.com' required />
        </Field>

        <Field>
          <div className='flex items-center'>
            <FieldLabel htmlFor='password'>Password</FieldLabel>
            <span className='ml-auto text-sm text-muted-foreground'>
              Forgot your password?
            </span>
          </div>
          <Input id='password' name='password' type='password' required />
        </Field>

        {error && <p className='text-sm text-red-500 text-center'>{error}</p>}

        <Field>
          <Button type='submit' disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Field>

        <Field>
          <FieldDescription className='text-center'>
            Don&apos;t have an account? Contact your group administrator.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
