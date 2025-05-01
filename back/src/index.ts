import { Hono } from 'hono'
import { cors } from 'hono/cors'
import router from './routes/authRoutes'
import profileRouter from './routes/profileRoutes'
import { initClients } from './supabase/supabase'
import albumRouter from './routes/albumRoutes'
import homeRoutes from './routes/homeRoutes'
import songRoutes from './routes/songRoutes'
import reviewRoutes from './routes/reviewRoutes'
import playlistRouter from './routes/playlistRoutes'
import searchRoutes from './routes/searchRoutes'
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
app.route('/albums', albumRouter)
app.route('/home', homeRoutes)
app.route('/songs', songRoutes)
app.route('/reviews', reviewRoutes)
app.route('/playlists', playlistRouter)
app.route('/search', searchRoutes)
export default app