import { HttpContext } from '@adonisjs/core/http'
import { ActiveSocket } from '#start/ws'
import Channel from '#models/channel'
import Message from '#models/message'
import User from '#models/user'

export default class ChannelsController {
  async index({ auth }: HttpContext) {
    const userId = auth.user!.id
    if (!userId) {
      return []
    }
    const channels = await Channel.query().whereHas('members', (query) => {
      query.where('user_id', userId)
    }).orderBy('created_at', 'desc');

    return channels
  }

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
      return response.ok(channel)
    }
  }

  async cancel({ params, auth, response }: HttpContext) {
    const { channelName } = params
    const userId = auth.user!.id
    try {
      const channel = await Channel.findBy('name', channelName)
      if (!channel) {
        return response.notFound({ message: 'No active channel' })
      }
      if (channel?.adminId === userId) {
        // get all channel members
        const members = await channel.related('members').query()
        // for all sockets, remove the channel
        for (const member of members) {
          const activeSocket = (global as any).activeSockets.find(
            (socket: ActiveSocket) => socket.user.id === member.id
          )
          if (activeSocket) {
            activeSocket.removeChannel(channel)
          }
        }
        channel?.delete()
        return response.ok(`Successfully deleted the channel ${channel?.name}`)
      }
      const pivotRow = await channel
        .related('members')
        .pivotQuery()
        .where('user_id', userId)
        .first()
      if (pivotRow?.kicked) {
        return response.badRequest({ message: 'You are banned from the channel' })
      }
      await channel?.related('members').detach([userId])
      const activeSocket = (global as any).activeSockets.find(
        (socket: ActiveSocket) => socket.user.id === userId
      )
      if (activeSocket) {
        activeSocket.removeChannel(channel)
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

  async invite({ params, request, auth, response }: HttpContext) {
    const { channelName } = params
    const { username } = request.only(['username'])
    const userId = auth.user!.id

    if (!userId) {
      return response.unauthorized({ message: 'User must be authenticated' })
    }

    try {
      const invitedUser = await User.findBy('username', username)
      const channel = await Channel.findBy('name', channelName)

      if (!invitedUser || !channel) {
        return response.notFound({ message: 'Invalid request' })
      }

      const pivotRow = await channel
        .related('members')
        .pivotQuery()
        .where('user_id', invitedUser.id)
        .first()
      if (pivotRow) {
        if (pivotRow.kicked && channel.adminId === userId) {
          // Unban the user
          await channel.related('members').sync(
            {
              [invitedUser.id]: {
                kicked: false,
              },
            },
            false
          )

          // adding channel to user's active channels
          const activeSocket = (global as any).activeSockets.find(
            (socket: ActiveSocket) => socket.user.id === invitedUser.id
          )
          if (activeSocket) {
            activeSocket.addChannel(channel)
          }

          return response.ok({ message: `${username} has been unbanned from the channel` })
        }
        return response.badRequest({ message: 'User is already a member of the channel' })
      }

      if (channel.isPrivate && channel.adminId !== userId) {
        return response.forbidden({ message: 'You are not allowed to invite to this channel' })
      }

      // TODO notify the user that got invited
      await channel.related('members').attach([invitedUser.id])

      // adding channel to user's active channels
      const activeSocket = (global as any).activeSockets.find(
        (socket: ActiveSocket) => socket.user.id === invitedUser.id
      )
      if (activeSocket) {
        activeSocket.addChannel(channel)
      }

      return response.ok({ message: `${username} has been invited to the channel` })
    } catch (e) {
      console.log(e)
      return response.badRequest(e)
    }
  }


  async messages({ params, request, response }: HttpContext) {

    const { channelName } = params
    const { limit, cursor } = request.only(['limit', 'cursor'])
    const channel = await Channel.findBy('name', channelName)
    if (!channel) {
      return response.notFound({ message: 'Channel not found' })
    }
    const messages = await Message.query().where('channel_id', channel.id).orderBy('created_at', 'desc').limit(limit).offset(cursor)
    return messages
  }

  async test({ auth }: HttpContext) {
    const userId = 1
    const activeSocket = (global as any).activeSockets.find(
      (socket: ActiveSocket) => socket.user.id === userId
    )
    if (activeSocket) {
      activeSocket.addChannel({
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        name: 'test',
        adminId: auth.user!.id,
        private: false,
      })
    }
  }
}
