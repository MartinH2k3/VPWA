import { HttpContext } from '@adonisjs/core/http'
import { socketSessions } from '../globals.js'
import Channel from '#models/channel'
import Message from '#models/message'
import User from '#models/user'

export default class ChannelsController {
  async index({ auth }: HttpContext) {
    const userId = auth.user!.id
    if (!userId) {
      return []
    }
    return Channel.query()
      .whereHas('members', (query) => {
        query.where('user_id', userId).wherePivot('kicked', false)
      })
      .orderBy('created_at', 'desc')
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
      if (existingChannel.is_private) {
        return response.unauthorized({ message: 'This channel is private and cannot be joined.' })
      }
      const isAlreadyMember = await existingChannel
        .related('members')
        .query()
        .where('user_id', userId)
        .first()
      // can't be member twice, duh
      if (isAlreadyMember) {
        return response.badRequest({
          message:
            "You already joined this channel. If you don't see it in channel list, you have been banned.",
        })
      }
      await existingChannel.related('members').attach([userId])
      const socketSession = socketSessions.getUserSession(userId)
      if (socketSession) {
        socketSession.addToJoinedChannels(existingChannel.name)
      }
      await socketSessions.updateChannelMembers(existingChannel.name)
      return existingChannel
    } else {
      const channel = await Channel.create({
        name: channelName,
        admin_id: userId, // The user who creates the channel becomes the admin
        is_private: !!isPrivate, // You can set default visibility or get it from the request
      })

      // Auto-join the admin to the channel
      await channel.related('members').attach([userId])
      const socketSession = socketSessions.getUserSession(userId)
      if (socketSession) {
        socketSession.addToJoinedChannels(channel.name)
      }
      await socketSessions.updateChannelMembers(channel.name)
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
      if (channel?.admin_id === userId) {
        // get all channel members
        const members = await channel.related('members').query()
        // for all sockets, remove the channel
        for (const member of members) {
          const socketSession = socketSessions.getUserSession(member.id)
          if (socketSession) {
            socketSession.removeChannel(channel)
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
      const socketSession = socketSessions.getUserSession(userId)
      if (socketSession) {
        socketSession.removeChannel(channel)
      }
      await socketSessions.updateChannelMembers(channel.name)
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
      if (!kickedUser || !channel) return response.notFound({ message: 'Invalid request' })

      const pivotRow = await channel
        .related('members')
        .pivotQuery()
        .where('user_id', kickedUser.id)
        .first()

      if (!pivotRow) return response.notFound({ message: 'User is not a member of the channel' })

      if (channel.admin_id === kickedUser.id)
        return response.badRequest({ message: 'Admin cannot be kicked' })

      const kickVotes = pivotRow.kick_votes
      if (kickVotes >= 2 || channel.admin_id === userId) {
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
        const socketSession = socketSessions.getUserSession(kickedUser.id)
        if (socketSession) {
          socketSession.kick(channel.name)
        }
        await socketSessions.updateChannelMembers(channel.name)
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
        if (pivotRow.kicked && channel.admin_id === userId) {
          // Unban the user
          await channel.related('members').sync(
            {
              [invitedUser.id]: {
                kicked: false,
              },
            },
            false
          )

          // adding channel to user's channels
          const socketSession = socketSessions.getUserSession(invitedUser.id)
          if (socketSession) {
            socketSession.addChannel(channel)
          }

          await socketSessions.updateChannelMembers(channel.name)
          return response.ok({ message: `${username} has been unbanned from the channel` })
        }
        return response.badRequest({ message: 'User is already a member of the channel' })
      }

      if (channel.is_private && channel.admin_id !== userId) {
        return response.forbidden({ message: 'You are not allowed to invite to this channel' })
      }

      // TODO notify the user that got invited
      await channel.related('members').attach([invitedUser.id])

      // adding channel to user's active channels
      const socketSession = socketSessions.getUserSession(invitedUser.id)
      if (socketSession) {
        socketSession.addChannel(channel)
      }

      await socketSessions.updateChannelMembers(channel.name)
      return response.ok({ message: `${username} has been invited to the channel` })
    } catch (e) {
      console.log(e)
      return response.badRequest(e)
    }
  }

  async members({ params, auth, response }: HttpContext) {
    const { channelName } = params
    const channel = await Channel.findBy('name', channelName)
    if (!channel) {
      return response.notFound({ message: 'Channel not found' })
    }
    // make sure the user is a member of the channel
    const userId = auth.user!.id
    const isMember = await channel.related('members').query().where('user_id', userId).first()
    if (!isMember) {
      return response.forbidden({ message: 'You are not a member of this channel' })
    }
    setTimeout(() => {
      socketSessions.updateChannelMembers(channelName)
    }, 100);
    return await channel.related('members').query().where('kicked', false)
  }

  async messages({ params, request, response }: HttpContext) {
    const { channelName } = params
    const { limit, cursor } = request.only(['limit', 'cursor'])
    const channel = await Channel.findBy('name', channelName)
    if (!channel) {
      return response.notFound({ message: 'Channel not found' })
    }
    return Message.query()
      .where('channel_id', channel.id)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(cursor)
      .preload('user', (query) => {
        query.select('username')
      })
  }
}
