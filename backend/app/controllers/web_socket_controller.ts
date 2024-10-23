import { HttpContext } from '@adonisjs/core/http'
import { ActiveSocket } from '#start/ws'
import Channel from '#models/channel'
import User from '#models/user'
export default class WebSocketController {

  getMessage(socket: ActiveSocket, message: any, channel: Channel) {

  } //TODO type Message
  addChannel(socket: ActiveSocket, channel: Channel) {

  }
  removeChannel(socket: ActiveSocket, channel: Channel) {

  }
  sendNotification(socket: ActiveSocket, notification: any) {

  } //TODO type Notification


}
