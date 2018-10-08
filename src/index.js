// @flow

import http from 'http'
import http2 from 'spdy'
import fs from 'fs'
import Koa from 'koa'
import helmet from 'koa-helmet'
import logger from 'koa-logger'
import enforceHttps from 'koa-sslify'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import router from './router'

const app = new Koa()
app
  .use(logger())
  .use(cors())
  .use(helmet())
  .use(bodyParser({ jsonLimit: '2mb' }))

// Error handler
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    // console.log(e)
    ctx.status = e.status || 500
    ctx.body = { error: e, errorMessage: e.message }
    ctx.app.emit('error', e, ctx)
  }
})

router.configure(app)

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

app.server = http.createServer(app.callback()).listen(3000)

// TODO Remove console.log
// console.log(`Server started, listening on port: ${config.app.port}`)
// console.log(`Service: ${config.app.name}`)
// console.log(`Environment: ${config.app.env}`)

export default app.server
