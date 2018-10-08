// @flow

import Router from 'koa-joi-router'
// import controller from './../controllers/controller'

// TODO Implement endpoints

const { Joi } = Router
const router = Router()

const routes = [
  {
    method: 'get',
    path: '/',
    handler: () => {},
    // handler: controller.get,
  },
]

router.route(routes)

export default router
