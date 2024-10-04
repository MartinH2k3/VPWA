import { HttpContext } from '@adonisjs/core/http'
import Channel from '#models/channel'
import { ActiveSocket } from '#start/ws'
import User from '#models/user'

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
      // const activeSocket = (global as any).activeSockets.find(
      //   (socket: ActiveSocket) => socket.user.id === userId
      // )
      // if (activeSocket) {
      //   activeSocket.methods.addChannel(channel)
      // }
      return response.ok(channel)
    }
  }

  async leave({ params, auth, response }: HttpContext) {
    const { channelName } = params
    const userId = auth.user!.id
    console.log(userId)
    try {
      const channel = await Channel.findBy('name', channelName)
      if (channel?.adminId === userId) {
        // get all channel members
        const members = await channel.related('members').query()
        // for all sockets, remove the channel
        for (const member of members) {
          const activeSocket = (global as any).activeSockets.find(
            (socket: ActiveSocket) => socket.user.id === member.id
          )
          if (activeSocket) {
            activeSocket.methods.removeChannel(channel)
          }
        }
        channel?.delete()
        return response.ok(`Successfully deleted the channel ${channel?.name}`)
      }
      await channel?.related('members').detach([userId])
      const activeSocket = (global as any).activeSockets.find(
        (socket: ActiveSocket) => socket.user.id === userId
      )
      if (activeSocket) {
        activeSocket.methods.removeChannel(channel)
      }
      return response.ok(`Successfully left the channel ${channel?.name}`)
    } catch (e) {
      return response.badRequest(e)
    }
  }

  async kick({ params, request, auth, response }: HttpContext) {
    const { channelName } = params
    const { username } = request.only(['username'])
    const userId = auth.user!.id
    if (!userId) {
      return response.unauthorized({ message: 'User must be authenticated' })
    }
    try {
      const kickedUser = await User.findBy('username', username)
      const channel = await Channel.findBy('name', channelName)
      if (!kickedUser || !channel) {
        return response.notFound({ message: 'Invalid request' })
      }
      const pivotRow = await channel
        .related('members')
        .pivotQuery()
        .where('user_id', kickedUser.id)
        .first()
      if (!pivotRow) {
        return response.notFound({ message: 'User is not a member of the channel' })
      }
      if (channel.adminId === kickedUser.id) {
        return response.badRequest({ message: 'Admin cannot be kicked' })
      }
      const kickVotes = pivotRow.kick_votes
      if (kickVotes >= 2 || channel.adminId === userId) {
        // TODO notify the user that got kicked
        // Set the user as banned in the pivot table
        await channel.related('members').sync(
          {
            [kickedUser.id]: {
              kicked: true,
            },
          },
          false // true means rewriting pivot table, false means updating
        )
        // TODO notify the user that got kicked
        const activeSocket = (global as any).activeSockets.find(
          (socket: ActiveSocket) => socket.user.id === kickedUser.id
        )
        if (activeSocket) {
          activeSocket.removeChannel(channel)
        }
        return response.ok({ message: `${username} has been banned from the channel` })
      } else {
        await channel.related('members').sync(
          {
            [kickedUser.id]: {
              kick_votes: kickVotes,
            },
          },
          false
        )
        return response.ok({ message: `Kick votes for ${username} have been incremented` })
      }
    } catch (e) {
      console.log(e)
      return response.badRequest(e)
    }
  }
}
