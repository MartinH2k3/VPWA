import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Channel from '#models/channel'

export default class IsMemberMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { channelId } = ctx.params
    const userId = ctx.auth.user!.id

    try {
      const channel = await Channel.query()
        .where('id', channelId)
        .whereHas('members', (query) => {
          query.where('user_id', userId).where('banned', false)
        })
        .first()

      if (!channel) {
        ctx.response.status(401)
        return ctx.response.redirect().toPath('/')
      }

      await next()
    } catch (e) {
      ctx.response.status(500)
      return ctx.response.redirect().toPath('/')
    }
  }
}
