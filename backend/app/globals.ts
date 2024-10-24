import User from '#models/user'
import SocketSession from './handlers/SocketSession.js'

interface PendingWebSocketAuthentificationRequest {
  user: User
  token: string
}

class SocketSessions extends Array<SocketSession> {
  getWithActiveChannel(channelName: string) {
    return this.filter(session => session.activeChannelName === channelName)
  }
  get(userId: number) {
    return this.find(session => session.user.id === userId)
  }
}

let pendingAuthentificationRequests: PendingWebSocketAuthentificationRequest[] = []
let socketSessions: SocketSessions = new SocketSessions()


export { pendingAuthentificationRequests, socketSessions }
