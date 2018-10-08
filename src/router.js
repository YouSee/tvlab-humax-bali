// @flow

import defaultRouter from './routes/default'

const routes = [defaultRouter]
const router = {}

router.configure = (app: any) => {
  routes.forEach(e => {
    app.use(e.middleware())
  })
}

export default router
