import Fastify from 'fastify'
import jwt from 'jsonwebtoken'

const app = Fastify()

const SECRET = process.env.JWT_SECRET || 'dev-secret'

type LoginBody = {
  email?: string
  name?: string
}

app.post<{ Body: LoginBody }>('/login', async (request, reply) => {
  const { email, name } = request.body || {}

  const token = jwt.sign(
    {
      sub: 'auth-1',
      name: name ?? 'User',
      email: email ?? 'test@test.com',
      isAdmin: false
    },
    SECRET,
    { expiresIn: '12h' }
  )

  return { access_token: token }
})

app.get('/me', async (_request, _reply) => {
  return {
    user: {
      name: 'Usuário Mock',
      email: 'mock@biobanco.com',
      isAdmin: true
    }
  }
})

app.get('/health', async () => ({ ok: true }))

const start = async () => {
  try {
    await app.listen({ port: 4000, host: '0.0.0.0' })
    console.log('Auth mock running on: http://localhost:4000/me')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
