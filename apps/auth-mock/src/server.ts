import crypto from 'node:crypto'
import cors from '@fastify/cors'
import Fastify from 'fastify'
import jwt from 'jsonwebtoken'

const app = Fastify()

app.register(cors, {
  origin: true,
  credentials: true
})

const SECRET = process.env.JWT_SECRET || 'dev-secret'

type LoginBody = {
  email: string
  password: string
}

type TokenPayload = {
  id: string
  name: string
  email: string
  isAdmin: boolean
}

function generateUserId(email: string, password: string) {
  return crypto.createHash('sha256').update(`${email}`).digest('hex')
}

const mockUsers: Record<string, { name: string; isAdmin: boolean }> = {
  'admin@example.com': {
    name: 'Administrador Exemplo',
    isAdmin: true
  },
  'tobias@example.com': {
    name: 'Tobias Cadoná Marion',
    isAdmin: false
  },
  'lucas@example.com': {
    name: 'Lucas Silva',
    isAdmin: false
  },
  'jonas@example.com': {
    name: 'Jonas Martelo',
    isAdmin: false
  }
}

function getUserFromEmail(email: string): Omit<TokenPayload, 'id'> {
  const normalizedEmail = email.toLowerCase().trim()

  const mockUser = mockUsers[normalizedEmail]

  if (mockUser) {
    return {
      name: mockUser.name,
      email,
      isAdmin: mockUser.isAdmin
    }
  }

  const nameFromEmail = email.split('@')[0]

  return {
    name: nameFromEmail,
    email,
    isAdmin: false
  }
}

app.post<{ Body: LoginBody }>('/login', async (request, reply) => {
  const { email, password } = request.body

  if (!email || !password) {
    return reply.status(400).send({ error: 'Missing credentials' })
  }

  const userId = generateUserId(email, password)

  const baseUser = getUserFromEmail(email)

  const user: TokenPayload = {
    id: userId,
    ...baseUser
  }

  const token = jwt.sign(user, SECRET, { expiresIn: '12h' })

  return { token, user }
})

app.get('/me', async (request, reply) => {
  const authHeader = request.headers.authorization

  if (!authHeader) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const decoded = jwt.verify(token, SECRET)
    return decoded
  } catch (err) {
    return reply.status(401).send({ error: 'Invalid token' })
  }
})

app.get('/health', async () => ({ ok: true }))

app.listen({ port: 4000, host: '0.0.0.0' }).then(() => {
  console.log('Auth mock running on http://localhost:4000')
})
