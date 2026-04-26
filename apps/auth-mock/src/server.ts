import Fastify from 'fastify'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'

const app = Fastify()

const SECRET = process.env.JWT_SECRET || 'dev-secret'

type LoginBody = {
  email: string
  password: string
}

function generateUserId(email: string, password: string) {
  return crypto.createHash('sha256').update(`${email}:${password}`).digest('hex')
}

app.post<{ Body: LoginBody }>('/login', async (request, reply) => {
  const { email, password } = request.body

  if (!email || !password) {
    return reply.status(400).send({ error: 'Missing credentials' })
  }

  const userId = generateUserId(email, password)

  const token = jwt.sign(
    {
      sub: userId,
      name: 'John Doe',
      email,
      isAdmin: false
    },
    SECRET,
    { expiresIn: '12h' }
  )

  return { access_token: token }
})

app.get('/health', async () => ({ ok: true }))

app.listen({ port: 4000, host: '0.0.0.0' })
