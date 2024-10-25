import WebSocket from 'ws'
import Channel from '#models/channel'
import Message from '#models/message'
import User from '#models/user'
import { socketSessions } from '../globals.js'
export default class SocketSession {
  user: User
  ws: WebSocket
  activeChannelName: string | null = null

  // constructor
  constructor(ws: WebSocket, user: User) {
    this.ws = ws
    this.user = user
  }

  async receiveMessage(event: string, data: any) {
    switch (event) {
      case 'message':
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

        socketSessions.getWithActiveChannel(data.channelName).forEach((session) => {
          if (session === this) return
          console.log('Sending message to', session.user.username)
          session.send('add_message', {
            messageId: message.id,
            messageContent: message.content,
            channelName: data.channelName,
            username: this.user.username,
          })
        })
        break

      case 'update_active_channel':
        this.activeChannelName = data.channelName
        console.log('Updated active channel for', this.user.username, 'to', this.activeChannelName)

        break

      case 'get_message':
        this.getMessage(data.message, data.channel)
        break
      case 'add_channel':
        this.addChannel(data.channel)
        break
      case 'remove_channel':
        this.removeChannel(data.channel)
        break
      case 'send_notification':
        this.sendNotification(data.notification)
        break
      default:
        console.error('Invalid event')
    }
  }

  async createMessage(message: string, channelName: string) {
    console.log('Received message', message)

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

  getMessage(message: any, channel: Channel) {}
  addChannel(channel: Channel) {
    this.send('add_channel', channel)
  }
  kick(channel: Channel) {
    this.send('kick', channel)
  }
  removeChannel(channel: Channel) {
    this.send('remove_channel', channel)
  }
  sendNotification(notification: any) {
    this.send('notification', notification)
  }

  send(event: string, data: any) {
    this.ws.send(JSON.stringify({ event, data }))
  }
}
