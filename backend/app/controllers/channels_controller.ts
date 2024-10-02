import { HttpContext } from '@adonisjs/core/http'
import Channel from '#models/channel'

export default class ChannelsController {
  async join({ request, auth, response }: HttpContext) {
    const { channelName, isPrivate } = request.only(['channelName', 'isPrivate'])
    const userId = auth.user?.id
    if (!userId) {
      return response.unauthorized({ message: 'User must be authenticated' })
    }

    const existingChannel = await Channel.query().where('name', channelName).first()

    // if channel exists, try to join
    if (existingChannel) {
      if (existingChannel.isPrivate) {
        return response.forbidden({ message: 'This channel is private and cannot be joined.' })
      }

      const isAlreadyMember = await existingChannel
        .related('members')
        .query()
        .where('user_id', userId)
        .first()
      // can't be member twice, duh
      if (isAlreadyMember) {
        return response.badRequest({ message: 'User already joined this channel' })
      }
      await existingChannel.related('members').attach([userId])
      return existingChannel
    } else {
      const channel = await Channel.create({
        name: channelName,
        adminId: userId, // The user who creates the channel becomes the admin
        isPrivate: !!isPrivate, // You can set default visibility or get it from the request
      })

      // Auto-join the admin to the channel
      await channel.related('members').attach([userId])

      return channel
    }
  }

}
