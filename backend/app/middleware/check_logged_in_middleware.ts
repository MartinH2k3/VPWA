import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class CheckLoggedInMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { auth, response } = ctx
    if (await auth.check()) {
      return response.status(400).send({ error: 'User is already logged in' })
    }
    await next()
  }
}
