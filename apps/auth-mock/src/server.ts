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
  isAdmin?: boolean
}

type TokenPayload = {
  id: string
  name: string
  email: string
  isAdmin: boolean
}

function generateUserId(email: string, password: string) {
  return crypto.createHash('sha256').update(`${email}:${password}`).digest('hex')
}

app.post<{ Body: LoginBody }>('/login', async (request, reply) => {
  const { email, password, isAdmin } = request.body

  if (!email || !password) {
    return reply.status(400).send({ error: 'Missing credentials' })
  }

  const userId = generateUserId(email, password)

  const user: TokenPayload = {
    id: userId,
    name: 'John Doe',
    email,
    isAdmin: isAdmin ?? true
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

app.listen({ port: 4000, host: '0.0.0.0' })
