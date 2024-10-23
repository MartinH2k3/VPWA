import { ActiveSocket } from '#start/ws'
import Channel from '#models/channel'
import Message from '#models/message'
import User from '#models/user'
export default class WebSocketController {
  static async sendMessage(socket: ActiveSocket, message: string, channelName: string) {
    console.log('Received message', message);

    const user = socket.user
    if (!user) {
      console.error('User not authenticated')
      return
    }
    const channel = await Channel.findBy('name', channelName)
    if (!channel) {
      console.error('Channel not found')
      return
    }
    const newMessage = await Message.create({
      content: message,
      user_id: user.id,
      channel_id: channel.id
    })
  }

  static getMessage(socket: ActiveSocket, message: any, channel: Channel) {

  } //TODO type Message
  static addChannel(socket: ActiveSocket, channel: Channel) {

  }
  static removeChannel(socket: ActiveSocket, channel: Channel) {

  }
  static sendNotification(socket: ActiveSocket, notification: any) {

  } //TODO type Notification


}
