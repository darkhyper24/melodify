import { Hono } from 'hono'
import { cors } from 'hono/cors'
import router from './routes/authRoutes'
import profileRouter from './routes/profileRoutes'
import { initClients } from './supabase/supabase'

const app = new Hono()

app.use('*', async (c, next) => {
  try {
    await next()
  } catch (err) {
    console.error('Unhandled error:', err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

app.use('*', async (c, next) => {
  try {
    initClients(c.env)
    await next()
  } catch (err) {
    console.error('Failed to initialize clients:', err)
    return c.json({ error: 'Failed to initialize database connection' }, 500)
  }
})

app.use('*', cors())
app.get('/', (c) => c.text('welcome to melodify'))
app.route('/auth', router)
app.route('/profile', profileRouter)
export default app