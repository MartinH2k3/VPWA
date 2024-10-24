import Channel from '#models/channel'
import Message from '#models/message'
import User from '#models/user'
export default class SocketSession {

  user: User;
  ws: WebSocket;

  // constructor
  constructor(ws: WebSocket, user: User) {
    this.ws = ws
    this.user = user
  }

  receiveMessage(event: string, data: any) {
    switch (event) {
      case 'message':
        this.createMessage(data.message, data.channelName)
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
    console.log('Received message', message);

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
    const newMessage = await Message.create({
      content: message,
      user_id: user.id,
      channel_id: channel.id
    })
  }

  getMessage(message: any, channel: Channel) {

  } //TODO type Message
  addChannel(channel: Channel) {

  }
  removeChannel(channel: Channel) {

  }
  sendNotification(notification: any) {

  } //TODO type Notification


  send(event: string, data: any) {
    this.ws.send(JSON.stringify({ event, data }))
  }

}
