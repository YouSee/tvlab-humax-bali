// @flow

import http from 'http'
import cote from 'cote'
// import http2 from 'spdy'
import Koa from 'koa'
import helmet from 'koa-helmet'
import koalogger from 'koa-logger'
// import enforceHttps from 'koa-sslify'
// import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import socketio from 'socket.io'
import logger from './logger'
// import router from './router'

const app = new Koa()
app
  .use(koalogger())
  .use(cors())
  .use(helmet())
//   .use(bodyParser({ jsonLimit: '2mb' }))

// Error handler
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    logger.error(e)
    ctx.status = e.status || 500
    ctx.body = { error: e, errorMessage: e.message }
    ctx.app.emit('error', e, ctx)
  }
})

// Use REST API Router
// router.configure(app)

const io = socketio.listen(app)

// TODO Build for production using TLS
// Start app
// if (config.app.env === 'production') {
//   try {
//     const options = {
//       key: fs.readFileSync(config.app.ssl.key),
//       cert: fs.readFileSync(config.app.ssl.cert),
//     }

//     app.use(enforceHttps())
//     app.server = http2.createServer(options, app.callback()).listen(config.app.port)
//   } catch (err) {
//     // Should not possible to start production server without SSL certificates
//     console.log('ERROR: Impossible to start server. Exiting...')
//     throw err
//   }
// } else { }

// app.server = http.createServer(app.callback()).listen(3000)

const port = process.argv[2] || 5555
app.server = http.createServer(app.callback()).listen(port)

logger.info(`Server started, listening on port: ${port}`)
logger.info(`Service: Humax bandwidth limiter`)
logger.info(`Environment: ${process.env.NODE_ENV}`)

// TODO Refactor sockend, publishers and subscribers
io.on('connection', socket => {
  // TODO Detect device IP address and use it as a room name
  const room = 'room1'
  socket.join(room)
})

const sockend = new cote.Sockend(io, {
  name: 'Humax Sockend bandwidth limiter server',
  key: 'state'
})

const humaxPublisher = new cote.Publisher({
  name: 'humax publisher',
  namespace: 'humax',
  broadcasts: ['updateState'],
})

io.on('changeChannel', socket => {
  // const socketRoom = socket.room
  // TODO Update humax state to all devices from the same IP address
  // const state = { test: 'test }
  // humaxPublisher.publish('updateState', { state, __room: 'room1' });
})

const updateSubscriber = new cote.Subscriber({
  name: 'Humax bandwidth notification subscriber',
  namespace: 'humax',
  key: 'state',
  subscribesTo: ['updateState'],
})

updateSubscriber.on('updateState', request => {
  logger.info(`Subscriber is notified of ${request}`)
})

// Graceful shutdown
const shutdown = () => {
  logger.info(`Graceful shutdown start ${new Date().toISOString()}`)
  app.server.close()
  process.exit()
}

process.on('SIGTERM', () => {
  shutdown()
})

process.on('SIGINT', () => {
  shutdown()
})
