import WebSocket from 'ws'
import Channel from '#models/channel'
import Message from '#models/message'
import User from '#models/user'
import { socketSessions } from '../globals.js'
export default class SocketSession {
  user: User
  ws: WebSocket
  activeChannelName: string | null = null
  status: 'online' | 'offline' | 'away' = 'offline'
  onlyMentions: boolean = false
  // A variable to represent the channels the user is in
  channels: string[] = []

  // constructor
  constructor(ws: WebSocket, user: User, channels: Channel[] = []) {
    this.ws = ws
    this.user = user
    this.channels = channels.map((c) => c.name)
  }

  addToJoinedChannels(channelName: string) {
    this.channels.push(channelName)
  }
  removeFromJoinedChannels(channelName: string) {
    const index = this.channels.indexOf(channelName)
    if (index !== -1) {
      this.channels.splice(index, 1)
    }
  }
  isInChannel(channelName: string) {
    return this.channels.includes(channelName)
  }

  private checkMention(message: string, username: string) {
    return message.includes(`@${username}`)
  }

  async receive(event: string, data: any) {
    switch (event) {
      case 'message':
        if (!this.isInChannel(data.channelName)) return

        if (!data.message || !data.channelName) {
          console.error('Invalid message')
          return
        }
        const message = await this.createMessage(data.message, data.channelName)
        if (!message) {
          console.error('Failed to create message')
          return
        }
        // Add message to all users in the channel
        console.log('Sending message to all users in the channel')

        socketSessions.getForActiveChannel(data.channelName).forEach((session) => {
          if (session === this) return
          console.log('Sending message to', session.user.username)
          session.send('add_message', {
            messageId: message.id,
            messageContent: message.content,
            channelName: data.channelName,
            username: this.user.username,
          })
        })
        // send notifications to all channel members
        // Don't send to people with offline|away. Don't send to the sender or people with channel open
        // if only mentions is on for user, only send if mentioned
        socketSessions.forEach((session) => {
          if (
            session === this ||
            !session.isInChannel(data.channelName) ||
            session.status === 'offline' ||
            session.activeChannelName === data.channelName ||
            (session.status === 'away' && !this.checkMention(data.message, session.user.username!))
          ) {
            return
          }
          session.send('notification', {
            messageId: message.id,
            messageContent: message.content.slice(0, 50),
            channelName: data.channelName,
            username: this.user.username,
          })
        })
        break

      case 'update_status':
        if (!data.status || !['online', 'offline', 'away'].includes(data.status)) {
          console.error('Invalid status')
          return
        }

        this.status = data.status
        break

      case 'update_active_channel':
        if (!this.isInChannel(data.channelName)) return
        this.activeChannelName = data.channelName

        break
      case 'typing':
        if (!this.isInChannel(data.channelName)) return
        // Send the draft content to all users in the channel

        socketSessions.getForActiveChannel(data.channelName).forEach((session) => {
          if (session === this || session.status === 'offline') return
          session.send('message_draft', {
            username: this.user.username,
            content: data.content,
            channelName: data.channelName,
          })
        })

        break
      case 'stop_typing':
        if (!this.isInChannel(data.channelName)) return
        // Remove the draft content from all users in the channel
        socketSessions.getForActiveChannel(data.channelName).forEach((session) => {
          if (session === this || session.status === 'offline') return
          console.log('Removing draft from', session.user.username)
          session.send('remove_message_draft', {
            username: this.user.username,
            channelName: data.channelName,
          })
        })
        break

      case 'add_channel':
        this.addChannel(data.channel)
        break
      case 'remove_channel':
        this.removeChannel(data.channel)
        break
      default:
        console.error('Invalid event')
    }
  }

  async createMessage(message: string, channelName: string) {

    const user = this.user
    if (!user) {
      console.error('User not authenticated')
      return
    }
    const channel = await Channel.findBy('name', channelName)
    if (!channel) {
      console.error('Channel not found')
      return
    }
    return await Message.create({
      content: message,
      user_id: user.id,
      channel_id: channel.id,
    })
  }

  addChannel(channel: Channel) {
    this.addToJoinedChannels(channel.name)
    this.send('add_channel', channel)
  }
  kick(channelName: string) {
    this.removeFromJoinedChannels(channelName)
    this.activeChannelName = null
    this.send('kick', { channelName })
  }
  removeChannel(channel: Channel) {
    this.removeFromJoinedChannels(channel.name)
    this.send('remove_channel', channel)
  }

  send(eventName: string, data: any) {
    this.ws.send(JSON.stringify({ event: eventName, data }))
  }
}
