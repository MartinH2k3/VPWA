import User from '#models/user'
import SocketSession from './handlers/SocketSession.js'

interface PendingWebSocketAuthentificationRequest {
  user: User
  token: string
}

let pendingAuthentificationRequests: PendingWebSocketAuthentificationRequest[] = []
let socketSessions: SocketSession[] = []


export { pendingAuthentificationRequests, socketSessions }
